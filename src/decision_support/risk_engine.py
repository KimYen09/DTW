"""Decision-support risk assessment and alerts without plant control actions."""

from __future__ import annotations

import csv
import json
import logging
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class Alert:
    """An operational-review alert, never an automated control instruction."""

    timestamp: str
    location: str
    parameter: str
    alert_type: str
    severity: str
    value: float | None
    forecast: float | None
    message: str
    recommendation: str
    status: str
    acknowledged_at: str | None
    acknowledged_by: str | None
    source_method: str


def _value(raw_value: str | None) -> float | None:
    """Parse optional numerical values from artifact CSV files."""
    return None if raw_value is None or raw_value.strip() == "" else float(raw_value)


class RiskEngine:
    """Transform reviewed candidates into explainable, configurable alert records.

    Forecast threshold alerts are disabled until a factory-approved threshold is
    provided in configuration. Candidate-based alerts remain recommendations to
    inspect equipment/data/process conditions, not commands to change them.
    """

    def run(
        self,
        anomaly_path: Path,
        forecast_path: Path,
        config_path: Path,
        output_dir: Path,
        current_window_hours: int = 6,
    ) -> dict[str, Any]:
        """Create alert log, risk timeline and decision-support report."""
        anomalies = self._read_csv(anomaly_path)
        forecasts = self._read_csv(forecast_path)
        thresholds = self._load_thresholds(config_path)
        alerts = self._candidate_alerts(anomalies)
        alerts.extend(self._forecast_alerts(forecasts, thresholds))
        alerts.sort(key=lambda item: (item.timestamp, item.severity, item.location, item.parameter))
        output_dir.mkdir(parents=True, exist_ok=True)
        self._write_csv(output_dir / "alert_log.csv", [asdict(alert) for alert in alerts], list(Alert.__dataclass_fields__))
        timeline = self._risk_timeline(alerts)
        self._write_csv(output_dir / "risk_timeline.csv", timeline, list(timeline[0]) if timeline else ["timestamp", "risk_level", "alert_count", "rationale"])
        summary = self._summary(alerts, forecasts, thresholds, current_window_hours)
        (output_dir / "risk_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        self._write_report(output_dir / "decision_support_report.md", summary)
        return summary

    @staticmethod
    def _read_csv(path: Path) -> list[dict[str, str]]:
        if not path.is_file():
            raise FileNotFoundError(f"Required input does not exist: {path}")
        with path.open(encoding="utf-8-sig", newline="") as file:
            reader = csv.DictReader(file)
            if not reader.fieldnames:
                raise ValueError(f"Input CSV has no header: {path}")
            return list(reader)

    @staticmethod
    def _load_thresholds(config_path: Path) -> dict[str, Any]:
        """Read approved thresholds when PyYAML is available; otherwise disable them."""
        if not config_path.is_file():
            raise FileNotFoundError(f"Configuration does not exist: {config_path}")
        try:
            import yaml
        except ModuleNotFoundError:
            LOGGER.warning("PyYAML is unavailable; forecast threshold alerts are disabled. Install requirements.txt before using approved YAML thresholds.")
            return {}
        with config_path.open(encoding="utf-8") as file:
            config = yaml.safe_load(file) or {}
        thresholds = config.get("alert_thresholds", {})
        return thresholds if isinstance(thresholds, dict) else {}

    @staticmethod
    def _candidate_alerts(anomalies: list[dict[str, str]]) -> list[Alert]:
        alerts = []
        for anomaly in anomalies:
            anomaly_type = anomaly["anomaly_type"]
            parameter = anomaly["parameter"]
            severity = anomaly["severity"]
            if anomaly_type == "missing_data":
                alert_type = "data_quality"
                recommendation = "Kiểm tra kết nối truyền dữ liệu, trạng thái cảm biến và bản ghi SCADA; không tự suy diễn giá trị thiếu."
            elif anomaly_type == "sensor_anomaly_candidate":
                alert_type = "sensor_review"
                recommendation = "Đối chiếu raw SCADA, lịch hiệu chuẩn/bảo trì và tín hiệu liên quan trước khi kết luận lỗi cảm biến."
            elif anomaly_type == "process_or_environmental_anomaly_candidate":
                alert_type = "process_review"
                recommendation = "Kiểm tra điều kiện nguồn nước, lịch vận hành và các điểm đo liên quan; quyết định vận hành thuộc về nhân viên nhà máy."
            else:
                alert_type = "anomaly_review"
                recommendation = "Xem lại xu hướng lịch sử và các biến liên quan trước khi thực hiện bất kỳ hành động vận hành nào."
            if parameter == "river_ec_us_cm":
                recommendation += " EC là độ dẫn điện; không coi đây là bằng chứng xâm nhập mặn nếu không có xác nhận độc lập."
            type_map = {
                "missing_data": "Dữ liệu bị thiếu",
                "sensor_anomaly_candidate": "Nghi ngờ lỗi cảm biến",
                "process_or_environmental_anomaly_candidate": "Nghi ngờ thay đổi quy trình/môi trường",
                "statistical_outlier": "Bất thường thống kê"
            }
            display_type = type_map.get(anomaly_type, anomaly_type)
            alerts.append(Alert(
                timestamp=anomaly["timestamp"], location=anomaly["location"], parameter=parameter,
                alert_type=alert_type, severity=severity, value=_value(anomaly.get("value")), forecast=None,
                message=f"{display_type}: {anomaly.get('explanation', '')}", recommendation=recommendation,
                status="open", acknowledged_at=None, acknowledged_by=None,
                source_method=anomaly["detection_method"],
            ))
        return alerts

    @staticmethod
    def _forecast_alerts(forecasts: list[dict[str, str]], thresholds: dict[str, Any]) -> list[Alert]:
        """Create forecast alerts only when factory-approved config supplies values."""
        alerts: list[Alert] = []
        for forecast in forecasts:
            location = forecast["location"]
            parameter = forecast["parameter"]
            parameter_thresholds = thresholds.get(location, {}).get(parameter, {})
            prediction = _value(forecast.get("prediction"))
            if prediction is None:
                continue
            critical = parameter_thresholds.get("critical_threshold")
            warning = parameter_thresholds.get("warning_threshold")
            if critical is not None and prediction >= float(critical):
                severity, threshold_name, threshold_value = "critical", "critical_threshold", critical
            elif warning is not None and prediction >= float(warning):
                severity, threshold_name, threshold_value = "warning", "warning_threshold", warning
            else:
                continue
            alerts.append(Alert(
                timestamp=forecast["issued_at"], location=location, parameter=parameter,
                alert_type="forecast_threshold", severity=severity, value=None, forecast=prediction,
                message=f"Forecast +{forecast['horizon_hours']}h = {prediction} meets configured {threshold_name} ({threshold_value}).",
                recommendation="Nhân viên vận hành cần xác minh forecast, dữ liệu nguồn và quy trình nội bộ trước khi quyết định hành động.",
                status="open", acknowledged_at=None, acknowledged_by=None, source_method=f"forecast:{forecast['model']}",
            ))
        return alerts

    @staticmethod
    def _risk_timeline(alerts: list[Alert]) -> list[dict[str, Any]]:
        grouped: dict[str, list[Alert]] = {}
        for alert in alerts:
            grouped.setdefault(alert.timestamp, []).append(alert)
        timeline = []
        for timestamp, items in sorted(grouped.items()):
            severities = {item.severity for item in items}
            level = "CRITICAL" if "critical" in severities else "WARNING" if "warning" in severities else "NORMAL"
            timeline.append({
                "timestamp": timestamp,
                "risk_level": level,
                "alert_count": len(items),
                "rationale": "; ".join(sorted(set(item.alert_type for item in items))),
            })
        return timeline

    @staticmethod
    def _summary(alerts: list[Alert], forecasts: list[dict[str, str]], thresholds: dict[str, Any], current_window_hours: int) -> dict[str, Any]:
        latest_timestamp = max((datetime.fromisoformat(alert.timestamp) for alert in alerts), default=None)
        recent_alerts = []
        if latest_timestamp is not None:
            cutoff = latest_timestamp - timedelta(hours=current_window_hours)
            recent_alerts = [alert for alert in alerts if datetime.fromisoformat(alert.timestamp) >= cutoff]
        current_level = "NORMAL"
        if any(alert.severity == "critical" for alert in recent_alerts):
            current_level = "CRITICAL"
        elif any(alert.severity == "warning" for alert in recent_alerts):
            current_level = "WARNING"
        return {
            "data_origin": "SYNTHETIC / SIMULATED — NOT FACTORY DATA",
            "alert_count": len(alerts),
            "alerts_by_type": dict(sorted(Counter(alert.alert_type for alert in alerts).items())),
            "alerts_by_severity": dict(sorted(Counter(alert.severity for alert in alerts).items())),
            "current_risk_level": current_level,
            "current_window_hours": current_window_hours,
            "forecast_rows_reviewed": len(forecasts),
            "forecast_thresholds_enabled": bool(thresholds),
            "limitations": [
                "Alerts are decision support only; no PLC/SCADA/actuator command is generated.",
                "Forecast-based alerts require factory-approved configuration thresholds.",
                "EC is not salinity; EC anomalies/forecasts do not establish salinity intrusion.",
                "Acknowledgement fields are placeholders until a user-authenticated dashboard workflow exists.",
            ],
        }

    @staticmethod
    def _write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
        with path.open("w", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    @staticmethod
    def _write_report(path: Path, summary: dict[str, Any]) -> None:
        report = f"""# Decision Support Report

## Current result

- Data origin: **{summary['data_origin']}**
- Alert count: {summary['alert_count']}
- Current risk level: **{summary['current_risk_level']}**
- Forecast thresholds enabled: {summary['forecast_thresholds_enabled']}

## Risk levels

- `NORMAL`: no candidate alert in the current review window.
- `WARNING`: one or more warning candidates require review.
- `CRITICAL`: at least one critical candidate requires prompt operational review.

These are review priorities, not automated operating instructions. No command is
sent to pumps, valves, PLCs or SCADA. EC remains a direct electrical-conductivity
measurement and is not a salinity declaration.

## Configuration boundary

Forecast threshold alerts are inactive unless `config/config.yaml` contains a
factory-approved `warning_threshold` and/or `critical_threshold` for the exact
location and parameter. This phase does not invent thresholds.
"""
        path.write_text(report, encoding="utf-8")
