export type NavPage = 
  | 'overview'
  | 'water_quality'
  | 'river_monitoring'
  | 'pump_monitoring'
  | 'anomaly_detection'
  | 'forecast'
  | 'alert_log';

export interface SystemKPIs {
  currentEc: number; // µS/cm
  currentPh: number;
  currentTurbidity: number; // NTU
  currentCl2: number; // mg/L
  currentRiverLevel: number; // m
  qnt: number; // m³/h
  activeAlerts: number;
  currentRisk: 'NORMAL' | 'WARNING' | 'CRITICAL';
  sensorHealth: 'Good' | 'Review needed' | 'Sensor fault';
  lastUpdated: string;
}

export interface PumpData {
  id: number;
  name: string;
  tsHz: number;
  currentA: number;
  tempC: number;
  powerKw: number;
  status: 'Running candidate' | 'Stopped/unknown' | 'Maintenance' | 'Standby';
  vibrationMmS?: number;
  efficiencyPercent?: number;
  runningHours?: number;
}

export interface WaterQualityStatSummary {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  current: number;
  unit: string;
  targetRange: [number, number];
  location: string;
  parameter: string;
}

export interface WaterQualityTimePoint {
  timestamp: string;
  raw_water_ph?: number;
  treated_water_ph?: number;
  turbidity?: number;
  chlorine?: number;
  ec?: number;
  temp?: number;
}

export interface RiverDataPoint {
  timestamp: string;
  river_ec_us_cm: number;
  river_level_m: number;
  isAnomaly?: boolean;
  forecast_ec?: number;
}

export interface AnomalyCandidate {
  id: string;
  timestamp: string;
  end_timestamp?: string | null;
  location: string;
  parameter: string;
  value?: number | null;
  expected_range_low?: number | null;
  expected_range_high?: number | null;
  anomaly_score: number;
  detection_method: string;
  anomaly_type: 'statistical_outlier' | 'sensor_anomaly_candidate' | 'missing_data';
  severity: 'critical' | 'warning' | 'info';
  explanation: string;
  evidence: string;
}

export interface ForecastMetric {
  horizon_hours: number;
  model: 'persistence' | 'moving_average_6' | 'random_forest' | 'lstm_gru';
  mae: number;
  rmse: number;
  mape_percent: number;
  r2: number;
  selected_for_operational_forecast: boolean;
}

export interface ForecastTimePoint {
  timestamp: string;
  actual: number | null;
  prediction: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  location: string;
  parameter: string;
  alert_type: string;
  severity: 'critical' | 'warning' | 'info';
  value: string | number;
  forecast: string | number;
  message: string;
  recommendation: string;
  status: 'open' | 'acknowledged' | 'resolved';
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  source_method: string;
}
