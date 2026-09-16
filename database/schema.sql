-- SQLite schema for the demonstration deployment.
-- All timestamps must represent Asia/Ho_Chi_Minh and be stored as ISO-8601
-- strings with explicit UTC offset, e.g. 2026-09-11T08:00:00+07:00.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS ingestion_batches (
    batch_id TEXT PRIMARY KEY,
    source_name TEXT NOT NULL,
    source_file TEXT,
    source_type TEXT NOT NULL,
    ingested_at TEXT NOT NULL,
    row_count INTEGER,
    checksum TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS water_quality (
    quality_id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    location TEXT NOT NULL CHECK (location IN (
        'raw_water_pond', 'settling_basin', 'filter_basin',
        'storage_tank', 'secondary_pump_station'
    )),
    parameter TEXT NOT NULL CHECK (parameter IN (
        'ph', 'turbidity', 'chlorine_cl2', 'color', 'salinity', 'hardness'
    )),
    value REAL,
    unit TEXT NOT NULL,
    source_batch_id TEXT,
    recorded_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_batch_id) REFERENCES ingestion_batches(batch_id),
    UNIQUE (timestamp, location, parameter, source_batch_id)
);

CREATE INDEX IF NOT EXISTS idx_water_quality_lookup
    ON water_quality (location, parameter, timestamp);

CREATE TABLE IF NOT EXISTS river_operation (
    timestamp TEXT PRIMARY KEY,
    level_m REAL,
    ec_us_cm REAL,
    source_batch_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_batch_id) REFERENCES ingestion_batches(batch_id)
);

CREATE TABLE IF NOT EXISTS raw_water_operation (
    timestamp TEXT PRIMARY KEY,
    level_m REAL,
    qnt_m3_h REAL,
    source_batch_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_batch_id) REFERENCES ingestion_batches(batch_id)
);

CREATE TABLE IF NOT EXISTS pump_operation (
    timestamp TEXT NOT NULL,
    pump_id INTEGER NOT NULL CHECK (pump_id BETWEEN 1 AND 5),
    ts_hz REAL,
    current_a REAL,
    temperature_c REAL,
    power_kw REAL,
    source_batch_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (timestamp, pump_id),
    FOREIGN KEY (source_batch_id) REFERENCES ingestion_batches(batch_id)
);

CREATE TABLE IF NOT EXISTS process_operation (
    process_id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    location TEXT NOT NULL CHECK (location IN (
        'settling_basin', 'filter_1', 'filter_2'
    )),
    parameter TEXT NOT NULL CHECK (parameter IN (
        'settling_turb', 'filter_turb', 'filter_level_1',
        'filter_level_2', 'filter_level_3', 'filter_level_4'
    )),
    value REAL,
    unit TEXT NOT NULL,
    source_batch_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_batch_id) REFERENCES ingestion_batches(batch_id),
    UNIQUE (timestamp, location, parameter, source_batch_id)
);

CREATE INDEX IF NOT EXISTS idx_process_operation_lookup
    ON process_operation (location, parameter, timestamp);

CREATE TABLE IF NOT EXISTS data_quality_log (
    quality_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT,
    timestamp TEXT,
    location TEXT,
    parameter TEXT,
    record_reference TEXT,
    rule_id TEXT NOT NULL,
    quality_dimension TEXT NOT NULL CHECK (quality_dimension IN (
        'completeness', 'uniqueness', 'timeliness', 'validity',
        'consistency', 'sensor_health'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    original_value TEXT,
    action_taken TEXT NOT NULL,
    reason TEXT NOT NULL,
    logged_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES ingestion_batches(batch_id)
);

CREATE INDEX IF NOT EXISTS idx_quality_log_lookup
    ON data_quality_log (timestamp, location, parameter, rule_id);

CREATE TABLE IF NOT EXISTS anomalies (
    anomaly_id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    location TEXT NOT NULL,
    parameter TEXT NOT NULL,
    value REAL,
    expected_range_low REAL,
    expected_range_high REAL,
    anomaly_score REAL,
    detection_method TEXT NOT NULL,
    anomaly_type TEXT NOT NULL CHECK (anomaly_type IN (
        'missing_data', 'sensor_anomaly_candidate',
        'process_or_environmental_anomaly_candidate', 'statistical_outlier'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('normal', 'warning', 'critical')),
    explanation TEXT NOT NULL,
    model_version TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_anomalies_lookup
    ON anomalies (timestamp, location, parameter, severity);

CREATE TABLE IF NOT EXISTS model_runs (
    run_id TEXT PRIMARY KEY,
    model_family TEXT NOT NULL,
    target_location TEXT NOT NULL,
    target_parameter TEXT NOT NULL,
    feature_version TEXT,
    train_start TEXT,
    train_end TEXT,
    validation_start TEXT,
    validation_end TEXT,
    test_start TEXT,
    test_end TEXT,
    metrics_json TEXT,
    artifact_path TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS forecasts (
    forecast_id INTEGER PRIMARY KEY AUTOINCREMENT,
    issued_at TEXT NOT NULL,
    target_timestamp TEXT NOT NULL,
    location TEXT NOT NULL,
    parameter TEXT NOT NULL,
    horizon_hours INTEGER NOT NULL CHECK (horizon_hours BETWEEN 1 AND 6),
    prediction REAL NOT NULL,
    lower_bound REAL,
    upper_bound REAL,
    model_run_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_run_id) REFERENCES model_runs(run_id),
    UNIQUE (issued_at, target_timestamp, location, parameter, model_run_id)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_lookup
    ON forecasts (location, parameter, issued_at, target_timestamp);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    location TEXT NOT NULL,
    parameter TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('normal', 'warning', 'critical')),
    value REAL,
    forecast_value REAL,
    message TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'closed')),
    acknowledged_at TEXT,
    acknowledged_by TEXT,
    anomaly_id INTEGER,
    forecast_id INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anomaly_id) REFERENCES anomalies(anomaly_id),
    FOREIGN KEY (forecast_id) REFERENCES forecasts(forecast_id)
);

CREATE INDEX IF NOT EXISTS idx_alerts_lookup
    ON alerts (status, severity, timestamp);
