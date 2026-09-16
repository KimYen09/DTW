"""Generate explicitly labeled synthetic hourly water-plant data for development.

This generator exists only to exercise the data-quality, analysis and anomaly
modules before factory data is available. Its relationships are intentionally
plausible-looking but are not physical models of the Tien River or any plant.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import random
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


TIMEZONE_VIETNAM = timezone(timedelta(hours=7))
DEFAULT_HOURS = 24 * 90
SEED = 20260911

DATA_COLUMNS = [
    "synthetic_record_id",
    "timestamp",
    "river_level_m",
    "river_ec_us_cm",
    "raw_water_level_m",
    "qnt_m3_h",
    "pump_1_ts_hz",
    "pump_1_current_a",
    "pump_1_temperature_c",
    "pump_1_power_kw",
    "pump_2_ts_hz",
    "pump_2_current_a",
    "pump_2_temperature_c",
    "pump_2_power_kw",
    "pump_3_ts_hz",
    "pump_3_current_a",
    "pump_3_temperature_c",
    "pump_3_power_kw",
    "pump_4_ts_hz",
    "pump_4_current_a",
    "pump_4_temperature_c",
    "pump_4_power_kw",
    "pump_5_ts_hz",
    "pump_5_current_a",
    "pump_5_temperature_c",
    "pump_5_power_kw",
    "raw_water_ph",
    "raw_water_turbidity_ntu",
    "raw_water_chlorine_cl2_mg_l",
    "raw_water_color_tcu",
    "raw_water_salinity_mg_l",
    "raw_water_hardness_mg_l",
    "settling_ph",
    "settling_turbidity_ntu",
    "settling_color_tcu",
    "settling_operation_turb_ntu",
    "filter_basin_turbidity_ntu",
    "filter_1_level_1",
    "filter_1_level_2",
    "filter_1_level_3",
    "filter_1_level_4",
    "filter_1_turb_ntu",
    "filter_2_level_1",
    "filter_2_level_2",
    "filter_2_level_3",
    "filter_2_level_4",
    "filter_2_turb_ntu",
    "storage_ph",
    "storage_turbidity_ntu",
    "storage_chlorine_cl2_mg_l",
    "secondary_ph",
    "secondary_turbidity_ntu",
    "secondary_chlorine_cl2_mg_l",
    "secondary_color_tcu",
    "secondary_salinity_mg_l",
    "secondary_hardness_mg_l",
]


def _bounded(value: float, lower: float, upper: float) -> float:
    """Constrain synthetic normal-operation values to a non-extreme interval."""
    return max(lower, min(value, upper))


def _noise(rng: random.Random, sigma: float) -> float:
    """Return deterministic Gaussian noise from the supplied random generator."""
    return rng.gauss(0.0, sigma)


def _format_value(value: Any) -> str:
    """Format values for CSV while representing missing measurements as blanks."""
    if value is None:
        return ""
    if isinstance(value, float):
        return f"{value:.3f}"
    return str(value)


def _base_record(index: int, timestamp: datetime, rng: random.Random) -> dict[str, Any]:
    """Create one normal-variation synthetic hourly record.

    The equations are simulation scaffolding only. They must not be interpreted
    as a calibrated process model or a salinity conversion formula.
    """
    hour_cycle = math.sin(2 * math.pi * (index % 24) / 24)
    week_cycle = math.sin(2 * math.pi * index / (24 * 7))

    river_level = _bounded(2.45 + 0.35 * week_cycle + _noise(rng, 0.035), 1.2, 3.8)
    river_ec = _bounded(
        285 + 24 * math.sin(2 * math.pi * index / (24 * 13)) - 12 * river_level
        + _noise(rng, 5.0),
        120,
        600,
    )
    raw_level = _bounded(3.20 + 0.13 * week_cycle + _noise(rng, 0.025), 2.5, 4.0)
    qnt = _bounded(780 + 65 * (hour_cycle + 1) / 2 + _noise(rng, 15), 500, 1100)
    raw_turbidity = _bounded(
        23 + 8 * math.sin(2 * math.pi * index / (24 * 9)) + _noise(rng, 2.5),
        3,
        80,
    )

    record: dict[str, Any] = {
        "synthetic_record_id": f"SYN-{index + 1:06d}",
        "timestamp": timestamp.isoformat(),
        "river_level_m": river_level,
        "river_ec_us_cm": river_ec,
        "raw_water_level_m": raw_level,
        "qnt_m3_h": qnt,
        "raw_water_ph": _bounded(7.05 + _noise(rng, 0.09), 6.5, 7.7),
        "raw_water_turbidity_ntu": raw_turbidity,
        "raw_water_chlorine_cl2_mg_l": _bounded(0.28 + _noise(rng, 0.03), 0.05, 0.6),
        "raw_water_color_tcu": _bounded(18 + raw_turbidity * 0.42 + _noise(rng, 2), 5, 80),
        "raw_water_salinity_mg_l": _bounded(160 + 0.17 * river_ec + _noise(rng, 13), 100, 400),
        "raw_water_hardness_mg_l": _bounded(98 + _noise(rng, 5), 60, 150),
    }

    for pump_id in range(1, 6):
        active = ((index // 8 + pump_id) % 5) < 3
        frequency = 37 + 8 * (hour_cycle + 1) / 2 if active else 0.0
        frequency = _bounded(frequency + _noise(rng, 0.7), 0, 55)
        current = (5.0 + frequency * 0.58 + _noise(rng, 1.0)) if active else 0.0
        power = (frequency * 1.60 + _noise(rng, 2.1)) if active else 0.0
        temperature = 31.5 + (frequency * 0.10 if active else 0) + _noise(rng, 0.45)
        record.update(
            {
                f"pump_{pump_id}_ts_hz": frequency,
                f"pump_{pump_id}_current_a": _bounded(current, 0, 70),
                f"pump_{pump_id}_temperature_c": _bounded(temperature, 20, 55),
                f"pump_{pump_id}_power_kw": _bounded(power, 0, 100),
            }
        )

    settling_turbidity = _bounded(raw_turbidity * 0.36 + _noise(rng, 1.0), 0.5, 35)
    settling_color = _bounded(record["raw_water_color_tcu"] * 0.43 + _noise(rng, 1.0), 1, 45)
    filter_1_turb = _bounded(settling_turbidity * 0.16 + _noise(rng, 0.15), 0.03, 8)
    filter_2_turb = _bounded(settling_turbidity * 0.17 + _noise(rng, 0.15), 0.03, 8)
    filter_turbidity = (filter_1_turb + filter_2_turb) / 2
    storage_turbidity = _bounded(filter_turbidity * 0.72 + _noise(rng, 0.07), 0.01, 5)

    record.update(
        {
            "settling_ph": _bounded(record["raw_water_ph"] + _noise(rng, 0.06), 6.4, 7.8),
            "settling_turbidity_ntu": settling_turbidity,
            "settling_color_tcu": settling_color,
            "settling_operation_turb_ntu": _bounded(settling_turbidity + _noise(rng, 0.45), 0.2, 35),
            "filter_basin_turbidity_ntu": filter_turbidity,
            "filter_1_turb_ntu": filter_1_turb,
            "filter_2_turb_ntu": filter_2_turb,
            "storage_ph": _bounded(7.15 + _noise(rng, 0.05), 6.7, 7.7),
            "storage_turbidity_ntu": storage_turbidity,
            "storage_chlorine_cl2_mg_l": _bounded(0.48 + _noise(rng, 0.035), 0.2, 0.8),
            "secondary_ph": _bounded(7.14 + _noise(rng, 0.06), 6.7, 7.7),
            "secondary_turbidity_ntu": _bounded(storage_turbidity + _noise(rng, 0.04), 0.01, 5),
            "secondary_chlorine_cl2_mg_l": _bounded(0.46 + _noise(rng, 0.04), 0.15, 0.8),
            "secondary_color_tcu": _bounded(settling_color * 0.16 + _noise(rng, 0.45), 0.1, 20),
            "secondary_salinity_mg_l": _bounded(record["raw_water_salinity_mg_l"] + _noise(rng, 5), 80, 450),
            "secondary_hardness_mg_l": _bounded(record["raw_water_hardness_mg_l"] + _noise(rng, 2), 50, 160),
        }
    )
    for filter_id in (1, 2):
        for level_id in range(1, 5):
            record[f"filter_{filter_id}_level_{level_id}"] = _bounded(
                1.0 + level_id * 0.65 + _noise(rng, 0.045), 0, 5
            )
    return record


def _apply_events(records: list[dict[str, Any]]) -> list[dict[str, str]]:
    """Inject known test events and return their explicit ground-truth labels."""
    labels: list[dict[str, str]] = []

    def label(
        event_id: str,
        start: int,
        end: int,
        event_type: str,
        category: str,
        variables: str,
        description: str,
    ) -> None:
        labels.append(
            {
                "event_id": event_id,
                "start_timestamp": records[start]["timestamp"],
                "end_timestamp": records[end]["timestamp"],
                "event_type": event_type,
                "expected_category": category,
                "affected_variables": variables,
                "description": description,
                "data_origin": "SYNTHETIC / SIMULATED — NOT FACTORY DATA",
            }
        )

    for index in range(240, 252):
        records[index]["river_ec_us_cm"] = None
    label("SYN-E001", 240, 251, "missing_signal", "missing_data", "river_ec_us_cm", "Simulated EC signal loss.")

    frozen_fields = [
        "pump_3_ts_hz", "pump_3_current_a", "pump_3_temperature_c", "pump_3_power_kw"
    ]
    frozen_value = {field: records[500][field] for field in frozen_fields}
    for index in range(501, 517):
        records[index].update(frozen_value)
    label("SYN-E002", 500, 516, "sensor_frozen", "sensor_anomaly_candidate", ";".join(frozen_fields), "Pump 3 values deliberately frozen.")

    records[750]["river_ec_us_cm"] = 980.0
    label("SYN-E003", 750, 750, "isolated_spike", "sensor_anomaly_candidate", "river_ec_us_cm", "One-hour EC spike without supporting changes.")

    for index in range(900, 972):
        records[index]["pump_2_temperature_c"] = 33.0 + (index - 900) * 0.14
    label("SYN-E004", 900, 971, "gradual_drift", "sensor_anomaly_candidate", "pump_2_temperature_c", "Synthetic gradual temperature drift.")

    for index in range(1250, 1260):
        records[index]["raw_water_turbidity_ntu"] = None
    label("SYN-E005", 1250, 1259, "missing_measurement", "missing_data", "raw_water_turbidity_ntu", "Missing raw-water turbidity measurements.")

    for index in range(1450, 1491):
        multiplier = 2.35
        records[index]["raw_water_turbidity_ntu"] *= multiplier
        records[index]["raw_water_color_tcu"] *= 1.7
        records[index]["settling_turbidity_ntu"] *= 1.9
        records[index]["settling_operation_turb_ntu"] *= 1.9
        records[index]["filter_1_turb_ntu"] *= 1.55
        records[index]["filter_2_turb_ntu"] *= 1.55
        records[index]["filter_basin_turbidity_ntu"] = (
            records[index]["filter_1_turb_ntu"] + records[index]["filter_2_turb_ntu"]
        ) / 2
        records[index]["storage_turbidity_ntu"] *= 1.3
        records[index]["secondary_turbidity_ntu"] *= 1.3
    label("SYN-E006", 1450, 1490, "persistent_multivariable_shift", "process_or_environmental_anomaly_candidate", "raw_water_turbidity_ntu;settling_turbidity_ntu;filter_1_turb_ntu;filter_2_turb_ntu", "Persistent simulated turbidity process disturbance.")

    records[1600]["pump_1_current_a"] = -3.0
    label("SYN-E007", 1600, 1600, "invalid_negative_value", "sensor_anomaly_candidate", "pump_1_current_a", "Physically invalid negative current for validation test.")

    duplicate = deepcopy(records[1800])
    duplicate["synthetic_record_id"] = "SYN-DUP-001"
    records.append(duplicate)
    label("SYN-E008", 1800, 1800, "duplicate_record", "duplicate_data", "timestamp", "Duplicate timestamp/record appended to file.")

    records[1900], records[1901] = records[1901], records[1900]
    label("SYN-E009", 1901, 1900, "out_of_order_records", "timeliness_issue", "timestamp", "Adjacent records deliberately out of chronological order.")
    return labels


def generate_dataset(hours: int, start: datetime, seed: int) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    """Generate deterministic records and injected-event labels."""
    if hours < 2000:
        raise ValueError("hours must be at least 2000 so all labeled test events are present")
    rng = random.Random(seed)
    records = [_base_record(index, start + timedelta(hours=index), rng) for index in range(hours)]
    return records, _apply_events(records)


def write_dataset(
    records: list[dict[str, Any]],
    labels: list[dict[str, str]],
    output_dir: Path,
    seed: int,
) -> None:
    """Write synthetic source records, labels and reproducibility metadata."""
    output_dir.mkdir(parents=True, exist_ok=True)
    data_path = output_dir / "water_plant_synthetic_hourly.csv"
    labels_path = output_dir / "synthetic_event_labels.csv"
    metadata_path = output_dir / "synthetic_metadata.json"

    with data_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=DATA_COLUMNS)
        writer.writeheader()
        for record in records:
            writer.writerow({column: _format_value(record.get(column)) for column in DATA_COLUMNS})

    with labels_path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(labels[0]))
        writer.writeheader()
        writer.writerows(labels)

    metadata = {
        "data_origin": "SYNTHETIC / SIMULATED — NOT FACTORY DATA",
        "purpose": "Development and test data only; not a physical process model.",
        "frequency": "hourly",
        "timezone": "Asia/Ho_Chi_Minh (+07:00)",
        "base_records": len(records) - 1,
        "rows_written": len(records),
        "column_count": len(DATA_COLUMNS),
        "labeled_events": len(labels),
        "random_seed": seed,
        "ec_statement": "river_ec_us_cm is simulated EC, never simulated salinity conversion.",
    }
    metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    """Parse command-line options."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--hours", type=int, default=DEFAULT_HOURS, help="Number of base hourly records; minimum 2000.")
    parser.add_argument("--seed", type=int, default=SEED, help="Random seed for reproducible output.")
    parser.add_argument("--output-dir", type=Path, default=Path("data/sample"), help="Directory for generated CSV and metadata files.")
    parser.add_argument("--start", default="2025-01-01T00:00:00+07:00", help="ISO-8601 start timestamp with +07:00 offset.")
    return parser.parse_args()


def main() -> None:
    """Generate the synthetic sample package."""
    args = parse_args()
    start = datetime.fromisoformat(args.start)
    if start.utcoffset() != timedelta(hours=7):
        raise ValueError("start must use the Asia/Ho_Chi_Minh +07:00 offset")
    records, labels = generate_dataset(args.hours, start, args.seed)
    write_dataset(records, labels, args.output_dir, args.seed)
    print(f"Wrote {len(records)} rows and {len(labels)} labeled events to {args.output_dir}")


if __name__ == "__main__":
    main()
