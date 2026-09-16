"""Tests for the non-destructive data quality pipeline."""

from __future__ import annotations

import csv
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

from src.data.generate_synthetic_data import generate_dataset, write_dataset
from src.data.validation import DataQualityPipeline


class DataQualityPipelineTest(unittest.TestCase):
    """Verify expected synthetic test events remain observable in the audit log."""

    def test_synthetic_data_is_cleaned_and_audited(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            sample_dir = root / "sample"
            output_dir = root / "processed"
            records, labels = generate_dataset(2160, datetime.fromisoformat("2025-01-01T00:00:00+07:00"), 42)
            write_dataset(records, labels, sample_dir, 42)
            summary = DataQualityPipeline().run(sample_dir / "water_plant_synthetic_hourly.csv", output_dir)

            self.assertEqual(summary["raw_records_read"], 2161)
            self.assertEqual(summary["cleaned_records_written"], 2160)
            self.assertGreater(summary["issues_by_rule"]["missing_value"], 0)
            self.assertEqual(summary["issues_by_rule"]["duplicate_record"], 1)
            self.assertGreater(summary["issues_by_rule"]["physical_validity_check"], 0)
            self.assertGreater(summary["issues_by_rule"]["frozen_value_candidate"], 0)

            with (output_dir / "water_plant_cleaned_hourly.csv").open(encoding="utf-8", newline="") as file:
                cleaned_rows = list(csv.DictReader(file))
            self.assertEqual(len(cleaned_rows), 2160)
            self.assertEqual(cleaned_rows[0]["timestamp"], "2025-01-01T00:00:00+07:00")


if __name__ == "__main__":
    unittest.main()
