# Anomaly Detection Report

## Scope

- Input: `data/processed/water_plant_cleaned_hourly.csv`
- Records analyzed: 48
- Candidate records: 5
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

- By method: `{'isolation_forest': 1, 'rolling_robust_zscore': 4}`
- By type: `{'sensor_anomaly_candidate': 4, 'statistical_outlier': 1}`
- By severity: `{'warning': 5}`
