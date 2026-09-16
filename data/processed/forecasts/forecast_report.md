# River EC Forecast Report

## Scope

- Target: `river_ec_us_cm` (Electrical Conductivity, not salinity).
- Horizons: +1h through +6h.
- Data origin: **SYNTHETIC / SIMULATED — NOT FACTORY DATA**.

## Leakage control

The split is chronological: early period for train, middle period for validation,
and latest period for test. A direct model is fitted per horizon. Lag, rolling,
Level and Qnt features use data available no later than the forecast origin.

## Compared models

- Persistence: `prediction(t+h) = EC(t)`.
- Moving Average: trailing six EC observations.
- Random Forest: time/calendar, lag, rolling, change, Level and Qnt features.

Model selection uses validation RMSE only. The final stored model is refit on
train + validation only after reporting held-out test metrics.

## Important interpretation

EC is a directly measured variable. Forecasting EC does not forecast salinity
and must not be labelled as a salinity-intrusion prediction.

## Files

- `forecast_metrics.csv`: MAE, RMSE, MAPE and R² per model/horizon on test.
- `forecast_test_predictions.csv`: actual vs predictions for audit.
- `river_ec_next_6h_forecast.csv`: six latest point forecasts.
