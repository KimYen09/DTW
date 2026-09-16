"""Tests for chronological direct EC forecasting."""

from __future__ import annotations

import csv
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

from src.data.generate_synthetic_data import generate_dataset, write_dataset
from src.data.validation import DataQualityPipeline
from src.forecasting.river_ec import RiverEcForecaster


class RiverEcForecasterTest(unittest.TestCase):
    """Verify all horizons and baseline/model comparisons are produced."""

    def test_multi_horizon_metrics_and_next_forecast(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            records, labels = generate_dataset(2160, datetime.fromisoformat("2025-01-01T00:00:00+07:00"), 27)
            write_dataset(records, labels, root / "sample", 27)
            DataQualityPipeline().run(root / "sample/water_plant_synthetic_hourly.csv", root / "processed")
            summary = RiverEcForecaster().run(root / "processed/water_plant_cleaned_hourly.csv", root / "forecasts", root / "models")
            with (root / "forecasts/forecast_metrics.csv").open(encoding="utf-8", newline="") as file:
                metrics = list(csv.DictReader(file))
            with (root / "forecasts/river_ec_next_6h_forecast.csv").open(encoding="utf-8", newline="") as file:
                next_forecast = list(csv.DictReader(file))
            self.assertEqual(summary["forecast_horizons_hours"], [1, 2, 3, 4, 5, 6])
            self.assertEqual(len(metrics), 18)
            self.assertEqual(len(next_forecast), 6)
            self.assertEqual(set(row["model"] for row in metrics), {"persistence", "moving_average_6", "random_forest"})


if __name__ == "__main__":
    unittest.main()
