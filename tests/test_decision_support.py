"""Tests for the decision-support-only risk engine."""

from __future__ import annotations

import csv
import tempfile
import unittest
from pathlib import Path

from src.decision_support.risk_engine import RiskEngine


class RiskEngineTest(unittest.TestCase):
    """Verify candidate alerts and disabled unapproved forecast thresholds."""

    def test_alerts_are_created_without_forecast_thresholds(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            anomaly_path = root / "anomalies.csv"
            forecast_path = root / "forecasts.csv"
            config_path = root / "config.yaml"
            with anomaly_path.open("w", encoding="utf-8", newline="") as file:
                writer = csv.DictWriter(file, fieldnames=["timestamp", "location", "parameter", "value", "anomaly_type", "severity", "explanation", "detection_method"])
                writer.writeheader()
                writer.writerow({"timestamp": "2025-01-01T00:00:00+07:00", "location": "tien_river", "parameter": "river_ec_us_cm", "value": "900", "anomaly_type": "sensor_anomaly_candidate", "severity": "warning", "explanation": "Test candidate.", "detection_method": "rule"})
            with forecast_path.open("w", encoding="utf-8", newline="") as file:
                writer = csv.DictWriter(file, fieldnames=["issued_at", "location", "parameter", "prediction", "horizon_hours", "model"])
                writer.writeheader()
                writer.writerow({"issued_at": "2025-01-01T00:00:00+07:00", "location": "tien_river", "parameter": "river_ec_us_cm", "prediction": "999", "horizon_hours": "1", "model": "persistence"})
            config_path.write_text("alert_thresholds: {}\n", encoding="utf-8")
            summary = RiskEngine().run(anomaly_path, forecast_path, config_path, root / "output")
            self.assertEqual(summary["alert_count"], 1)
            self.assertFalse(summary["forecast_thresholds_enabled"])
            with (root / "output/alert_log.csv").open(encoding="utf-8", newline="") as file:
                alerts = list(csv.DictReader(file))
            self.assertIn("không coi đây là bằng chứng xâm nhập mặn", alerts[0]["recommendation"])


if __name__ == "__main__":
    unittest.main()
