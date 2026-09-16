"""Generate reproducible EDA tables and a cautious operational KPI report."""

from __future__ import annotations

import csv
import json
import math
import statistics
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


STAGE_TURBIDITY_COLUMNS = (
    ("raw_water_pond", "raw_water_turbidity_ntu"),
    ("settling_basin", "settling_turbidity_ntu"),
    ("filter_basin", "filter_basin_turbidity_ntu"),
    ("storage_tank", "storage_turbidity_ntu"),
    ("secondary_pump_station", "secondary_turbidity_ntu"),
)

EC_CORRELATION_CANDIDATES = (
    "river_level_m",
    "raw_water_level_m",
    "qnt_m3_h",
    "raw_water_turbidity_ntu",
    "settling_turbidity_ntu",
    "filter_basin_turbidity_ntu",
)


@dataclass(frozen=True)
class VariableSummary:
    """Descriptive statistics for one numeric time-series column."""

    parameter: str
    non_missing_count: int
    missing_count: int
    min: float | None
    max: float | None
    mean: float | None
    median: float | None
    std_dev: float | None
    latest_timestamp: str | None
    latest_value: float | None


def _to_float(value: str | None) -> float | None:
    """Parse one CSV cell to float while preserving missing values."""
    if value is None or value.strip() == "":
        return None
    return float(value)


def _round(value: float | None, digits: int = 4) -> float | None:
    """Round an optional numeric result for human-readable report outputs."""
    return None if value is None else round(value, digits)


class EdaAnalyzer:
    """Read a cleaned hourly dataset and create EDA artifacts.

    Output is descriptive only. In particular, same-hour stage values are not
    treated as input/output pairs and no removal efficiency is calculated until
    the factory confirms process travel time and sampling alignment.
    """

    def run(self, input_path: Path, output_dir: Path) -> dict[str, Any]:
        """Create EDA tables, KPI snapshot and a Markdown report."""
        rows, columns = self._read_cleaned_csv(input_path)
        output_dir.mkdir(parents=True, exist_ok=True)
        numeric_columns = [column for column in columns if column not in {"timestamp", "synthetic_record_id"}]
        summaries = self._summarize(rows, numeric_columns)
        summaries_by_parameter = {summary.parameter: summary for summary in summaries}

        self._write_csv(output_dir / "eda_variable_summary.csv", [summary.__dict__ for summary in summaries])
        self._write_csv(output_dir / "river_hourly_profile.csv", self._hourly_profile(rows, ("river_level_m", "river_ec_us_cm")))
        self._write_csv(output_dir / "ec_feature_correlation.csv", self._ec_correlations(rows))
        self._write_csv(output_dir / "process_turbidity_stage_summary.csv", self._stage_summary(summaries_by_parameter))

        kpi_snapshot = self._build_kpi_snapshot(summaries_by_parameter, rows)
        (output_dir / "kpi_snapshot.json").write_text(json.dumps(kpi_snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        self._write_report(output_dir / "eda_report.md", input_path, rows, summaries_by_parameter, kpi_snapshot)
        return {
            "input_file": str(input_path),
            "rows_analyzed": len(rows),
            "variables_analyzed": len(numeric_columns),
            "output_directory": str(output_dir),
        }

    @staticmethod
    def _read_cleaned_csv(path: Path) -> tuple[list[dict[str, str]], list[str]]:
        if not path.is_file():
            raise FileNotFoundError(f"Cleaned input does not exist: {path}")
        with path.open(encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            if not reader.fieldnames or "timestamp" not in reader.fieldnames:
                raise ValueError("Cleaned CSV must include a timestamp header")
            return list(reader), list(reader.fieldnames)

    @staticmethod
    def _summarize(rows: list[dict[str, str]], numeric_columns: list[str]) -> list[VariableSummary]:
        summaries: list[VariableSummary] = []
        for column in numeric_columns:
            observations = [(row["timestamp"], _to_float(row[column])) for row in rows]
            values = [value for _, value in observations if value is not None]
            latest = next(((timestamp, value) for timestamp, value in reversed(observations) if value is not None), (None, None))
            summaries.append(
                VariableSummary(
                    parameter=column,
                    non_missing_count=len(values),
                    missing_count=len(observations) - len(values),
                    min=_round(min(values)) if values else None,
                    max=_round(max(values)) if values else None,
                    mean=_round(statistics.fmean(values)) if values else None,
                    median=_round(statistics.median(values)) if values else None,
                    std_dev=_round(statistics.stdev(values)) if len(values) > 1 else None,
                    latest_timestamp=latest[0],
                    latest_value=_round(latest[1]),
                )
            )
        return summaries

    @staticmethod
    def _hourly_profile(rows: list[dict[str, str]], parameters: tuple[str, ...]) -> list[dict[str, Any]]:
        grouped: dict[tuple[int, str], list[float]] = defaultdict(list)
        for row in rows:
            hour = datetime.fromisoformat(row["timestamp"]).hour
            for parameter in parameters:
                value = _to_float(row[parameter])
                if value is not None:
                    grouped[(hour, parameter)].append(value)
        profile: list[dict[str, Any]] = []
        for hour in range(24):
            for parameter in parameters:
                values = grouped[(hour, parameter)]
                profile.append({
                    "hour": hour,
                    "parameter": parameter,
                    "observations": len(values),
                    "mean": _round(statistics.fmean(values)) if values else None,
                    "median": _round(statistics.median(values)) if values else None,
                    "std_dev": _round(statistics.stdev(values)) if len(values) > 1 else None,
                })
        return profile

    @staticmethod
    def _pearson(pairs: list[tuple[float, float]]) -> float | None:
        if len(pairs) < 3:
            return None
        xs, ys = zip(*pairs)
        mean_x, mean_y = statistics.fmean(xs), statistics.fmean(ys)
        numerator = sum((x - mean_x) * (y - mean_y) for x, y in pairs)
        denominator = math.sqrt(sum((x - mean_x) ** 2 for x in xs) * sum((y - mean_y) ** 2 for y in ys))
        return None if denominator == 0 else _round(numerator / denominator)

    def _ec_correlations(self, rows: list[dict[str, str]]) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        for candidate in EC_CORRELATION_CANDIDATES:
            pairs = []
            for row in rows:
                ec, feature = _to_float(row["river_ec_us_cm"]), _to_float(row[candidate])
                if ec is not None and feature is not None:
                    pairs.append((ec, feature))
            results.append({
                "target": "river_ec_us_cm",
                "feature": candidate,
                "pairwise_observations": len(pairs),
                "pearson_correlation": self._pearson(pairs),
                "interpretation_limit": "Descriptive association only; not causal and not a salinity conversion.",
            })
        return results

    @staticmethod
    def _stage_summary(summaries: dict[str, VariableSummary]) -> list[dict[str, Any]]:
        result = []
        for stage_order, (location, parameter) in enumerate(STAGE_TURBIDITY_COLUMNS, start=1):
            summary = summaries[parameter]
            result.append({
                "stage_order": stage_order,
                "location": location,
                "parameter": parameter,
                "non_missing_count": summary.non_missing_count,
                "mean_ntu": summary.mean,
                "median_ntu": summary.median,
                "latest_value_ntu": summary.latest_value,
                "removal_efficiency_status": "NOT_CALCULATED",
                "interpretation_limit": "Process travel time and sampling alignment are not factory-confirmed; same-hour statistics are not input/output removal pairs.",
            })
        return result

    @staticmethod
    def _build_kpi_snapshot(summaries: dict[str, VariableSummary], rows: list[dict[str, str]]) -> dict[str, Any]:
        current_parameters = (
            "river_ec_us_cm", "river_level_m", "raw_water_turbidity_ntu",
            "storage_ph", "storage_turbidity_ntu", "storage_chlorine_cl2_mg_l",
            "qnt_m3_h",
        )
        current = {
            parameter: {
                "value": summaries[parameter].latest_value,
                "timestamp": summaries[parameter].latest_timestamp,
            }
            for parameter in current_parameters
        }
        storage_ph = [_to_float(row["storage_ph"]) for row in rows]
        storage_ph_values = [value for value in storage_ph if value is not None]
        return {
            "data_origin": "SYNTHETIC / SIMULATED — NOT FACTORY DATA",
            "latest_observations": current,
            "storage_ph_reference_check": {
                "reference_range": "6.0–8.5 (provided only for storage tank)",
                "observations": len(storage_ph_values),
                "within_reference_count": sum(6.0 <= value <= 8.5 for value in storage_ph_values),
                "note": "Descriptive reference check only; not a confirmed operational alert threshold.",
            },
            "process_kpi_limit": "Removal efficiency is not calculated pending factory-confirmed travel time and sampling alignment.",
        }

    @staticmethod
    def _write_csv(path: Path, records: list[dict[str, Any]]) -> None:
        if not records:
            return
        with path.open("w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=list(records[0]))
            writer.writeheader()
            writer.writerows(records)

    @staticmethod
    def _write_report(
        path: Path,
        input_path: Path,
        rows: list[dict[str, str]],
        summaries: dict[str, VariableSummary],
        kpi_snapshot: dict[str, Any],
    ) -> None:
        ec = summaries["river_ec_us_cm"]
        turbidity = summaries["raw_water_turbidity_ntu"]
        ph = summaries["storage_ph"]
        latest = kpi_snapshot["latest_observations"]
        report = f"""# EDA Report

## Data scope

- Nguồn phân tích: `{input_path}`.
- Số bản ghi clean: {len(rows)}.
- Dataset này là **SYNTHETIC / SIMULATED — NOT FACTORY DATA**.
- Timestamp được phân tích ở timezone `Asia/Ho_Chi_Minh (+07:00)`.

## Descriptive highlights

| Variable | Non-missing | Missing | Mean | Min | Max | Latest |
|---|---:|---:|---:|---:|---:|---:|
| River EC (µS/cm) | {ec.non_missing_count} | {ec.missing_count} | {ec.mean} | {ec.min} | {ec.max} | {ec.latest_value} |
| Raw-water turbidity (NTU) | {turbidity.non_missing_count} | {turbidity.missing_count} | {turbidity.mean} | {turbidity.min} | {turbidity.max} | {turbidity.latest_value} |
| Storage pH | {ph.non_missing_count} | {ph.missing_count} | {ph.mean} | {ph.min} | {ph.max} | {ph.latest_value} |

## Process analysis boundary

Các bảng stage turbidity chỉ mô tả phân phối theo từng công đoạn. Không tính
Removal Efficiency vì chưa có **[NEED FACTORY CONFIRMATION]** về thời gian lưu,
độ trễ chuyển nước, và chu kỳ/vị trí lấy mẫu. So sánh cùng giờ không chứng minh
hiệu quả xử lý hoặc quan hệ nhân quả.

## EC interpretation boundary

`river_ec_us_cm` là EC đo trực tiếp/mô phỏng. Correlation trong
`ec_feature_correlation.csv` là liên hệ mô tả, không phải quan hệ nhân quả và
không phải công thức đổi EC thành salinity. Các biến salinity downstream được
loại khỏi bảng correlation này để tránh diễn giải sai trong dữ liệu synthetic.

## Generated artifacts

- `eda_variable_summary.csv`: thống kê theo tất cả biến số.
- `river_hourly_profile.csv`: hồ sơ EC và Level theo giờ trong ngày.
- `ec_feature_correlation.csv`: correlation Pearson mô tả với các feature an toàn.
- `process_turbidity_stage_summary.csv`: thống kê turbidity theo công đoạn.
- `kpi_snapshot.json`: các giá trị gần nhất và reference check pH bể chứa.
"""
        path.write_text(report, encoding="utf-8")
