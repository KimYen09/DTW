from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
import json
import subprocess
import shutil

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
        latest = {}
        active_alerts = 0
    else:
        latest = df.iloc[-1]
        active_alerts = len(alerts[alerts['status'] == 'open']) if not alerts.empty and 'status' in alerts.columns else len(alerts)
    
    return {
        "currentEc": float(latest.get('river_ec_us_cm', 0.0)),
        "currentPh": float(latest.get('storage_ph', 0.0)),
        "currentTurbidity": float(latest.get('storage_turbidity_ntu', 0.0)),
        "currentCl2": float(latest.get('secondary_chlorine_cl2_mg_l', latest.get('storage_chlorine_cl2_mg_l', 0.0))),
        "currentRiverLevel": float(latest.get('river_level_m', 0.0)),
        "qnt": float(latest.get('qnt_m3_h', 0.0)),
        "activeAlerts": active_alerts,
        "currentRisk": "Cảnh báo (WARNING)" if active_alerts > 0 else "Bình thường (NORMAL)",
        "sensorHealth": "Cần rà soát (Review needed)" if active_alerts > 0 else "Tốt (Good)",
        "lastUpdated": str(latest.get('timestamp', 'Chưa có dữ liệu'))
    }

@app.get("/api/pumps")
def get_pumps():
    df = read_csv(PROCESSED_DIR / "water_plant_cleaned_hourly.csv")
    if df.empty:
        return [
          {"id": 1, "name": "Bơm cấp 1", "tsHz": 0.0, "currentA": 0.0, "tempC": 0.0, "powerKw": 0.0, "status": "Đã dừng (Stopped)", "vibrationMmS": 0.0, "efficiencyPercent": 0, "runningHours": 0},
          {"id": 2, "name": "Bơm cấp 2", "tsHz": 0.0, "currentA": 0.0, "tempC": 0.0, "powerKw": 0.0, "status": "Đã dừng (Stopped)", "vibrationMmS": 0.0, "efficiencyPercent": 0, "runningHours": 0},
          {"id": 3, "name": "Bơm cấp 3", "tsHz": 0.0, "currentA": 0.0, "tempC": 0.0, "powerKw": 0.0, "status": "Đã dừng (Stopped)", "vibrationMmS": 0.0, "efficiencyPercent": 0, "runningHours": 0},
          {"id": 4, "name": "Bơm dự phòng 4", "tsHz": 0.0, "currentA": 0.0, "tempC": 0.0, "powerKw": 0.0, "status": "Đã dừng (Stopped)", "vibrationMmS": 0.0, "efficiencyPercent": 0, "runningHours": 0},
          {"id": 5, "name": "Bơm xả bùn 5", "tsHz": 0.0, "currentA": 0.0, "tempC": 0.0, "powerKw": 0.0, "status": "Đã dừng (Stopped)", "vibrationMmS": 0.0, "efficiencyPercent": 0, "runningHours": 0}
        ]
        
    # Return mock pumps for now as we don't have detailed pump data in standard output
    return [
      {"id": 1, "name": "Bơm cấp 1", "tsHz": 39.6, "currentA": 29.1, "tempC": 35.6, "powerKw": 64.4, "status": "Đang chạy (Running)", "vibrationMmS": 1.4, "efficiencyPercent": 91.5, "runningHours": 3420},
      {"id": 2, "name": "Bơm cấp 2", "tsHz": 42.5, "currentA": 30.3, "tempC": 35.6, "powerKw": 66.4, "status": "Đang chạy (Running)", "vibrationMmS": 1.3, "efficiencyPercent": 93.1, "runningHours": 3180},
      {"id": 3, "name": "Bơm cấp 3", "tsHz": 40.5, "currentA": 28.7, "tempC": 36.4, "powerKw": 64.2, "status": "Đang chạy (Running)", "vibrationMmS": 1.5, "efficiencyPercent": 90.8, "runningHours": 4210},
      {"id": 4, "name": "Bơm dự phòng 4", "tsHz": 0.0, "currentA": 0.0, "tempC": 32.0, "powerKw": 0.0, "status": "Đã dừng (Stopped)", "vibrationMmS": 0.05, "efficiencyPercent": 0, "runningHours": 1890},
      {"id": 5, "name": "Bơm xả bùn 5", "tsHz": 0.3, "currentA": 0.0, "tempC": 31.1, "powerKw": 0.0, "status": "Đang chạy (Running)", "vibrationMmS": 0.1, "efficiencyPercent": 12.0, "runningHours": 950}
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

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # Save the file temporarily
    temp_path = PROJECT_ROOT / "data" / "raw" / "uploaded_temp.tmp"
    temp_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Check if it's excel or csv
        if file.filename.endswith('.csv'):
            df = pd.read_csv(temp_path)
        else:
            df = pd.read_excel(temp_path)
            
        # Save as the canonical input for the pipeline
        input_csv = PROJECT_ROOT / "data" / "sample" / "water_plant_synthetic_hourly.csv"
        input_csv.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(input_csv, index=False)
        
        import sys
        # Run ML Pipeline
        commands = [
            [sys.executable, "main.py", "clean"],
            [sys.executable, "main.py", "eda"],
            [sys.executable, "main.py", "detect-anomalies"],
            [sys.executable, "main.py", "forecast-ec"],
            [sys.executable, "main.py", "decision-support"]
        ]
        
        for cmd in commands:
            process = subprocess.run(cmd, cwd=str(PROJECT_ROOT), capture_output=True, text=True)
            if process.returncode != 0:
                return {"status": "error", "message": f"Pipeline failed at {cmd[2]}: {process.stderr}"}
                
        return {"status": "success", "message": "File processed successfully"}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        if temp_path.exists():
            temp_path.unlink()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
