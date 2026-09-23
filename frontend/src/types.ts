export type ViewMode = 
  | 'intro'
  | 'overview'
  | 'water_quality'
  | 'river_monitoring'
  | 'pump_monitoring'
  | 'anomaly_detection'
  | 'forecast'
  | 'alert_log'
  | 'mobile_dashboard';

export interface TelemetryMetric {
  id: string;
  name: string;
  nameEn: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'optimal';
  subText: string;
  note?: string;
  trend?: 'up' | 'down' | 'steady';
}

export interface PumpData {
  id: number;
  name: string;
  frequency: number; // Hz
  current: number;   // A
  temp: number;      // °C
  power: number;     // kW
  status: 'running' | 'stopped' | 'standby' | 'warning';
  statusText: string;
  efficiency: number; // %
  vibration: number; // mm/s
  vfdBrand: string;
  runningHours: number;
}

export interface AnomalyRecord {
  id: string;
  timestamp: string;
  location: string;
  parameter: string;
  value: number | string;
  expRange: string;
  score: number;
  method: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'open' | 'investigating' | 'resolved';
}

export interface ForecastModelMetric {
  horizon: string;
  model: 'persistence' | 'moving_average_6' | 'random_forest';
  mae: number;
  rmse: number;
  mape: number;
  r2: number;
  selected: boolean;
}

export interface AlertLogItem {
  id: string;
  timestamp: string;
  location: string;
  parameter: string;
  alertType: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  value: number | string;
  forecastVal?: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string;
  recommendation: string;
}
