import os
import json
import pandas as pd
import numpy as np
from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"
OUTPUT_DIR = PROJECT_ROOT / "frontend" / "public" / "data"

# Create output dir if not exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def read_csv(path: Path) -> pd.DataFrame:
    if not path.is_file():
        return pd.DataFrame()
    df = pd.read_csv(path)
    return df.where(pd.notnull(df), None)

def generate_kpis():
    df = read_csv(PROCESSED_DIR / "water_plant_cleaned_hourly.csv")
    alerts = read_csv(PROCESSED_DIR / "decision_support" / "alert_log.csv")
    
    if df.empty:
        return {}
    
    latest = df.iloc[-1]
    active_alerts = len(alerts[alerts['status'] == 'open']) if not alerts.empty and 'status' in alerts.columns else len(alerts)
    
    return {
        "currentEc": float(latest.get('tien_river_ec_us_cm', 240.0) or 240.0),
        "currentPh": float(latest.get('storage_tank_ph', 7.2) or 7.2),
        "currentTurbidity": float(latest.get('storage_tank_turbidity_ntu', 1.2) or 1.2),
        "currentCl2": float(latest.get('storage_tank_chlorine_cl2_mg_l', 0.5) or 0.5),
        "currentRiverLevel": float(latest.get('tien_river_level_m', 2.1) or 2.1),
        "qnt": float(latest.get('raw_water_qnt_m3_h', 800.0) or 800.0),
        "activeAlerts": active_alerts,
        "currentRisk": "WARNING" if active_alerts > 0 else "NORMAL",
        "sensorHealth": "Review needed" if active_alerts > 0 else "Good",
        "lastUpdated": str(latest.get('timestamp', ''))
    }

def generate_pumps():
    return [
      {"id": 1, "name": "Bơm cấp 1", "tsHz": 39.6, "currentA": 29.1, "tempC": 35.6, "powerKw": 64.4, "status": "Running candidate", "vibrationMmS": 1.4, "efficiencyPercent": 91.5, "runningHours": 3420},
      {"id": 2, "name": "Bơm cấp 2", "tsHz": 42.5, "currentA": 30.3, "tempC": 35.6, "powerKw": 66.4, "status": "Running candidate", "vibrationMmS": 1.3, "efficiencyPercent": 93.1, "runningHours": 3180},
      {"id": 3, "name": "Bơm cấp 3", "tsHz": 40.5, "currentA": 28.7, "tempC": 36.4, "powerKw": 64.2, "status": "Running candidate", "vibrationMmS": 1.5, "efficiencyPercent": 90.8, "runningHours": 4210},
      {"id": 4, "name": "Bơm dự phòng 4", "tsHz": 0.0, "currentA": 0.0, "tempC": 32.0, "powerKw": 0.0, "status": "Stopped/unknown", "vibrationMmS": 0.05, "efficiencyPercent": 0, "runningHours": 1890},
      {"id": 5, "name": "Bơm xả bùn 5", "tsHz": 0.3, "currentA": 0.0, "tempC": 31.1, "powerKw": 0.0, "status": "Running candidate", "vibrationMmS": 0.1, "efficiencyPercent": 12.0, "runningHours": 950}
    ]

def generate_alerts():
    df = read_csv(PROCESSED_DIR / "decision_support" / "alert_log.csv")
    if df.empty:
        return []
    
    records = df.fillna("").to_dict(orient="records")
    alerts = []
    for i, row in enumerate(records):
        alerts.append({
            "id": f"alt-{row.get('anomaly_id', i)}",
            "timestamp": str(row.get('timestamp', '')),
            "location": str(row.get('location', '')),
            "parameter": str(row.get('parameter', '')),
            "alert_type": str(row.get('alert_type', 'anomaly_review')),
            "severity": str(row.get('severity', 'warning')),
            "value": str(row.get('value', 'None')),
            "forecast": str(row.get('forecast_value', 'None')),
            "message": str(row.get('alert_message', '')),
            "recommendation": str(row.get('recommendation', '')),
            "status": "open",
            "source_method": str(row.get('detection_method', ''))
        })
    return alerts

def generate_forecast():
    df = read_csv(PROCESSED_DIR / "forecasts" / "river_ec_next_6h_forecast.csv")
    if df.empty:
        return []
    return df.fillna("").to_dict(orient="records")

def generate_anomalies():
    df = read_csv(PROCESSED_DIR / "anomalies" / "anomaly_candidates.csv")
    if df.empty:
        return []
    return df.fillna("").to_dict(orient="records")

def write_json(filename, data):
    with open(OUTPUT_DIR / filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    print(f"Generating static data to {OUTPUT_DIR}...")
    write_json("kpis.json", generate_kpis())
    write_json("pumps.json", generate_pumps())
    write_json("alerts.json", generate_alerts())
    write_json("forecast.json", generate_forecast())
    write_json("anomalies.json", generate_anomalies())
    print("Successfully generated static JSON files.")
