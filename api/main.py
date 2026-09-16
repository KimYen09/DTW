from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

def read_csv(path: Path) -> pd.DataFrame:
    if not path.is_file():
        return pd.DataFrame()
    df = pd.read_csv(path)
    return df.where(pd.notnull(df), None)

@app.get("/api/kpis")
def get_kpis():
    df = read_csv(PROCESSED_DIR / "water_plant_cleaned_hourly.csv")
    alerts = read_csv(PROCESSED_DIR / "decision_support" / "alert_log.csv")
    
    if df.empty:
        return {}
    
    latest = df.iloc[-1]
    active_alerts = len(alerts[alerts['status'] == 'open']) if not alerts.empty and 'status' in alerts.columns else len(alerts)
    
    return {
        "currentEc": float(latest.get('tien_river_ec_us_cm', 240.0)),
        "currentPh": float(latest.get('storage_tank_ph', 7.2)),
        "currentTurbidity": float(latest.get('storage_tank_turbidity_ntu', 1.2)),
        "currentCl2": float(latest.get('storage_tank_chlorine_cl2_mg_l', 0.5)),
        "currentRiverLevel": float(latest.get('tien_river_level_m', 2.1)),
        "qnt": float(latest.get('raw_water_qnt_m3_h', 800.0)),
        "activeAlerts": active_alerts,
        "currentRisk": "WARNING" if active_alerts > 0 else "NORMAL",
        "sensorHealth": "Review needed" if active_alerts > 0 else "Good",
        "lastUpdated": str(latest.get('timestamp', ''))
    }

@app.get("/api/pumps")
def get_pumps():
    # Return mock pumps for now as we don't have detailed pump data in standard output
    return [
      {"id": 1, "name": "Bơm cấp 1", "tsHz": 39.6, "currentA": 29.1, "tempC": 35.6, "powerKw": 64.4, "status": "Running candidate", "vibrationMmS": 1.4, "efficiencyPercent": 91.5, "runningHours": 3420},
      {"id": 2, "name": "Bơm cấp 2", "tsHz": 42.5, "currentA": 30.3, "tempC": 35.6, "powerKw": 66.4, "status": "Running candidate", "vibrationMmS": 1.3, "efficiencyPercent": 93.1, "runningHours": 3180},
      {"id": 3, "name": "Bơm cấp 3", "tsHz": 40.5, "currentA": 28.7, "tempC": 36.4, "powerKw": 64.2, "status": "Running candidate", "vibrationMmS": 1.5, "efficiencyPercent": 90.8, "runningHours": 4210},
      {"id": 4, "name": "Bơm dự phòng 4", "tsHz": 0.0, "currentA": 0.0, "tempC": 32.0, "powerKw": 0.0, "status": "Stopped/unknown", "vibrationMmS": 0.05, "efficiencyPercent": 0, "runningHours": 1890},
      {"id": 5, "name": "Bơm xả bùn 5", "tsHz": 0.3, "currentA": 0.0, "tempC": 31.1, "powerKw": 0.0, "status": "Running candidate", "vibrationMmS": 0.1, "efficiencyPercent": 12.0, "runningHours": 950}
    ]

@app.get("/api/alerts")
def get_alerts():
    df = read_csv(PROCESSED_DIR / "decision_support" / "alert_log.csv")
    if df.empty:
        return []
    
    # Fill NaN with None/"" before converting to dict
    records = df.fillna("").to_dict(orient="records")
    
    # Map to AlertItem shape
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

@app.get("/api/forecast")
def get_forecast():
    df = read_csv(PROCESSED_DIR / "forecasts" / "river_ec_next_6h_forecast.csv")
    if df.empty:
        return []
    return df.fillna("").to_dict(orient="records")

@app.get("/api/anomalies")
def get_anomalies():
    df = read_csv(PROCESSED_DIR / "anomalies" / "anomaly_candidates.csv")
    if df.empty:
        return []
    return df.fillna("").to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
