"""Leakage-safe direct multi-horizon forecasting for River EC."""

from __future__ import annotations

import csv
import json
import math
import pickle
import statistics
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from sklearn.ensemble import RandomForestRegressor


TARGET = "river_ec_us_cm"
HORIZONS = (1, 2, 3, 4, 5, 6)
FEATURE_NAMES = (
    "ec_current", "lag_1", "lag_2", "lag_3", "lag_6", "lag_12", "lag_24",
    "rolling_mean_3", "rolling_mean_6", "rolling_mean_12",
    "rolling_std_3", "rolling_std_6", "rolling_std_12",
    "diff_1", "diff_3", "diff_6", "river_level_m", "qnt_m3_h",
    "target_hour_sin", "target_hour_cos", "target_day_of_week", "target_weekend",
)


@dataclass(frozen=True)
class ForecastSample:
    """A target observation with features available strictly at the forecast origin."""

    origin_timestamp: str
    target_timestamp: str
    horizon_hours: int
    features: tuple[float, ...]
    target: float
    persistence: float
    moving_average: float


def _value(raw_value: str | None) -> float | None:
    """Parse an optional numeric CSV cell."""
    return None if raw_value is None or raw_value.strip() == "" else float(raw_value)


def _round(value: float | None, digits: int = 4) -> float | None:
    """Round optional report values."""
    return None if value is None else round(value, digits)


def _metrics(actual: list[float], predicted: list[float]) -> dict[str, float | None]:
    """Calculate regression metrics with MAPE only where mathematically valid."""
    errors = [observed - estimate for observed, estimate in zip(actual, predicted)]
    mae = sum(abs(error) for error in errors) / len(errors)
    rmse = math.sqrt(sum(error ** 2 for error in errors) / len(errors))
    mape_values = [abs(error / observed) * 100 for observed, error in zip(actual, errors) if observed != 0]
    mean_actual = statistics.fmean(actual)
    total_sum_squares = sum((observed - mean_actual) ** 2 for observed in actual)
    residual_sum_squares = sum(error ** 2 for error in errors)
    return {
        "mae": _round(mae),
        "rmse": _round(rmse),
        "mape_percent": _round(statistics.fmean(mape_values)) if mape_values else None,
        "r2": _round(1 - residual_sum_squares / total_sum_squares) if total_sum_squares else None,
    }


class RiverEcForecaster:
    """Build direct horizon models and evaluate them with chronological splits."""

    def __init__(
        self,
        train_fraction: float = 0.70,
        validation_fraction: float = 0.15,
        moving_average_window: int = 6,
        random_state: int = 42,
    ) -> None:
        if not 0 < train_fraction < 1 or not 0 < validation_fraction < 1 or train_fraction + validation_fraction >= 1:
            raise ValueError("Train and validation fractions must be positive and leave a test period.")
        self.train_fraction = train_fraction
        self.validation_fraction = validation_fraction
        self.moving_average_window = moving_average_window
        self.random_state = random_state

    def run(self, input_path: Path, output_dir: Path, model_dir: Path) -> dict[str, Any]:
        """Train/evaluate each direct horizon and write reproducible artifacts."""
        rows = self._read_rows(input_path)
        split_boundaries = self._split_boundaries(len(rows))
        output_dir.mkdir(parents=True, exist_ok=True)
        model_dir.mkdir(parents=True, exist_ok=True)
        metric_rows: list[dict[str, Any]] = []
        prediction_rows: list[dict[str, Any]] = []
        next_forecast_rows: list[dict[str, Any]] = []
        selected_models: dict[int, str] = {}

        for horizon in HORIZONS:
            samples = self._build_samples(rows, horizon)
            split_samples = self._split_samples(samples, rows, split_boundaries)
            self._require_split_samples(split_samples, horizon)
            models = self._fit_models(split_samples["train"])
            validation_scores = self._evaluate_models(models, split_samples["validation"])
            selected_model = min(validation_scores, key=lambda name: validation_scores[name]["rmse"] or float("inf"))
            selected_models[horizon] = selected_model
            test_scores, test_predictions = self._evaluate_models_with_predictions(models, split_samples["test"])
            for model_name, scores in test_scores.items():
                metric_rows.append({
                    "horizon_hours": horizon,
                    "model": model_name,
                    "split": "test",
                    "observations": len(split_samples["test"]),
                    "selection_metric": "validation_rmse",
                    "validation_rmse": validation_scores[model_name]["rmse"],
                    "selected_for_operational_forecast": model_name == selected_model,
                    **scores,
                })
            for model_name, predictions in test_predictions.items():
                for sample, prediction in zip(split_samples["test"], predictions):
                    prediction_rows.append({
                        "origin_timestamp": sample.origin_timestamp,
                        "target_timestamp": sample.target_timestamp,
                        "horizon_hours": horizon,
                        "model": model_name,
                        "actual": _round(sample.target),
                        "prediction": _round(prediction),
                        "absolute_error": _round(abs(sample.target - prediction)),
                    })

            final_models = self._fit_models(split_samples["train"] + split_samples["validation"])
            with (model_dir / f"river_ec_h{horizon}_{selected_model}.pkl").open("wb") as file:
                pickle.dump({
                    "target": TARGET,
                    "horizon_hours": horizon,
                    "feature_names": FEATURE_NAMES,
                    "model_name": selected_model,
                    "model": final_models[selected_model],
                    "training_policy": "refit_on_train_plus_validation_after_held_out_test_evaluation",
                }, file)
            forecast = self._forecast_latest(rows, horizon, final_models[selected_model], selected_model)
            next_forecast_rows.append(forecast)

        self._write_csv(output_dir / "forecast_metrics.csv", metric_rows)
        self._write_csv(output_dir / "forecast_test_predictions.csv", prediction_rows)
        self._write_csv(output_dir / "river_ec_next_6h_forecast.csv", next_forecast_rows)
        summary = self._summary(input_path, rows, split_boundaries, metric_rows, selected_models)
        (output_dir / "forecast_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        self._write_report(output_dir / "forecast_report.md", summary)
        return summary

    @staticmethod
    def _read_rows(path: Path) -> list[dict[str, str]]:
        if not path.is_file():
            raise FileNotFoundError(f"Cleaned input does not exist: {path}")
        with path.open(encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            if not reader.fieldnames or not {"timestamp", TARGET, "river_level_m", "qnt_m3_h"}.issubset(reader.fieldnames):
                raise ValueError("Input must include timestamp, river_ec_us_cm, river_level_m and qnt_m3_h.")
            rows = list(reader)
        if any(datetime.fromisoformat(row.get("timestamp", "")) > datetime.fromisoformat(next_row.get("timestamp", "")) for row, next_row in zip(rows, rows[1:]) if row.get("timestamp") and next_row.get("timestamp")):
            raise ValueError("Input must be sorted chronologically before forecasting.")
        return rows

    def _split_boundaries(self, length: int) -> dict[str, int]:
        return {
            "train_end": int(length * self.train_fraction),
            "validation_end": int(length * (self.train_fraction + self.validation_fraction)),
        }

    def _build_samples(self, rows: list[dict[str, str]], horizon: int) -> list[ForecastSample]:
        target_values = [_value(row.get(TARGET)) for row in rows]
        samples = []
        required_lag = 24
        for origin_index in range(required_lag, len(rows) - horizon):
            target_index = origin_index + horizon
            target = target_values[target_index]
            historical = target_values[:origin_index + 1]
            river_level, qnt = _value(rows[origin_index]["river_level_m"]), _value(rows[origin_index]["qnt_m3_h"])
            if target is None or river_level is None or qnt is None:
                continue
            required_history = [historical[origin_index - lag] for lag in (0, 1, 2, 3, 6, 12, 24)]
            rolling_12 = historical[origin_index - 11:origin_index + 1]
            if any(value is None for value in required_history) or any(value is None for value in rolling_12):
                continue
            current = historical[origin_index]
            assert current is not None
            target_time = datetime.fromisoformat(rows[target_index]["timestamp"])
            means = [statistics.fmean(historical[origin_index - window + 1:origin_index + 1]) for window in (3, 6, 12)]
            stds = [statistics.stdev(historical[origin_index - window + 1:origin_index + 1]) for window in (3, 6, 12)]
            features = (
                current, historical[origin_index - 1], historical[origin_index - 2], historical[origin_index - 3],
                historical[origin_index - 6], historical[origin_index - 12], historical[origin_index - 24],
                *means, *stds,
                current - historical[origin_index - 1], current - historical[origin_index - 3], current - historical[origin_index - 6],
                river_level, qnt,
                math.sin(2 * math.pi * target_time.hour / 24), math.cos(2 * math.pi * target_time.hour / 24),
                float(target_time.weekday()), float(target_time.weekday() >= 5),
            )
            samples.append(ForecastSample(
                origin_timestamp=rows[origin_index]["timestamp"], target_timestamp=rows[target_index]["timestamp"],
                horizon_hours=horizon, features=tuple(float(value) for value in features), target=target,
                persistence=current, moving_average=means[1],
            ))
        return samples

    @staticmethod
    def _split_samples(samples: list[ForecastSample], rows: list[dict[str, str]], boundaries: dict[str, int]) -> dict[str, list[ForecastSample]]:
        train_cutoff = rows[boundaries["train_end"] - 1]["timestamp"]
        validation_cutoff = rows[boundaries["validation_end"] - 1]["timestamp"]
        split = {"train": [], "validation": [], "test": []}
        for sample in samples:
            if sample.target_timestamp <= train_cutoff:
                split["train"].append(sample)
            elif sample.target_timestamp <= validation_cutoff:
                split["validation"].append(sample)
            else:
                split["test"].append(sample)
        return split

    @staticmethod
    def _require_split_samples(split_samples: dict[str, list[ForecastSample]], horizon: int) -> None:
        if any(not samples for samples in split_samples.values()):
            counts = {name: len(samples) for name, samples in split_samples.items()}
            raise ValueError(f"Insufficient valid samples for horizon {horizon}: {counts}")

    def _fit_models(self, samples: list[ForecastSample]) -> dict[str, Any]:
        features = [sample.features for sample in samples]
        target = [sample.target for sample in samples]
        random_forest = RandomForestRegressor(
            n_estimators=250,
            min_samples_leaf=2,
            random_state=self.random_state,
            n_jobs=-1,
        ).fit(features, target)
        return {"persistence": None, "moving_average_6": None, "random_forest": random_forest}

    @staticmethod
    def _predictions(models: dict[str, Any], samples: list[ForecastSample]) -> dict[str, list[float]]:
        return {
            "persistence": [sample.persistence for sample in samples],
            "moving_average_6": [sample.moving_average for sample in samples],
            "random_forest": list(models["random_forest"].predict([sample.features for sample in samples])),
        }

    def _evaluate_models(self, models: dict[str, Any], samples: list[ForecastSample]) -> dict[str, dict[str, float | None]]:
        actual = [sample.target for sample in samples]
        return {name: _metrics(actual, predictions) for name, predictions in self._predictions(models, samples).items()}

    def _evaluate_models_with_predictions(self, models: dict[str, Any], samples: list[ForecastSample]) -> tuple[dict[str, dict[str, float | None]], dict[str, list[float]]]:
        predictions = self._predictions(models, samples)
        actual = [sample.target for sample in samples]
        return ({name: _metrics(actual, values) for name, values in predictions.items()}, predictions)

    def _forecast_latest(self, rows: list[dict[str, str]], horizon: int, model: Any, model_name: str) -> dict[str, Any]:
        # Construct features from the final observed origin only; no synthetic
        # future rows are created for operational forecasting.
        origin_index = len(rows) - 1
        target_values = [_value(row.get(TARGET)) for row in rows]
        history = target_values
        if origin_index < 24 or any(history[origin_index - lag] is None for lag in (0, 1, 2, 3, 6, 12, 24)):
            raise ValueError("Latest record lacks required EC history for next-6-hour forecast.")
        target_time = datetime.fromisoformat(rows[-1]["timestamp"]) + timedelta(hours=horizon)
        means = [statistics.fmean(history[origin_index - window + 1:origin_index + 1]) for window in (3, 6, 12)]
        stds = [statistics.stdev(history[origin_index - window + 1:origin_index + 1]) for window in (3, 6, 12)]
        current = history[origin_index]
        assert current is not None
        features = (
            current, history[origin_index - 1], history[origin_index - 2], history[origin_index - 3],
            history[origin_index - 6], history[origin_index - 12], history[origin_index - 24],
            *means, *stds, current - history[origin_index - 1], current - history[origin_index - 3], current - history[origin_index - 6],
            _value(rows[-1]["river_level_m"]), _value(rows[-1]["qnt_m3_h"]),
            math.sin(2 * math.pi * target_time.hour / 24), math.cos(2 * math.pi * target_time.hour / 24),
            float(target_time.weekday()), float(target_time.weekday() >= 5),
        )
        if any(value is None for value in features):
            raise ValueError("Latest exogenous values are missing; forecast cannot be generated safely.")
        if model_name == "persistence":
            prediction = current
        elif model_name == "moving_average_6":
            prediction = means[1]
        else:
            prediction = float(model.predict([features])[0])
        return {
            "issued_at": rows[-1]["timestamp"], "target_timestamp": target_time.isoformat(),
            "location": "tien_river", "parameter": TARGET, "horizon_hours": horizon,
            "model": model_name, "prediction": _round(prediction),
            "lower_bound": None, "upper_bound": None,
            "note": "Point forecast only; uncertainty interval will be considered after model calibration.",
        }

    @staticmethod
    def _write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
        with path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)

    def _summary(self, input_path: Path, rows: list[dict[str, str]], boundaries: dict[str, int], metrics: list[dict[str, Any]], selected_models: dict[int, str]) -> dict[str, Any]:
        return {
            "input_file": str(input_path),
            "data_origin": "SYNTHETIC / SIMULATED — NOT FACTORY DATA",
            "target": TARGET,
            "forecast_horizons_hours": list(HORIZONS),
            "time_split": {
                "train_end_timestamp": rows[boundaries["train_end"] - 1]["timestamp"],
                "validation_end_timestamp": rows[boundaries["validation_end"] - 1]["timestamp"],
                "test_start_timestamp": rows[boundaries["validation_end"]]["timestamp"],
                "fractions": {"train": self.train_fraction, "validation": self.validation_fraction, "test": 1 - self.train_fraction - self.validation_fraction},
            },
            "feature_policy": "All lag, rolling and operational features are measured at or before the forecast origin; target-time calendar features are known in advance.",
            "models_compared": ["persistence", "moving_average_6", "random_forest"],
            "selected_model_by_validation_rmse": {f"+{horizon}h": model for horizon, model in selected_models.items()},
            "test_metric_rows": len(metrics),
            "limitations": [
                "Synthetic-data results do not establish production model performance.",
                "EC is forecast directly; no salinity conversion or salinity forecast is made.",
                "Current River Level and Qnt are used only at forecast origin; future values are not leaked into features.",
                "Forecast intervals are not yet calibrated.",
            ],
        }

    @staticmethod
    def _write_report(path: Path, summary: dict[str, Any]) -> None:
        report = f"""# River EC Forecast Report

## Scope

- Target: `{summary['target']}` (Electrical Conductivity, not salinity).
- Horizons: +1h through +6h.
- Data origin: **{summary['data_origin']}**.

## Leakage control

The split is chronological: early period for train, middle period for validation,
and latest period for test. A direct model is fitted per horizon. Lag, rolling,
Level and Qnt features use data available no later than the forecast origin.

## Compared models

- Persistence: `prediction(t+h) = EC(t)`.
- Moving Average: trailing six EC observations.
- Random Forest: time/calendar, lag, rolling, change, Level and Qnt features.

Model selection uses validation RMSE only. The final stored model is refit on
train + validation only after reporting held-out test metrics.

## Important interpretation

EC is a directly measured variable. Forecasting EC does not forecast salinity
and must not be labelled as a salinity-intrusion prediction.

## Files

- `forecast_metrics.csv`: MAE, RMSE, MAPE and R² per model/horizon on test.
- `forecast_test_predictions.csv`: actual vs predictions for audit.
- `river_ec_next_6h_forecast.csv`: six latest point forecasts.
"""
        path.write_text(report, encoding="utf-8")
