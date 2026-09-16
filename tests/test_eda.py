"""Tests for EDA artifacts and process-analysis safeguards."""

from __future__ import annotations

import csv
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

from src.analytics.eda import EdaAnalyzer
from src.data.generate_synthetic_data import generate_dataset, write_dataset
from src.data.validation import DataQualityPipeline


class EdaAnalyzerTest(unittest.TestCase):
    """Ensure EDA writes reproducible outputs without invalid process claims."""

    def test_eda_outputs_and_process_boundary(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            records, labels = generate_dataset(2160, datetime.fromisoformat("2025-01-01T00:00:00+07:00"), 9)
            write_dataset(records, labels, root / "sample", 9)
            DataQualityPipeline().run(root / "sample/water_plant_synthetic_hourly.csv", root / "processed")
            result = EdaAnalyzer().run(root / "processed/water_plant_cleaned_hourly.csv", root / "eda")

            self.assertEqual(result["rows_analyzed"], 2160)
            with (root / "eda/process_turbidity_stage_summary.csv").open(encoding="utf-8", newline="") as file:
                stage_rows = list(csv.DictReader(file))
            self.assertEqual(len(stage_rows), 5)
            self.assertTrue(all(row["removal_efficiency_status"] == "NOT_CALCULATED" for row in stage_rows))
            self.assertTrue((root / "eda/eda_report.md").is_file())


if __name__ == "__main__":
    unittest.main()
