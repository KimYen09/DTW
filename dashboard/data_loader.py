"""Read-only loaders for dashboard artifacts produced by project phases."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"


def read_csv_if_exists(path: Path) -> pd.DataFrame:
    """Load a CSV artifact or return an empty dataframe when it is unavailable."""
    if not path.is_file():
        return pd.DataFrame()
    return pd.read_csv(path)


def read_json_if_exists(path: Path) -> dict:
    """Load one JSON artifact or return an empty mapping when it is unavailable."""
    if not path.is_file():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def load_dashboard_data() -> dict[str, pd.DataFrame | dict]:
    """Load the latest pipeline outputs without modifying source files."""
    return {
        "cleaned": read_csv_if_exists(PROCESSED_DIR / "water_plant_cleaned_hourly.csv"),
        "quality_log": read_csv_if_exists(PROCESSED_DIR / "data_quality_log.csv"),
        "quality_summary": read_json_if_exists(PROCESSED_DIR / "data_quality_summary.json"),
        "anomalies": read_csv_if_exists(PROCESSED_DIR / "anomalies" / "anomaly_candidates.csv"),
        "forecast_metrics": read_csv_if_exists(PROCESSED_DIR / "forecasts" / "forecast_metrics.csv"),
        "forecast_predictions": read_csv_if_exists(PROCESSED_DIR / "forecasts" / "forecast_test_predictions.csv"),
        "next_forecast": read_csv_if_exists(PROCESSED_DIR / "forecasts" / "river_ec_next_6h_forecast.csv"),
        "alerts": read_csv_if_exists(PROCESSED_DIR / "decision_support" / "alert_log.csv"),
        "risk_summary": read_json_if_exists(PROCESSED_DIR / "decision_support" / "risk_summary.json"),
    }
