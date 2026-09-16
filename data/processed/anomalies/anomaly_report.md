# Anomaly Detection Report

## Scope

- Input: `data/processed/water_plant_cleaned_hourly.csv`
- Records analyzed: 2160
- Candidate records: 71
- Data origin: **SYNTHETIC / SIMULATED — NOT FACTORY DATA**

## Methods

1. Rule-based missing-run detection.
2. Rule-based frozen non-zero value detection.
3. Rolling robust Z-score (median/MAD) for selected non-pump variables.
4. Isolation Forest over the documented multivariate feature set.

## Interpretation limits

- A candidate is not a definitive sensor fault or process incident.
- An EC candidate is not evidence of salinity intrusion.
- Pump sudden-jump logic remains deferred pending **[NEED FACTORY CONFIRMATION]**
  for TS/C/S and run/stop/load states.
- No new operational water-quality threshold is introduced by this analysis.

## Counts

- By method: `{'isolation_forest': 44, 'rolling_robust_zscore': 20, 'rule_frozen_value': 4, 'rule_missing_run': 3}`
- By type: `{'missing_data': 3, 'process_or_environmental_anomaly_candidate': 5, 'sensor_anomaly_candidate': 9, 'statistical_outlier': 54}`
- By severity: `{'critical': 1, 'warning': 70}`
