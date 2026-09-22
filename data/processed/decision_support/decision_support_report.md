# Decision Support Report

## Current result

- Data origin: **SYNTHETIC / SIMULATED — NOT FACTORY DATA**
- Alert count: 5
- Current risk level: **WARNING**
- Forecast thresholds enabled: False

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
