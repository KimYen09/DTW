"""Command-line entry point for the water analytics project."""

from __future__ import annotations

import argparse
from pathlib import Path

from src.analytics.eda import EdaAnalyzer
from src.anomaly.detection import AnomalyDetector
from src.forecasting.river_ec import RiverEcForecaster
from src.decision_support.risk_engine import RiskEngine
from src.data.validation import DataQualityPipeline
from src.utils.logging_config import configure_logging


def parse_args() -> argparse.Namespace:
    """Parse top-level project commands."""
    parser = argparse.ArgumentParser(description="Water plant analytics project CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)
    clean = subparsers.add_parser("clean", help="Validate and clean canonical hourly CSV data")
    clean.add_argument("--input", type=Path, default=Path("data/sample/water_plant_synthetic_hourly.csv"))
    clean.add_argument("--output-dir", type=Path, default=Path("data/processed"))
    clean.add_argument("--frozen-min-hours", type=int, default=6)
    clean.add_argument("--jump-mad-multiplier", type=float, default=8.0)
    eda = subparsers.add_parser("eda", help="Create descriptive EDA and cautious operational KPIs")
    eda.add_argument("--input", type=Path, default=Path("data/processed/water_plant_cleaned_hourly.csv"))
    eda.add_argument("--output-dir", type=Path, default=Path("data/processed/eda"))
    anomaly = subparsers.add_parser("detect-anomalies", help="Run rule, robust-statistical and Isolation Forest detection")
    anomaly.add_argument("--input", type=Path, default=Path("data/processed/water_plant_cleaned_hourly.csv"))
    anomaly.add_argument("--output-dir", type=Path, default=Path("data/processed/anomalies"))
    anomaly.add_argument("--rolling-window-hours", type=int, default=24)
    anomaly.add_argument("--robust-z-threshold", type=float, default=5.0)
    anomaly.add_argument("--frozen-min-hours", type=int, default=6)
    anomaly.add_argument("--isolation-contamination", type=float, default=0.02)
    forecast = subparsers.add_parser("forecast-ec", help="Evaluate direct +1h to +6h River EC forecasts")
    forecast.add_argument("--input", type=Path, default=Path("data/processed/water_plant_cleaned_hourly.csv"))
    forecast.add_argument("--output-dir", type=Path, default=Path("data/processed/forecasts"))
    forecast.add_argument("--model-dir", type=Path, default=Path("models/river_ec"))
    forecast.add_argument("--train-fraction", type=float, default=0.70)
    forecast.add_argument("--validation-fraction", type=float, default=0.15)
    decision = subparsers.add_parser("decision-support", help="Create decision-support risk and alert artifacts")
    decision.add_argument("--anomalies", type=Path, default=Path("data/processed/anomalies/anomaly_candidates.csv"))
    decision.add_argument("--forecasts", type=Path, default=Path("data/processed/forecasts/river_ec_next_6h_forecast.csv"))
    decision.add_argument("--config", type=Path, default=Path("config/config.yaml"))
    decision.add_argument("--output-dir", type=Path, default=Path("data/processed/decision_support"))
    return parser.parse_args()


def main() -> None:
    """Dispatch a project command."""
    configure_logging()
    args = parse_args()
    if args.command == "clean":
        pipeline = DataQualityPipeline(args.frozen_min_hours, args.jump_mad_multiplier)
        summary = pipeline.run(args.input, args.output_dir)
        print(
            f"Cleaned {summary['raw_records_read']} raw records into "
            f"{summary['cleaned_records_written']} records; "
            f"logged {summary['quality_issue_count']} quality issues."
        )
    elif args.command == "eda":
        result = EdaAnalyzer().run(args.input, args.output_dir)
        print(
            f"Analyzed {result['rows_analyzed']} records and "
            f"{result['variables_analyzed']} variables; outputs: {result['output_directory']}"
        )
    elif args.command == "detect-anomalies":
        detector = AnomalyDetector(
            rolling_window_hours=args.rolling_window_hours,
            robust_z_threshold=args.robust_z_threshold,
            frozen_min_consecutive_hours=args.frozen_min_hours,
            isolation_contamination=args.isolation_contamination,
        )
        summary = detector.run(args.input, args.output_dir)
        print(f"Detected {summary['candidate_count']} anomaly candidate(s); outputs: {args.output_dir}")
    elif args.command == "forecast-ec":
        summary = RiverEcForecaster(args.train_fraction, args.validation_fraction).run(
            args.input, args.output_dir, args.model_dir
        )
        print(f"Evaluated River EC +1h to +6h forecasts; outputs: {args.output_dir}")
    elif args.command == "decision-support":
        summary = RiskEngine().run(args.anomalies, args.forecasts, args.config, args.output_dir)
        print(f"Created {summary['alert_count']} decision-support alert record(s); outputs: {args.output_dir}")


if __name__ == "__main__":
    main()
