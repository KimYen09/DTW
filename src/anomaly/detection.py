"""Layered anomaly detection with cautious sensor/process candidate labels."""

from __future__ import annotations

import csv
import json
import math
import statistics
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

import numpy as np
from sklearn.ensemble import IsolationForest


UNIVARIATE_PARAMETERS = (
    "river_ec_us_cm", "river_level_m", "qnt_m3_h", "raw_water_turbidity_ntu",
    "settling_turbidity_ntu", "filter_basin_turbidity_ntu", "storage_turbidity_ntu",
    "storage_ph", "storage_chlorine_cl2_mg_l", "secondary_turbidity_ntu",
)
IF_FEATURES = (
    "river_ec_us_cm", "river_level_m", "qnt_m3_h", "raw_water_turbidity_ntu",
    "settling_turbidity_ntu", "filter_basin_turbidity_ntu", "storage_turbidity_ntu",
    "storage_ph", "storage_chlorine_cl2_mg_l",
)
TURBIDITY_PROCESS_PARAMETERS = {
    "raw_water_turbidity_ntu", "settling_turbidity_ntu", "filter_basin_turbidity_ntu",
    "storage_turbidity_ntu", "secondary_turbidity_ntu",
}


@dataclass(frozen=True)
class AnomalyCandidate:
    """One anomaly candidate for review; it is never a definitive diagnosis."""

    timestamp: str
    end_timestamp: str | None
    location: str
    parameter: str
    value: float | None
    expected_range_low: float | None
    expected_range_high: float | None
    anomaly_score: float | None
    detection_method: str
    anomaly_type: str
    severity: str
    explanation: str
    evidence: str


def _value(raw_value: str | None) -> float | None:
    """Convert a CSV value while retaining missingness."""
    return None if raw_value is None or raw_value.strip() == "" else float(raw_value)


def _round(value: float | None, digits: int = 4) -> float | None:
    """Round optional output values for compact CSV artifacts."""
    return None if value is None else round(value, digits)


def _location(parameter: str) -> str:
    """Map canonical wide columns to a reporting location."""
    if parameter.startswith("river_"):
        return "tien_river"
    if parameter.startswith("raw_water_") or parameter == "qnt_m3_h":
        return "raw_water_pond"
    if parameter.startswith("settling_"):
        return "settling_basin"
    if parameter.startswith("filter_basin"):
        return "filter_basin"
    if parameter.startswith("filter_1"):
        return "filter_1"
    if parameter.startswith("filter_2"):
        return "filter_2"
    if parameter.startswith("storage_"):
        return "storage_tank"
    if parameter.startswith("secondary_"):
        return "secondary_pump_station"
    if parameter.startswith("pump_"):
        return "primary_pump_station"
    return "unknown"


class AnomalyDetector:
    """Combine deterministic rules, robust statistics and Isolation Forest.

    Model outputs express candidates only. Cross-variable agreement and temporal
    persistence elevate a candidate but do not establish a physical cause.
    """

    def __init__(
        self,
        rolling_window_hours: int = 24,
        robust_z_threshold: float = 5.0,
        frozen_min_consecutive_hours: int = 6,
        isolation_contamination: float = 0.02,
        random_state: int = 42,
    ) -> None:
        self.rolling_window_hours = rolling_window_hours
        self.robust_z_threshold = robust_z_threshold
        self.frozen_min_consecutive_hours = frozen_min_consecutive_hours
        self.isolation_contamination = isolation_contamination
        self.random_state = random_state

    def run(self, input_path: Path, output_dir: Path) -> dict[str, Any]:
        """Detect candidates in cleaned data and write auditable result files."""
        rows, columns = self._read_rows(input_path)
        output_dir.mkdir(parents=True, exist_ok=True)
        candidates: list[AnomalyCandidate] = []
        candidates.extend(self._detect_missing_runs(rows, columns))
        candidates.extend(self._detect_frozen_runs(rows, columns))
        candidates.extend(self._detect_robust_outliers(rows))
        candidates.extend(self._detect_isolation_forest(rows))
        classified = self._classify_candidates(candidates, rows)

        candidate_path = output_dir / "anomaly_candidates.csv"
        summary_path = output_dir / "anomaly_summary.json"
        report_path = output_dir / "anomaly_report.md"
        self._write_candidates(candidate_path, classified)
        summary = self._summary(input_path, rows, classified)
        summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        self._write_report(report_path, summary)
        return summary

    @staticmethod
    def _read_rows(path: Path) -> tuple[list[dict[str, str]], list[str]]:
        if not path.is_file():
            raise FileNotFoundError(f"Cleaned input does not exist: {path}")
        with path.open(encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            if not reader.fieldnames or "timestamp" not in reader.fieldnames:
                raise ValueError("Cleaned CSV must contain timestamp")
            rows = list(reader)
            return rows, list(reader.fieldnames)

    def _detect_missing_runs(self, rows: list[dict[str, str]], columns: list[str]) -> list[AnomalyCandidate]:
        candidates: list[AnomalyCandidate] = []
        numeric_columns = [column for column in columns if column not in {"timestamp", "synthetic_record_id"}]
        for parameter in numeric_columns:
            run_start: int | None = None
            for index in range(len(rows) + 1):
                missing = index < len(rows) and _value(rows[index][parameter]) is None
                if missing and run_start is None:
                    run_start = index
                if missing or run_start is None:
                    continue
                end_index = index - 1
                candidates.append(AnomalyCandidate(
                    timestamp=rows[run_start]["timestamp"], end_timestamp=rows[end_index]["timestamp"],
                    location=_location(parameter), parameter=parameter, value=None,
                    expected_range_low=None, expected_range_high=None, anomaly_score=None,
                    detection_method="rule_missing_run", anomaly_type="missing_data",
                    severity="warning", explanation="Missing measurement run; no imputation was applied.",
                    evidence=f"{end_index - run_start + 1} consecutive missing hourly observation(s).",
                ))
                run_start = None
        return candidates

    def _detect_frozen_runs(self, rows: list[dict[str, str]], columns: list[str]) -> list[AnomalyCandidate]:
        candidates: list[AnomalyCandidate] = []
        numeric_columns = [column for column in columns if column not in {"timestamp", "synthetic_record_id"}]
        for parameter in numeric_columns:
            run_start = 0
            for index in range(1, len(rows) + 1):
                before = _value(rows[index - 1][parameter]) if index - 1 < len(rows) else None
                current = _value(rows[index][parameter]) if index < len(rows) else None
                if index < len(rows) and before is not None and current == before:
                    continue
                run_length = index - run_start
                start_value = _value(rows[run_start][parameter])
                if start_value not in {None, 0.0} and run_length >= self.frozen_min_consecutive_hours:
                    candidates.append(AnomalyCandidate(
                        timestamp=rows[run_start]["timestamp"], end_timestamp=rows[index - 1]["timestamp"],
                        location=_location(parameter), parameter=parameter, value=start_value,
                        expected_range_low=None, expected_range_high=None, anomaly_score=float(run_length),
                        detection_method="rule_frozen_value", anomaly_type="sensor_anomaly_candidate",
                        severity="warning", explanation="Identical non-zero value persisted; sensor freezing is a candidate.",
                        evidence=f"{run_length} consecutive identical hourly values; normal equipment state must be checked.",
                    ))
                run_start = index
        return candidates

    def _detect_robust_outliers(self, rows: list[dict[str, str]]) -> list[AnomalyCandidate]:
        candidates: list[AnomalyCandidate] = []
        for parameter in UNIVARIATE_PARAMETERS:
            values = [_value(row[parameter]) for row in rows]
            for index, value in enumerate(values):
                if value is None or index < self.rolling_window_hours:
                    continue
                history = [item for item in values[index - self.rolling_window_hours:index] if item is not None]
                if len(history) < max(12, self.rolling_window_hours // 2):
                    continue
                median = statistics.median(history)
                mad = statistics.median(abs(item - median) for item in history)
                scale = 1.4826 * mad
                if scale <= 1e-9:
                    continue
                robust_z = (value - median) / scale
                if abs(robust_z) < self.robust_z_threshold:
                    continue
                candidates.append(AnomalyCandidate(
                    timestamp=rows[index]["timestamp"], end_timestamp=None, location=_location(parameter),
                    parameter=parameter, value=_round(value), expected_range_low=_round(median - self.robust_z_threshold * scale),
                    expected_range_high=_round(median + self.robust_z_threshold * scale), anomaly_score=_round(robust_z),
                    detection_method="rolling_robust_zscore", anomaly_type="statistical_outlier",
                    severity="critical" if abs(robust_z) >= self.robust_z_threshold * 2 else "warning",
                    explanation="Value deviates from rolling historical median using robust MAD scale.",
                    evidence=f"rolling_window_hours={self.rolling_window_hours}; robust_z={robust_z:.3f}",
                ))
        return candidates

    def _detect_isolation_forest(self, rows: list[dict[str, str]]) -> list[AnomalyCandidate]:
        feature_medians = {
            feature: statistics.median([value for row in rows if (value := _value(row[feature])) is not None])
            for feature in IF_FEATURES
        }
        matrix = np.array([[(_value(row[feature]) if _value(row[feature]) is not None else feature_medians[feature]) for feature in IF_FEATURES] for row in rows])
        model = IsolationForest(
            contamination=self.isolation_contamination,
            random_state=self.random_state,
            n_estimators=200,
        )
        labels = model.fit_predict(matrix)
        scores = model.decision_function(matrix)
        candidates = []
        for index, (label, score) in enumerate(zip(labels, scores)):
            if label != -1:
                continue
            candidates.append(AnomalyCandidate(
                timestamp=rows[index]["timestamp"], end_timestamp=None, location="multi_location",
                parameter="multivariate_feature_set", value=None, expected_range_low=None, expected_range_high=None,
                anomaly_score=_round(float(score)), detection_method="isolation_forest",
                anomaly_type="statistical_outlier", severity="warning",
                explanation="Multivariate combination is isolated from the normal data distribution.",
                evidence="features=" + ";".join(IF_FEATURES) + f"; contamination={self.isolation_contamination}",
            ))
        return candidates

    def _classify_candidates(self, candidates: list[AnomalyCandidate], rows: list[dict[str, str]]) -> list[AnomalyCandidate]:
        by_timestamp: dict[str, list[AnomalyCandidate]] = defaultdict(list)
        for candidate in candidates:
            by_timestamp[candidate.timestamp].append(candidate)
        row_index = {row["timestamp"]: index for index, row in enumerate(rows)}
        persistent_turbidity_indices = [
            row_index[item.timestamp]
            for item in candidates
            if item.parameter in TURBIDITY_PROCESS_PARAMETERS
            and item.detection_method == "rolling_robust_zscore"
        ]
        classified: list[AnomalyCandidate] = []
        for candidate in candidates:
            same_time = by_timestamp[candidate.timestamp]
            process_signals = {item.parameter for item in same_time if item.parameter in TURBIDITY_PROCESS_PARAMETERS}
            anomaly_type = candidate.anomaly_type
            severity = candidate.severity
            explanation = candidate.explanation
            if len(process_signals) >= 2:
                anomaly_type = "process_or_environmental_anomaly_candidate"
                explanation += " Cross-variable turbidity anomalies are concurrent; this is a process/environment candidate, not a confirmed cause."
                severity = "critical" if len(process_signals) >= 3 else severity
            elif (
                candidate.parameter in TURBIDITY_PROCESS_PARAMETERS
                and candidate.detection_method == "rolling_robust_zscore"
                and sum(abs(row_index[candidate.timestamp] - item_index) <= 12 for item_index in persistent_turbidity_indices) >= 3
            ):
                anomaly_type = "process_or_environmental_anomaly_candidate"
                explanation += " Repeated turbidity outliers persist within a 24-hour window; this is a process/environment candidate, not a confirmed cause."
            elif candidate.parameter == "river_ec_us_cm" and candidate.detection_method == "rolling_robust_zscore":
                index = row_index[candidate.timestamp]
                if 0 < index < len(rows) - 1:
                    previous, current, following = (_value(rows[position]["river_ec_us_cm"]) for position in (index - 1, index, index + 1))
                    if previous is not None and current is not None and following is not None:
                        if abs(current - previous) > 0 and abs(current - following) > 0:
                            anomaly_type = "sensor_anomaly_candidate"
                            explanation += " Isolated EC excursion lacks temporal persistence; sensor anomaly candidate."
            elif candidate.detection_method == "isolation_forest" and len(process_signals) >= 2:
                anomaly_type = "process_or_environmental_anomaly_candidate"
            classified.append(AnomalyCandidate(
                **{**asdict(candidate), "anomaly_type": anomaly_type, "severity": severity, "explanation": explanation}
            ))
        return classified

    @staticmethod
    def _write_candidates(path: Path, candidates: list[AnomalyCandidate]) -> None:
        with path.open("w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=list(AnomalyCandidate.__dataclass_fields__))
            writer.writeheader()
            for candidate in sorted(candidates, key=lambda item: (item.timestamp, item.detection_method, item.parameter)):
                writer.writerow(asdict(candidate))

    @staticmethod
    def _summary(input_path: Path, rows: list[dict[str, str]], candidates: list[AnomalyCandidate]) -> dict[str, Any]:
        return {
            "input_file": str(input_path),
            "data_origin": "SYNTHETIC / SIMULATED — NOT FACTORY DATA",
            "records_analyzed": len(rows),
            "candidate_count": len(candidates),
            "by_method": dict(sorted(Counter(item.detection_method for item in candidates).items())),
            "by_type": dict(sorted(Counter(item.anomaly_type for item in candidates).items())),
            "by_severity": dict(sorted(Counter(item.severity for item in candidates).items())),
            "interpretation_limits": [
                "Candidates require operator review; they are not root-cause determinations.",
                "EC anomaly is not evidence of salinity intrusion.",
                "Isolation Forest identifies unusual multivariate patterns, not causes.",
                "No operational alert thresholds are defined in this phase.",
            ],
        }

    @staticmethod
    def _write_report(path: Path, summary: dict[str, Any]) -> None:
        report = f"""# Anomaly Detection Report

## Scope

- Input: `{summary['input_file']}`
- Records analyzed: {summary['records_analyzed']}
- Candidate records: {summary['candidate_count']}
- Data origin: **{summary['data_origin']}**

## Methods

1. Rule-based missing-run detection.
2. Rule-based frozen non-zero value detection.
3. Rolling robust Z-score (median/MAD) for selected non-pump variables.
4. Isolation Forest over the documented multivariate feature set.

## Interpretation limits

- A candidate is not a definitive sensor fault or process incident.
- An EC candidate is not evidence of salinity intrusion.
- Pump sudden-jump logic remains deferred pending **[NEED FACTORY CONFIRMATION]**
  for TS/C/S and run/stop/load states.
- No new operational water-quality threshold is introduced by this analysis.

## Counts

- By method: `{summary['by_method']}`
- By type: `{summary['by_type']}`
- By severity: `{summary['by_severity']}`
"""
        path.write_text(report, encoding="utf-8")
