"""Non-destructive data-quality validation for canonical hourly wide CSV data."""

from __future__ import annotations

import csv
import json
import logging
import statistics
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


LOGGER = logging.getLogger(__name__)
VIETNAM_OFFSET = timedelta(hours=7)
VIETNAM_TIMEZONE = timezone(VIETNAM_OFFSET)


@dataclass(frozen=True)
class QualityIssue:
    """One auditable quality check result associated with a record or series."""

    source_row_number: int | None
    timestamp: str | None
    parameter: str | None
    rule_id: str
    quality_dimension: str
    severity: str
    original_value: str | None
    action_taken: str
    reason: str


class DataQualityPipeline:
    """Clean canonical CSV safely and record each quality decision.

    The pipeline deliberately does not impute missing values, smooth noisy data,
    or remove statistical spikes. Invalid timestamps and duplicate timestamps
    cannot appear in the analysis-ready hourly output, so they are excluded
    there but remain unchanged in the input/raw file.
    """

    def __init__(
        self,
        frozen_min_consecutive_hours: int = 6,
        jump_mad_multiplier: float = 8.0,
    ) -> None:
        if frozen_min_consecutive_hours < 2:
            raise ValueError("frozen_min_consecutive_hours must be at least 2")
        self.frozen_min_consecutive_hours = frozen_min_consecutive_hours
        self.jump_mad_multiplier = jump_mad_multiplier

    def run(self, input_path: Path, output_dir: Path) -> dict[str, Any]:
        """Validate one raw canonical CSV and write cleaned data plus audit files."""
        if not input_path.is_file():
            raise FileNotFoundError(f"Input file does not exist: {input_path}")
        output_dir.mkdir(parents=True, exist_ok=True)
        raw_rows, columns = self._read_csv(input_path)
        if "timestamp" not in columns:
            raise ValueError("Input CSV must contain a 'timestamp' column")

        issues: list[QualityIssue] = []
        parsed_rows = self._parse_rows(raw_rows, columns, issues)
        self._log_out_of_order(parsed_rows, issues)
        clean_rows = self._deduplicate_and_sort(parsed_rows, issues)
        self._log_missing_hours(clean_rows, issues)
        self._log_frozen_values(clean_rows, columns, issues)
        self._log_sudden_jumps(clean_rows, columns, issues)

        data_path = output_dir / "water_plant_cleaned_hourly.csv"
        issues_path = output_dir / "data_quality_log.csv"
        summary_path = output_dir / "data_quality_summary.json"
        self._write_cleaned(data_path, clean_rows, columns)
        self._write_issues(issues_path, issues)
        summary = self._build_summary(input_path, data_path, clean_rows, issues)
        summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        LOGGER.info("Cleaned %s raw rows into %s records; logged %s quality issues.", len(raw_rows), len(clean_rows), len(issues))
        return summary

    @staticmethod
    def _read_csv(path: Path) -> tuple[list[dict[str, str]], list[str]]:
        with path.open("r", encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            if not reader.fieldnames:
                raise ValueError("Input CSV has no header")
            return list(reader), list(reader.fieldnames)

    def _parse_rows(
        self,
        raw_rows: list[dict[str, str]],
        columns: list[str],
        issues: list[QualityIssue],
    ) -> list[dict[str, Any]]:
        parsed_rows: list[dict[str, Any]] = []
        numeric_columns = [column for column in columns if column not in {"timestamp", "synthetic_record_id"}]
        for source_index, raw_row in enumerate(raw_rows, start=2):
            timestamp = self._parse_timestamp(raw_row.get("timestamp", ""), source_index, issues)
            if timestamp is None:
                continue
            row: dict[str, Any] = {
                "_source_row_number": source_index,
                "_timestamp_dt": timestamp,
                "timestamp": timestamp.isoformat(),
            }
            for column in columns:
                if column == "timestamp":
                    continue
                raw_value = raw_row.get(column, "")
                if column not in numeric_columns:
                    row[column] = raw_value
                    continue
                row[column] = self._parse_measurement(raw_value, source_index, timestamp, column, issues)
            parsed_rows.append(row)
        return parsed_rows

    def _parse_timestamp(
        self,
        raw_timestamp: str,
        source_row_number: int,
        issues: list[QualityIssue],
    ) -> datetime | None:
        try:
            timestamp = datetime.fromisoformat(raw_timestamp)
        except ValueError:
            issues.append(QualityIssue(source_row_number, raw_timestamp or None, "timestamp", "invalid_timestamp", "validity", "critical", raw_timestamp or None, "exclude_from_cleaned", "Timestamp is missing or not valid ISO-8601."))
            return None
        if timestamp.tzinfo is None or timestamp.utcoffset() is None:
            issues.append(QualityIssue(source_row_number, raw_timestamp, "timestamp", "missing_timezone", "timeliness", "critical", raw_timestamp, "exclude_from_cleaned", "Timestamp has no timezone; it cannot be aligned safely."))
            return None
        normalized = timestamp.astimezone(VIETNAM_TIMEZONE)
        if normalized.isoformat() != raw_timestamp:
            issues.append(QualityIssue(source_row_number, normalized.isoformat(), "timestamp", "timezone_normalized", "timeliness", "info", raw_timestamp, "normalize_to_asia_ho_chi_minh", "Timestamp converted to Asia/Ho_Chi_Minh (+07:00)."))
        return normalized

    def _parse_measurement(
        self,
        raw_value: str,
        source_row_number: int,
        timestamp: datetime,
        column: str,
        issues: list[QualityIssue],
    ) -> float | None:
        if raw_value.strip() == "":
            issues.append(QualityIssue(source_row_number, timestamp.isoformat(), column, "missing_value", "completeness", "warning", None, "keep_missing_no_imputation", "Measurement is blank; no unconditional imputation is applied."))
            return None
        try:
            value = float(raw_value)
        except ValueError:
            issues.append(QualityIssue(source_row_number, timestamp.isoformat(), column, "non_numeric_value", "validity", "critical", raw_value, "set_to_missing", "Expected a numeric measurement but could not parse the value."))
            return None
        if self._is_physically_invalid(column, value):
            issues.append(QualityIssue(source_row_number, timestamp.isoformat(), column, "physical_validity_check", "validity", "critical", raw_value, "set_to_missing", "Value violates a generic physical constraint; it is not used for analysis."))
            return None
        return value

    @staticmethod
    def _is_physically_invalid(column: str, value: float) -> bool:
        if column.endswith("_ph"):
            return not 0.0 <= value <= 14.0
        nonnegative_tokens = ("_level", "_ec", "_qnt", "_ts", "_current", "_temperature", "_power", "turb", "chlorine", "color", "salinity", "hardness")
        return any(token in column for token in nonnegative_tokens) and value < 0.0

    @staticmethod
    def _log_out_of_order(rows: list[dict[str, Any]], issues: list[QualityIssue]) -> None:
        previous: datetime | None = None
        for row in rows:
            current = row["_timestamp_dt"]
            if previous is not None and current < previous:
                issues.append(QualityIssue(row["_source_row_number"], row["timestamp"], "timestamp", "out_of_order_timestamp", "timeliness", "warning", row["timestamp"], "sort_for_cleaned_output", "Record appears before an earlier timestamp in the source file."))
            previous = current

    @staticmethod
    def _record_signature(row: dict[str, Any]) -> tuple[tuple[str, Any], ...]:
        excluded = {"_source_row_number", "_timestamp_dt", "synthetic_record_id"}
        return tuple(sorted((key, value) for key, value in row.items() if key not in excluded))

    def _deduplicate_and_sort(self, rows: list[dict[str, Any]], issues: list[QualityIssue]) -> list[dict[str, Any]]:
        kept: list[dict[str, Any]] = []
        seen_by_timestamp: dict[str, dict[str, Any]] = {}
        for row in rows:
            timestamp = row["timestamp"]
            if timestamp not in seen_by_timestamp:
                seen_by_timestamp[timestamp] = row
                kept.append(row)
                continue
            first = seen_by_timestamp[timestamp]
            same_content = self._record_signature(first) == self._record_signature(row)
            rule = "duplicate_record" if same_content else "duplicate_timestamp"
            reason = "Duplicate measurement content detected." if same_content else "More than one record exists for this hourly timestamp."
            issues.append(QualityIssue(row["_source_row_number"], timestamp, "timestamp", rule, "uniqueness", "warning", timestamp, "exclude_from_cleaned_keep_raw", reason + " First source occurrence is retained under the configured policy."))
        return sorted(kept, key=lambda row: row["_timestamp_dt"])

    @staticmethod
    def _log_missing_hours(rows: list[dict[str, Any]], issues: list[QualityIssue]) -> None:
        for previous, current in zip(rows, rows[1:]):
            gap = current["_timestamp_dt"] - previous["_timestamp_dt"]
            if gap <= timedelta(hours=1):
                continue
            missing_hours = int(gap.total_seconds() // 3600) - 1
            issues.append(QualityIssue(None, previous["timestamp"], "timestamp", "missing_hour_gap", "completeness", "warning", None, "flag_only_no_generated_records", f"Detected {missing_hours} missing hourly timestamp(s) before {current['timestamp']}."))

    def _log_frozen_values(self, rows: list[dict[str, Any]], columns: list[str], issues: list[QualityIssue]) -> None:
        numeric_columns = [column for column in columns if column not in {"timestamp", "synthetic_record_id"}]
        for column in numeric_columns:
            run_start = 0
            for index in range(1, len(rows) + 1):
                same = index < len(rows) and rows[index][column] is not None and rows[index][column] == rows[index - 1][column]
                if same:
                    continue
                run_length = index - run_start
                start_value = rows[run_start][column]
                if start_value is not None and start_value != 0.0 and run_length >= self.frozen_min_consecutive_hours:
                    start = rows[run_start]
                    end = rows[index - 1]
                    issues.append(QualityIssue(start["_source_row_number"], start["timestamp"], column, "frozen_value_candidate", "sensor_health", "warning", str(start[column]), "flag_only_operator_confirmation_needed", f"Same value persisted for {run_length} consecutive records until {end['timestamp']}; this can be normal equipment state or sensor freezing."))
                run_start = index

    def _log_sudden_jumps(self, rows: list[dict[str, Any]], columns: list[str], issues: list[QualityIssue]) -> None:
        numeric_columns = [column for column in columns if column not in {"timestamp", "synthetic_record_id"}]
        for column in numeric_columns:
            if column.startswith("pump_"):
                # Pump current, power and temperature must be assessed together with
                # run/stop and load state. Those states are not confirmed yet, so a
                # generic univariate jump rule would generate misleading alerts.
                continue
            differences: list[float] = []
            candidate_pairs: list[tuple[dict[str, Any], dict[str, Any], float]] = []
            for previous, current in zip(rows, rows[1:]):
                if current["_timestamp_dt"] - previous["_timestamp_dt"] != timedelta(hours=1):
                    continue
                before, after = previous[column], current[column]
                if before is None or after is None:
                    continue
                difference = abs(after - before)
                differences.append(difference)
                candidate_pairs.append((previous, current, difference))
            if len(differences) < 10:
                continue
            median_difference = statistics.median(differences)
            median_absolute_deviation = statistics.median(abs(value - median_difference) for value in differences)
            threshold = median_difference + self.jump_mad_multiplier * max(median_absolute_deviation, 1e-9)
            for previous, current, difference in candidate_pairs:
                if difference > threshold:
                    issues.append(QualityIssue(current["_source_row_number"], current["timestamp"], column, "sudden_jump_candidate", "consistency", "warning", str(current[column]), "flag_only_for_anomaly_review", f"Absolute one-hour change {difference:.3f} exceeds robust data-driven threshold {threshold:.3f}; it may be sensor or process variation."))

    @staticmethod
    def _write_cleaned(path: Path, rows: list[dict[str, Any]], columns: list[str]) -> None:
        with path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=columns)
            writer.writeheader()
            for row in rows:
                output = {column: "" if row.get(column) is None else row.get(column, "") for column in columns}
                writer.writerow(output)

    @staticmethod
    def _write_issues(path: Path, issues: list[QualityIssue]) -> None:
        with path.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=list(QualityIssue.__dataclass_fields__))
            writer.writeheader()
            for issue in issues:
                writer.writerow(asdict(issue))

    @staticmethod
    def _build_summary(input_path: Path, data_path: Path, rows: list[dict[str, Any]], issues: list[QualityIssue]) -> dict[str, Any]:
        by_rule = Counter(issue.rule_id for issue in issues)
        by_severity = Counter(issue.severity for issue in issues)
        by_dimension = Counter(issue.quality_dimension for issue in issues)
        with input_path.open(encoding="utf-8-sig") as file:
            raw_records_read = sum(1 for _ in file) - 1
        return {
            "input_file": str(input_path),
            "cleaned_file": str(data_path),
            "timezone": "Asia/Ho_Chi_Minh (+07:00)",
            "raw_records_read": raw_records_read,
            "cleaned_records_written": len(rows),
            "quality_issue_count": len(issues),
            "issues_by_rule": dict(sorted(by_rule.items())),
            "issues_by_severity": dict(sorted(by_severity.items())),
            "issues_by_dimension": dict(sorted(by_dimension.items())),
            "cleaning_principles": [
                "Raw input is never overwritten.",
                "Missing values are not unconditionally imputed.",
                "Statistical spikes and frozen candidates are flagged, not deleted.",
                "Invalid physical values become missing only in cleaned output and are logged.",
                "Duplicate timestamps are retained in raw input and excluded from cleaned output using first-source-occurrence policy.",
            ],
        }
