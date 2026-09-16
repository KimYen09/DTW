"""Tests for anomaly detection behavior on known simulated events."""

from __future__ import annotations

import csv
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

from src.anomaly.detection import AnomalyDetector
from src.data.generate_synthetic_data import generate_dataset, write_dataset
from src.data.validation import DataQualityPipeline


class AnomalyDetectorTest(unittest.TestCase):
    """Verify known missing, frozen and isolated EC events become candidates."""

    def test_known_synthetic_events_are_detected(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            records, labels = generate_dataset(2160, datetime.fromisoformat("2025-01-01T00:00:00+07:00"), 19)
            write_dataset(records, labels, root / "sample", 19)
            DataQualityPipeline().run(root / "sample/water_plant_synthetic_hourly.csv", root / "processed")
            summary = AnomalyDetector().run(root / "processed/water_plant_cleaned_hourly.csv", root / "anomalies")
            with (root / "anomalies/anomaly_candidates.csv").open(encoding="utf-8", newline="") as file:
                candidates = list(csv.DictReader(file))

            self.assertGreater(summary["candidate_count"], 0)
            self.assertTrue(any(row["detection_method"] == "rule_missing_run" and row["parameter"] == "river_ec_us_cm" for row in candidates))
            self.assertTrue(any(row["detection_method"] == "rule_frozen_value" and row["parameter"] == "pump_3_ts_hz" for row in candidates))
            self.assertTrue(any(row["timestamp"] == "2025-02-01T06:00:00+07:00" and row["parameter"] == "river_ec_us_cm" for row in candidates))
            self.assertTrue(any(row["anomaly_type"] == "process_or_environmental_anomaly_candidate" for row in candidates))


if __name__ == "__main__":
    unittest.main()
