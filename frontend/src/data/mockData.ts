import {
  SystemKPIs,
  PumpData,
  WaterQualityStatSummary,
  WaterQualityTimePoint,
  RiverDataPoint,
  AnomalyCandidate,
  ForecastMetric,
  ForecastTimePoint,
  AlertItem
} from '../types';

export const initialKPIs: SystemKPIs = {
  currentEc: 243.587,
  currentPh: 7.242,
  currentTurbidity: 1.273,
  currentCl2: 0.532,
  currentRiverLevel: 2.170,
  qnt: 801.956,
  activeAlerts: 71,
  currentRisk: 'WARNING',
  sensorHealth: 'Review needed',
  lastUpdated: '16/09/2026 17:37:02 GMT+7'
};

export const initialPumps: PumpData[] = [
  {
    id: 1,
    name: 'Bơm cấp 1 (Pump #1)',
    tsHz: 39.671,
    currentA: 29.197,
    tempC: 35.613,
    powerKw: 64.405,
    status: 'Running candidate',
    vibrationMmS: 1.42,
    efficiencyPercent: 91.5,
    runningHours: 3420
  },
  {
    id: 2,
    name: 'Bơm cấp 2 (Pump #2)',
    tsHz: 42.525,
    currentA: 30.384,
    tempC: 35.640,
    powerKw: 66.419,
    status: 'Running candidate',
    vibrationMmS: 1.38,
    efficiencyPercent: 93.1,
    runningHours: 3180
  },
  {
    id: 3,
    name: 'Bơm cấp 3 (Pump #3)',
    tsHz: 40.535,
    currentA: 28.716,
    tempC: 36.475,
    powerKw: 64.218,
    status: 'Running candidate',
    vibrationMmS: 1.55,
    efficiencyPercent: 90.8,
    runningHours: 4210
  },
  {
    id: 4,
    name: 'Bơm dự phòng 4 (Pump #4)',
    tsHz: 0.000,
    currentA: 0.000,
    tempC: 32.079,
    powerKw: 0.000,
    status: 'Stopped/unknown',
    vibrationMmS: 0.05,
    efficiencyPercent: 0,
    runningHours: 1890
  },
  {
    id: 5,
    name: 'Bơm xả bùn/phụ 5 (Pump #5)',
    tsHz: 0.303,
    currentA: 0.000,
    tempC: 31.171,
    powerKw: 0.000,
    status: 'Running candidate',
    vibrationMmS: 0.12,
    efficiencyPercent: 12.0,
    runningHours: 950
  }
];

export const waterQualityStatsMap: Record<string, Record<string, WaterQualityStatSummary>> = {
  raw_reservoir: {
    ph: {
      location: 'Hồ nước thô',
      parameter: 'pH',
      min: 6.715,
      max: 7.363,
      mean: 7.050,
      median: 7.051,
      stdDev: 0.090,
      current: 7.074,
      unit: '',
      targetRange: [6.5, 8.5]
    },
    ec: {
      location: 'Hồ nước thô',
      parameter: 'Độ dẫn điện (EC)',
      min: 215.2,
      max: 310.8,
      mean: 248.5,
      median: 246.1,
      stdDev: 14.3,
      current: 243.587,
      unit: 'µS/cm',
      targetRange: [150, 400]
    },
    turbidity: {
      location: 'Hồ nước thô',
      parameter: 'Độ đục (Turbidity)',
      min: 4.2,
      max: 28.5,
      mean: 11.4,
      median: 10.2,
      stdDev: 3.8,
      current: 8.92,
      unit: 'NTU',
      targetRange: [0, 50]
    }
  },
  storage_tank: {
    ph: {
      location: 'Bể chứa nước sạch',
      parameter: 'pH',
      min: 7.01,
      max: 7.45,
      mean: 7.22,
      median: 7.23,
      stdDev: 0.07,
      current: 7.242,
      unit: '',
      targetRange: [6.5, 8.5]
    },
    cl2: {
      location: 'Bể chứa nước sạch',
      parameter: 'Clo dư (Cl2)',
      min: 0.35,
      max: 0.85,
      mean: 0.54,
      median: 0.53,
      stdDev: 0.06,
      current: 0.532,
      unit: 'mg/L',
      targetRange: [0.3, 1.0]
    },
    turbidity: {
      location: 'Bể chứa nước sạch',
      parameter: 'Độ đục (Turbidity)',
      min: 0.82,
      max: 1.88,
      mean: 1.25,
      median: 1.24,
      stdDev: 0.15,
      current: 1.273,
      unit: 'NTU',
      targetRange: [0, 2.0]
    }
  }
};

// Generate realistic daily time points for Jan 2025 to March 2025 matching charts
export const generateWaterQualitySeries = (): WaterQualityTimePoint[] => {
  const points: WaterQualityTimePoint[] = [];
  const startDate = new Date('2025-01-01T00:00:00');
  
  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 3600 * 1000);
    const dateStr = d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    
    // Wave pattern for pH around 7.05 with subtle noise
    const noise = Math.sin(i / 5) * 0.12 + Math.cos(i / 11) * 0.08 + (Math.random() - 0.5) * 0.06;
    const ph = parseFloat((7.05 + noise).toFixed(3));
    
    points.push({
      timestamp: dateStr,
      raw_water_ph: ph,
      treated_water_ph: parseFloat((ph + 0.18 + (Math.random() * 0.05)).toFixed(3)),
      turbidity: parseFloat((1.2 + Math.sin(i / 7) * 0.4 + Math.random() * 0.2).toFixed(2)),
      chlorine: parseFloat((0.52 + Math.sin(i / 8) * 0.1 + Math.random() * 0.05).toFixed(3)),
      ec: Math.round(240 + Math.sin(i / 6) * 18 + Math.random() * 8)
    });
  }
  return points;
};

// Generate River Monitoring data (Sông Tiền Level và EC) with the sharp spike in Feb
export const generateRiverData = (): RiverDataPoint[] => {
  const points: RiverDataPoint[] = [];
  const startDate = new Date('2025-01-01');

  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate.getTime() + i * 24 * 3600 * 1000);
    const dateStr = d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    
    // River level oscillates between 1.8m and 2.6m (tidal cycle)
    const level = parseFloat((2.15 + Math.sin(i / 3.5) * 0.35 + (Math.random() - 0.5) * 0.08).toFixed(3));
    
    // EC baseline ~ 240-270
    let ec = 245 + Math.sin(i / 8) * 20 + (Math.random() - 0.5) * 10;
    
    // The exact spike seen in screenshot 3 around Feb 01
    const isSpike = (i === 31); // 2025-02-01
    if (isSpike) {
      ec = 980;
    }

    points.push({
      timestamp: dateStr,
      river_ec_us_cm: Math.round(ec),
      river_level_m: level,
      isAnomaly: isSpike,
      forecast_ec: Math.round(ec + (Math.random() - 0.5) * 6)
    });
  }
  return points;
};

// EC forecast +1h đến +6h
export const ecHourlyForecast = [
  { hour: 'Hiện tại (0h)', actual: 243.58, forecast: 243.58, lower: 240.2, upper: 247.1 },
  { hour: '+1h (18:00)', actual: null, forecast: 244.12, lower: 239.5, upper: 248.8 },
  { hour: '+2h (19:00)', actual: null, forecast: 245.30, lower: 238.8, upper: 251.2 },
  { hour: '+3h (20:00)', actual: null, forecast: 246.85, lower: 237.9, upper: 254.6 },
  { hour: '+4h (21:00)', actual: null, forecast: 248.20, lower: 236.5, upper: 257.0 },
  { hour: '+5h (22:00)', actual: null, forecast: 247.45, lower: 234.8, upper: 259.1 },
  { hour: '+6h (23:00)', actual: null, forecast: 245.90, lower: 232.0, upper: 260.5 }
];

export const anomalyCandidatesList: AnomalyCandidate[] = [
  {
    id: 'anom-1',
    timestamp: '2025-01-02T21:00:00+07:00',
    end_timestamp: null,
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: null,
    expected_range_low: null,
    expected_range_high: null,
    anomaly_score: -0.008,
    detection_method: 'isolation_forest',
    anomaly_type: 'statistical_outlier',
    severity: 'warning',
    explanation: 'Multivariate combination is isolated from the normal data distribution.',
    evidence: 'features=river_ec_us_cm;river_level_m;qnt'
  },
  {
    id: 'anom-2',
    timestamp: '2025-01-03T05:00:00+07:00',
    end_timestamp: null,
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: null,
    expected_range_low: null,
    expected_range_high: null,
    anomaly_score: -0.0125,
    detection_method: 'isolation_forest',
    anomaly_type: 'statistical_outlier',
    severity: 'warning',
    explanation: 'Multivariate combination is isolated from the normal data distribution.',
    evidence: 'features=river_ec_us_cm;river_level_m;qnt'
  },
  {
    id: 'anom-3',
    timestamp: '2025-01-03T15:00:00+07:00',
    end_timestamp: null,
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: null,
    expected_range_low: null,
    expected_range_high: null,
    anomaly_score: -0.0144,
    detection_method: 'isolation_forest',
    anomaly_type: 'statistical_outlier',
    severity: 'warning',
    explanation: 'Multivariate combination is isolated from the normal data distribution.',
    evidence: 'features=river_ec_us_cm;river_level_m;qnt'
  },
  {
    id: 'anom-4',
    timestamp: '2025-01-06T01:00:00+07:00',
    end_timestamp: null,
    location: 'storage_tank',
    parameter: 'storage_ph',
    value: 7.029,
    expected_range_low: 7.0473,
    expected_range_high: 7.2697,
    anomaly_score: -5.8231,
    detection_method: 'rolling_robust_zscore',
    anomaly_type: 'statistical_outlier',
    severity: 'warning',
    explanation: 'Value deviates from rolling historical median using robust MAD scale.',
    evidence: 'rolling_window_hours=24; robust_z=-5.82'
  },
  {
    id: 'anom-5',
    timestamp: '2025-01-07T11:00:00+07:00',
    end_timestamp: null,
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: null,
    expected_range_low: null,
    expected_range_high: null,
    anomaly_score: -0.0195,
    detection_method: 'isolation_forest',
    anomaly_type: 'statistical_outlier',
    severity: 'warning',
    explanation: 'Multivariate combination is isolated from the normal data distribution.',
    evidence: 'features=river_ec_us_cm;river_level_m;qnt'
  },
  {
    id: 'anom-6',
    timestamp: '2025-01-11T00:00:00+07:00',
    end_timestamp: '2025-01-11T11:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    value: null,
    expected_range_low: null,
    expected_range_high: null,
    anomaly_score: 0,
    detection_method: 'rule_missing_run',
    anomaly_type: 'missing_data',
    severity: 'warning',
    explanation: 'Missing measurement run; no imputation was applied.',
    evidence: '12 consecutive missing hourly observations'
  },
  {
    id: 'anom-7',
    timestamp: '2025-01-12T15:00:00+07:00',
    end_timestamp: null,
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    value: 250.436,
    expected_range_low: 223.0836,
    expected_range_high: 249.8074,
    anomaly_score: 5.2352,
    detection_method: 'rolling_robust_zscore',
    anomaly_type: 'sensor_anomaly_candidate',
    severity: 'warning',
    explanation: 'Value deviates from rolling historical median using robust MAD scale. Isolated EC excursion lacks temporal persistence',
    evidence: 'rolling_window_hours=24; robust_z=5.23'
  },
  {
    id: 'anom-8',
    timestamp: '2025-01-12T16:00:00+07:00',
    end_timestamp: null,
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    value: 252.476,
    expected_range_low: 223.0189,
    expected_range_high: 250.1061,
    anomaly_score: 5.8749,
    detection_method: 'rolling_robust_zscore',
    anomaly_type: 'sensor_anomaly_candidate',
    severity: 'warning',
    explanation: 'Value deviates from rolling historical median using robust MAD scale. Isolated EC excursion lacks temporal persistence',
    evidence: 'rolling_window_hours=24; robust_z=5.87'
  },
  {
    id: 'anom-9',
    timestamp: '2025-02-01T06:00:00+07:00',
    end_timestamp: null,
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    value: 980.0,
    expected_range_low: 220.0,
    expected_range_high: 280.0,
    anomaly_score: 35.8,
    detection_method: 'rolling_robust_zscore',
    anomaly_type: 'sensor_anomaly_candidate',
    severity: 'critical',
    explanation: 'Value deviates drastically from rolling historical median. Critical anomaly spike detected.',
    evidence: 'spike_amplitude=+710 µS/cm; isolated single-sample jump'
  }
];

export const forecastMetricsList: ForecastMetric[] = [
  {
    horizon_hours: 1,
    model: 'persistence',
    mae: 5.8154,
    rmse: 7.174,
    mape_percent: 2.2883,
    r2: 0.8426,
    selected_for_operational_forecast: false
  },
  {
    horizon_hours: 1,
    model: 'moving_average_6',
    mae: 4.4284,
    rmse: 5.5229,
    mape_percent: 1.7430,
    r2: 0.9067,
    selected_for_operational_forecast: true
  },
  {
    horizon_hours: 1,
    model: 'random_forest',
    mae: 5.1805,
    rmse: 9.7669,
    mape_percent: 2.0261,
    r2: 0.7082,
    selected_for_operational_forecast: false
  },
  {
    horizon_hours: 2,
    model: 'persistence',
    mae: 5.5459,
    rmse: 7.0673,
    mape_percent: 2.1918,
    r2: 0.8472,
    selected_for_operational_forecast: false
  },
  {
    horizon_hours: 2,
    model: 'moving_average_6',
    mae: 4.5499,
    rmse: 5.6493,
    mape_percent: 1.7934,
    r2: 0.9024,
    selected_for_operational_forecast: true
  },
  {
    horizon_hours: 2,
    model: 'random_forest',
    mae: 4.7413,
    rmse: 5.8614,
    mape_percent: 1.8735,
    r2: 0.8949,
    selected_for_operational_forecast: false
  },
  {
    horizon_hours: 3,
    model: 'persistence',
    mae: 5.7903,
    rmse: 7.1698,
    mape_percent: 2.2857,
    r2: 0.8428,
    selected_for_operational_forecast: false
  },
  {
    horizon_hours: 3,
    model: 'moving_average_6',
    mae: 4.6509,
    rmse: 5.7711,
    mape_percent: 1.8323,
    r2: 0.8981,
    selected_for_operational_forecast: true
  },
  {
    horizon_hours: 3,
    model: 'random_forest',
    mae: 5.1274,
    rmse: 8.4259,
    mape_percent: 2.0030,
    r2: 0.7828,
    selected_for_operational_forecast: false
  },
  {
    horizon_hours: 4,
    model: 'persistence',
    mae: 5.9603,
    rmse: 7.4546,
    mape_percent: 2.3510,
    r2: 0.8300,
    selected_for_operational_forecast: false
  },
  {
    horizon_hours: 4,
    model: 'moving_average_6',
    mae: 4.7891,
    rmse: 5.9120,
    mape_percent: 1.8870,
    r2: 0.8930,
    selected_for_operational_forecast: true
  }
];

export const generateForecastTimeSeries = (horizon: number, model: string): ForecastTimePoint[] => {
  const points: ForecastTimePoint[] = [];
  const baseTime = new Date('2025-03-19T12:00:00');
  
  for (let i = 0; i < 60; i++) {
    const d = new Date(baseTime.getTime() + i * 4 * 3600 * 1000);
    const label = d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit' });
    
    // baseline oscillating between 230 and 265
    const actual = 248 + Math.sin(i / 5) * 14 + (Math.random() - 0.5) * 6;
    
    // prediction lag or error depending on model
    let errorFactor = 1.2;
    if (model === 'persistence') errorFactor = 3.5;
    if (model === 'moving_average_6') errorFactor = 1.8;
    if (model === 'random_forest') errorFactor = 2.4;
    
    const pred = actual + Math.sin(i / 3) * errorFactor * (horizon * 0.6);

    points.push({
      timestamp: label,
      actual: parseFloat(actual.toFixed(2)),
      prediction: parseFloat(pred.toFixed(2)),
      lowerBound: parseFloat((pred - 6.5).toFixed(2)),
      upperBound: parseFloat((pred + 6.5).toFixed(2))
    });
  }
  return points;
};

export const initialAlertLogs: AlertItem[] = [
  {
    id: 'alt-01',
    timestamp: '2025-01-02T21:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    alert_type: 'anomaly_review',
    severity: 'warning',
    value: 'None',
    forecast: 'None',
    message: 'statistical_outlier: Multivariate combination is isolated from the normal data distribution',
    recommendation: 'Xem lại xu hướng lịch sử và các biến liên quan trước khi thực hiện bất kỳ hành động vận hành nào.',
    status: 'open',
    source_method: 'isolation_forest'
  },
  {
    id: 'alt-02',
    timestamp: '2025-01-03T05:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    alert_type: 'anomaly_review',
    severity: 'warning',
    value: 'None',
    forecast: 'None',
    message: 'statistical_outlier: Multivariate combination is isolated from the normal data distribution',
    recommendation: 'Xem lại xu hướng lịch sử và các biến liên quan trước khi thực hiện bất kỳ hành động vận hành nào.',
    status: 'open',
    source_method: 'isolation_forest'
  },
  {
    id: 'alt-03',
    timestamp: '2025-01-03T15:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    alert_type: 'anomaly_review',
    severity: 'warning',
    value: 'None',
    forecast: 'None',
    message: 'statistical_outlier: Multivariate combination is isolated from the normal data distribution',
    recommendation: 'Xem lại xu hướng lịch sử và các biến liên quan trước khi thực hiện bất kỳ hành động vận hành nào.',
    status: 'open',
    source_method: 'isolation_forest'
  },
  {
    id: 'alt-04',
    timestamp: '2025-01-06T01:00:00+07:00',
    location: 'storage_tank',
    parameter: 'storage_ph',
    alert_type: 'anomaly_review',
    severity: 'warning',
    value: 7.029,
    forecast: 'None',
    message: 'statistical_outlier: Value deviates from rolling historical median using robust MAD scale',
    recommendation: 'Xem lại xu hướng lịch sử và các biến liên quan trước khi thực hiện bất kỳ hành động vận hành nào.',
    status: 'open',
    source_method: 'rolling_robust_zscore'
  },
  {
    id: 'alt-05',
    timestamp: '2025-01-11T00:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alert_type: 'data_quality',
    severity: 'warning',
    value: 'None',
    forecast: 'None',
    message: 'missing_data: Missing measurement run; no imputation was applied.',
    recommendation: 'Kiểm tra kết nối truyền dữ liệu, trạng thái cảm biến và bản ghi SCADA; không tự suy đoán số liệu.',
    status: 'open',
    source_method: 'rule_missing_run'
  },
  {
    id: 'alt-06',
    timestamp: '2025-01-12T15:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alert_type: 'sensor_review',
    severity: 'warning',
    value: 250.436,
    forecast: 'None',
    message: 'sensor_anomaly_candidate: Value deviates from rolling historical median using robust MAD scale. Isolated EC excursion lacks temporal persistence',
    recommendation: 'Đối chiếu raw SCADA, lịch hiệu chuẩn/bảo trì và tín hiệu liên quan trước khi kết luận lỗi thiết bị.',
    status: 'open',
    source_method: 'rolling_robust_zscore'
  },
  {
    id: 'alt-07',
    timestamp: '2025-01-12T16:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alert_type: 'sensor_review',
    severity: 'warning',
    value: 252.476,
    forecast: 'None',
    message: 'sensor_anomaly_candidate: Value deviates from rolling historical median using robust MAD scale. Isolated EC excursion lacks temporal persistence',
    recommendation: 'Đối chiếu raw SCADA, lịch hiệu chuẩn/bảo trì và tín hiệu liên quan trước khi kết luận lỗi thiết bị.',
    status: 'open',
    source_method: 'rolling_robust_zscore'
  },
  {
    id: 'alt-08',
    timestamp: '2025-02-01T06:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alert_type: 'sensor_review',
    severity: 'critical',
    value: 980.000,
    forecast: 'None',
    message: 'sensor_anomaly_candidate: Critical anomaly excursion detected with spike amplitude +710 µS/cm',
    recommendation: 'Cử nhân sự đo kiểm mẫu đối chứng tại trạm lấy nước thô ven sông Tiền, kiểm tra đường truyền cáp tín hiệu.',
    status: 'open',
    source_method: 'rolling_robust_zscore'
  }
];
