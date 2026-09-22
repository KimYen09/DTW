import { TelemetryMetric, PumpData, AnomalyRecord, ForecastModelMetric, AlertLogItem } from '../types';

export const initialTelemetryMetrics: TelemetryMetric[] = [
  {
    id: 'ec',
    name: 'Độ dẫn điện EC',
    nameEn: 'Current EC',
    value: 644.400,
    unit: 'µS/cm',
    status: 'normal',
    subText: 'Độ dẫn điện',
    note: 'Bình thường',
    trend: 'steady'
  },
  {
    id: 'ph',
    name: 'pH hiện tại (bể chứa)',
    nameEn: 'Current pH',
    value: 7.470,
    unit: 'pH',
    status: 'optimal',
    subText: 'Chuẩn QCVN: 6.5 - 8.5',
    note: 'Đạt chuẩn',
    trend: 'steady'
  },
  {
    id: 'turbidity',
    name: 'Độ đục hiện tại (bể chứa)',
    nameEn: 'Current Turbidity',
    value: 4.240,
    unit: 'NTU',
    status: 'warning',
    subText: 'Độ đục sau lọc',
    note: '< 2.0 NTU',
    trend: 'up'
  },
  {
    id: 'chlorine',
    name: 'Clo dư hiện tại (bể chứa)',
    nameEn: 'Current CL2',
    value: 1.200,
    unit: 'mg/L',
    status: 'optimal',
    subText: 'Clo dư khử trùng',
    note: 'Tối ưu',
    trend: 'steady'
  },
  {
    id: 'river_level',
    name: 'Mực nước sông hiện tại',
    nameEn: 'Current River Level',
    value: 4.160,
    unit: 'm',
    status: 'normal',
    subText: 'Mực nước sông Tiền',
    note: 'Triều cường tb',
    trend: 'up'
  },
  {
    id: 'flow_rate',
    name: 'Lưu lượng cấp hiện tại',
    nameEn: 'Current Qnt',
    value: 1785.000,
    unit: 'm³/h',
    status: 'optimal',
    subText: 'Công suất hiện thời',
    note: '85% CS thiết kế',
    trend: 'up'
  }
];

export const initialPumps: PumpData[] = [
  {
    id: 1,
    name: 'Tổ bơm #1',
    frequency: 39.600,
    current: 29.100,
    temp: 35.600,
    power: 64.400,
    status: 'running',
    statusText: 'Running candidate',
    efficiency: 92.4,
    vibration: 1.2,
    vfdBrand: 'ABB ACS880',
    runningHours: 3420
  },
  {
    id: 2,
    name: 'Tổ bơm #2',
    frequency: 42.500,
    current: 30.300,
    temp: 35.600,
    power: 66.400,
    status: 'running',
    statusText: 'Running candidate',
    efficiency: 91.8,
    vibration: 1.4,
    vfdBrand: 'ABB ACS880',
    runningHours: 3560
  },
  {
    id: 3,
    name: 'Tổ bơm #3',
    frequency: 40.500,
    current: 28.700,
    temp: 36.400,
    power: 64.200,
    status: 'running',
    statusText: 'Running candidate',
    efficiency: 90.5,
    vibration: 1.5,
    vfdBrand: 'ABB ACS880',
    runningHours: 3210
  },
  {
    id: 4,
    name: 'Tổ bơm #4',
    frequency: 0.000,
    current: 0.000,
    temp: 32.000,
    power: 0.000,
    status: 'stopped',
    statusText: 'Stopped / Dự phòng',
    efficiency: 0,
    vibration: 0.1,
    vfdBrand: 'ABB ACS880',
    runningHours: 1980
  },
  {
    id: 5,
    name: 'Tổ bơm #5',
    frequency: 0.300,
    current: 0.000,
    temp: 31.100,
    power: 0.000,
    status: 'running',
    statusText: 'Running candidate',
    efficiency: 89.2,
    vibration: 0.8,
    vfdBrand: 'Schneider ATV630',
    runningHours: 2450
  }
];

export const anomalyRecordsData: AnomalyRecord[] = [
  {
    id: 'ano-1',
    timestamp: '2025-01-02T21:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: 'None',
    expRange: '—',
    score: -0.008,
    method: 'isolation_forest',
    type: 'statistical_outlier',
    severity: 'warning',
    status: 'open'
  },
  {
    id: 'ano-2',
    timestamp: '2025-01-03T05:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: 'None',
    expRange: '—',
    score: -0.013,
    method: 'isolation_forest',
    type: 'statistical_outlier',
    severity: 'warning',
    status: 'open'
  },
  {
    id: 'ano-3',
    timestamp: '2025-01-03T15:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: 'None',
    expRange: '—',
    score: -0.014,
    method: 'isolation_forest',
    type: 'statistical_outlier',
    severity: 'warning',
    status: 'open'
  },
  {
    id: 'ano-4',
    timestamp: '2025-01-06T01:00:00+07:00',
    location: 'storage_tank',
    parameter: 'storage_ph',
    value: 7.029,
    expRange: '[7.05, 7.27]',
    score: -5.823,
    method: 'rolling_robust_zscore',
    type: 'statistical_outlier',
    severity: 'warning',
    status: 'investigating'
  },
  {
    id: 'ano-5',
    timestamp: '2025-01-07T11:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    value: 'None',
    expRange: '—',
    score: -0.019,
    method: 'isolation_forest',
    type: 'statistical_outlier',
    severity: 'warning',
    status: 'open'
  },
  {
    id: 'ano-6',
    timestamp: '2025-02-01T04:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    value: 980.000,
    expRange: '[200, 650]',
    score: -8.450,
    method: 'rolling_robust_zscore',
    type: 'salinity_intrusion_spike',
    severity: 'critical',
    status: 'open'
  },
  {
    id: 'ano-7',
    timestamp: '2025-02-01T05:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    value: 942.500,
    expRange: '[200, 650]',
    score: -7.910,
    method: 'isolation_forest',
    type: 'salinity_intrusion_spike',
    severity: 'warning',
    status: 'investigating'
  },
  {
    id: 'ano-8',
    timestamp: '2025-02-04T12:00:00+07:00',
    location: 'raw_water_reservoir',
    parameter: 'raw_water_turbidity',
    value: 8.650,
    expRange: '[1.5, 5.0]',
    score: -3.210,
    method: 'rolling_robust_zscore',
    type: 'turbidity_surge',
    severity: 'warning',
    status: 'open'
  },
  {
    id: 'ano-9',
    timestamp: '2025-02-10T18:00:00+07:00',
    location: 'pump_station_1',
    parameter: 'pump_2_vibration',
    value: 2.15,
    expRange: '[0.5, 1.8]',
    score: -2.850,
    method: 'isolation_forest',
    type: 'mechanical_drift',
    severity: 'warning',
    status: 'open'
  }
];

export const forecastMetricsData: ForecastModelMetric[] = [
  { horizon: '+1h', model: 'persistence', mae: 5.8154, rmse: 7.1740, mape: 2.2883, r2: 0.8426, selected: false },
  { horizon: '+1h', model: 'moving_average_6', mae: 4.4284, rmse: 5.5229, mape: 1.7430, r2: 0.9067, selected: true },
  { horizon: '+1h', model: 'random_forest', mae: 5.1805, rmse: 9.7669, mape: 2.0261, r2: 0.7082, selected: false },
  { horizon: '+2h', model: 'persistence', mae: 5.5459, rmse: 7.0673, mape: 2.1918, r2: 0.8472, selected: false },
  { horizon: '+2h', model: 'moving_average_6', mae: 4.5499, rmse: 5.6493, mape: 1.7934, r2: 0.9024, selected: true },
  { horizon: '+2h', model: 'random_forest', mae: 4.7413, rmse: 5.8614, mape: 1.8735, r2: 0.8949, selected: false },
  { horizon: '+3h', model: 'persistence', mae: 5.7903, rmse: 7.1698, mape: 2.2857, r2: 0.8428, selected: false },
  { horizon: '+3h', model: 'moving_average_6', mae: 4.6509, rmse: 5.7711, mape: 1.8323, r2: 0.8981, selected: true },
  { horizon: '+3h', model: 'random_forest', mae: 5.1274, rmse: 8.4259, mape: 2.0030, r2: 0.7828, selected: false },
  { horizon: '+4h', model: 'persistence', mae: 5.9603, rmse: 7.4546, mape: 2.3510, r2: 0.8300, selected: false },
  { horizon: '+4h', model: 'moving_average_6', mae: 4.7891, rmse: 5.9120, mape: 1.8870, r2: 0.8930, selected: true },
  { horizon: '+6h', model: 'persistence', mae: 6.2410, rmse: 7.8920, mape: 2.4510, r2: 0.8120, selected: false },
  { horizon: '+6h', model: 'moving_average_6', mae: 4.9810, rmse: 6.1200, mape: 1.9540, r2: 0.8850, selected: true },
  { horizon: '+6h', model: 'random_forest', mae: 5.3400, rmse: 8.7800, mape: 2.1100, r2: 0.7710, selected: false }
];

export const alertLogData: AlertLogItem[] = [
  {
    id: 'alt-1',
    timestamp: '2025-01-02T01:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alertType: 'sensor_review',
    severity: 'WARNING',
    value: 1112.8,
    forecastVal: 'None',
    status: 'OPEN',
    message: 'Độ dẫn điện sông Tiền vượt ngưỡng cảnh báo ban đầu',
    recommendation: 'Đối chiếu trạm quan trắc thủy văn phụ cận, kiểm tra đầu đo cảm biến'
  },
  {
    id: 'alt-2',
    timestamp: '2025-01-02T02:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alertType: 'sensor_review',
    severity: 'WARNING',
    value: 1148.8,
    forecastVal: 'None',
    status: 'OPEN',
    message: 'Tốc độ tăng EC duy trì liên tục trong 2 giờ',
    recommendation: 'Chuẩn bị phương án lấy nước hồ sơ lắng hoặc điều chỉnh van cửa nhận'
  },
  {
    id: 'alt-3',
    timestamp: '2025-01-02T03:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alertType: 'sensor_review',
    severity: 'WARNING',
    value: 1237.2,
    forecastVal: 'None',
    status: 'OPEN',
    message: 'Xung đỉnh EC triều cường ban đêm',
    recommendation: 'Cảnh báo kíp vận hành ca đêm theo dõi mặn'
  },
  {
    id: 'alt-4',
    timestamp: '2025-01-02T04:00:00+07:00',
    location: 'tien_river',
    parameter: 'river_ec_us_cm',
    alertType: 'sensor_review',
    severity: 'WARNING',
    value: 1118.5,
    forecastVal: 'None',
    status: 'OPEN',
    message: 'EC giảm dần theo triều rút',
    recommendation: 'Tiếp tục ghi nhận log SCADA'
  },
  {
    id: 'alt-5',
    timestamp: '2025-01-02T23:00:00+07:00',
    location: 'multi_location',
    parameter: 'multivariate_feature_set',
    alertType: 'anomaly_review',
    severity: 'WARNING',
    value: 'None',
    forecastVal: 'None',
    status: 'OPEN',
    message: 'Mô hình Isolation Forest phát hiện tương quan đa biến bất thường giữa dòng bơm và áp lực',
    recommendation: 'Kiểm tra van một chiều tổ bơm #2 và đường ống đẩy'
  }
];

// Time-series data for Water Quality (pH, Turbidity, Chlorine, EC over 90 days / samples)
export const waterQualityTimeSeries = [
  { day: '1 thg 1', ph: 7.08, turbidity: 3.8, chlorine: 1.15, raw_ph: 7.12 },
  { day: '5 thg 1', ph: 7.15, turbidity: 4.1, chlorine: 1.18, raw_ph: 7.19 },
  { day: '9 thg 1', ph: 7.22, turbidity: 4.0, chlorine: 1.22, raw_ph: 7.25 },
  { day: '14 thg 1', ph: 7.18, turbidity: 3.9, chlorine: 1.20, raw_ph: 7.21 },
  { day: '19 thg 1', ph: 7.11, turbidity: 4.2, chlorine: 1.16, raw_ph: 7.15 },
  { day: '24 thg 1', ph: 7.05, turbidity: 4.3, chlorine: 1.19, raw_ph: 7.08 },
  { day: '29 thg 1', ph: 7.02, turbidity: 4.4, chlorine: 1.25, raw_ph: 7.03 },
  { day: '3 thg 2', ph: 6.98, turbidity: 4.6, chlorine: 1.24, raw_ph: 6.95 },
  { day: '7 thg 2', ph: 6.89, turbidity: 4.8, chlorine: 1.28, raw_ph: 6.85 },
  { day: '11 thg 2', ph: 6.82, turbidity: 5.1, chlorine: 1.30, raw_ph: 6.78 },
  { day: '16 thg 2', ph: 6.74, turbidity: 4.9, chlorine: 1.26, raw_ph: 6.71 },
  { day: '21 thg 2', ph: 6.85, turbidity: 4.5, chlorine: 1.22, raw_ph: 6.80 },
  { day: '26 thg 2', ph: 6.95, turbidity: 4.2, chlorine: 1.20, raw_ph: 6.92 },
  { day: '3 thg 3', ph: 7.02, turbidity: 4.1, chlorine: 1.18, raw_ph: 7.04 },
  { day: '7 thg 3', ph: 7.10, turbidity: 3.9, chlorine: 1.21, raw_ph: 7.14 },
  { day: '11 thg 3', ph: 7.18, turbidity: 3.8, chlorine: 1.22, raw_ph: 7.23 },
  { day: '16 thg 3', ph: 7.26, turbidity: 3.7, chlorine: 1.25, raw_ph: 7.32 },
  { day: '21 thg 3', ph: 7.30, turbidity: 3.6, chlorine: 1.20, raw_ph: 7.36 },
  { day: '26 thg 3', ph: 7.21, turbidity: 3.8, chlorine: 1.19, raw_ph: 7.24 },
  { day: '31 thg 3', ph: 7.07, turbidity: 4.24, chlorine: 1.20, raw_ph: 7.07 }
];

// River Sông Tiền dual-axis time-series (EC in µS/cm and River level in meters)
export const riverMonitoringTimeSeries = [
  { day: '1 thg 1', ec: 245, level: 2.10 },
  { day: '5 thg 1', ec: 250, level: 2.35 },
  { day: '9 thg 1', ec: 252, level: 2.40 },
  { day: '14 thg 1', ec: 248, level: 2.20 },
  { day: '19 thg 1', ec: 260, level: 2.45 },
  { day: '24 thg 1', ec: 265, level: 2.55 },
  { day: '29 thg 1', ec: 270, level: 2.40 },
  { day: '3 thg 2', ec: 980, level: 2.25, isAnomaly: true, note: 'Xung đột biến mặn 980 µS/cm' },
  { day: '7 thg 2', ec: 258, level: 2.10 },
  { day: '11 thg 2', ec: 255, level: 2.20 },
  { day: '16 thg 2', ec: 252, level: 2.45 },
  { day: '21 thg 2', ec: 250, level: 2.50 },
  { day: '26 thg 2', ec: 254, level: 2.25 },
  { day: '3 thg 3', ec: 260, level: 2.10 },
  { day: '7 thg 3', ec: 262, level: 2.30 },
  { day: '11 thg 3', ec: 265, level: 2.55 },
  { day: '16 thg 3', ec: 264, level: 2.60 },
  { day: '21 thg 3', ec: 260, level: 2.40 },
  { day: '26 thg 3', ec: 258, level: 2.20 },
  { day: '31 thg 3', ec: 255, level: 2.30 }
];
