"""Tests for read-only dashboard artifact loading."""

from __future__ import annotations

import unittest

from dashboard.data_loader import load_dashboard_data


class DashboardDataLoaderTest(unittest.TestCase):
    """Verify current pipeline outputs can populate the dashboard."""

    def test_existing_pipeline_artifacts_load(self) -> None:
        data = load_dashboard_data()
        self.assertFalse(data["cleaned"].empty)
        self.assertFalse(data["anomalies"].empty)
        self.assertFalse(data["next_forecast"].empty)
        self.assertFalse(data["alerts"].empty)


if __name__ == "__main__":
    unittest.main()
