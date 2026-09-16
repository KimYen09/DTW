# Data Dictionary

Tài liệu này định nghĩa tên chuẩn (canonical name) để pipeline map từ các tên
cột SCADA/Excel khác nhau. Raw column name được giữ lại trong metadata.

## Quy ước chung

| Trường | Quy định |
|---|---|
| `timestamp` | ISO-8601, timezone `Asia/Ho_Chi_Minh`, theo giờ |
| `location` | Mã vị trí chuẩn trong database schema |
| `parameter` | Tên chuẩn viết thường, snake_case |
| `value` | Giá trị đo; `NULL` không được thay bằng 0 nếu chưa có quy tắc |
| `unit` | Đơn vị đo gốc hoặc đơn vị đã chuẩn hóa có audit log |

## Sông Tiền — `river_operation`

| Tên chuẩn | Tên hiển thị | Đơn vị | Diễn giải | Vai trò |
|---|---|---:|---|---|
| `level_m` | River Level | m | Mực nước Sông Tiền | Feature, anomaly, forecast candidate |
| `ec_us_cm` | River EC | µS/cm | Electrical Conductivity đo trực tiếp | Forecast target ưu tiên, anomaly, feature |

**Lưu ý:** EC không phải salinity; không chuyển đổi mặc định EC → salinity.

## Hồ nước thô và trạm bơm cấp 1

### `raw_water_operation`

| Tên chuẩn | Tên hiển thị | Đơn vị | Diễn giải | Vai trò |
|---|---|---:|---|---|
| `level_m` | Raw Water Pond Level | m | Level hồ nước thô | Feature, anomaly |
| `qnt_m3_h` | Qnt | m³/h | Lưu lượng Qnt | Feature, anomaly |

**[NEED FACTORY CONFIRMATION]** Điểm đo và ý nghĩa nghiệp vụ chính xác của Qnt.

### `pump_operation`

| Tên chuẩn | Tên hiển thị | Đơn vị | Diễn giải | Vai trò |
|---|---|---:|---|---|
| `pump_id` | Pump ID | — | Máy bơm 1–5 | Khóa phân nhóm |
| `ts_hz` | Pump TS | Hz | Trường TS giữ nguyên nghĩa SCADA | Anomaly, feature |
| `current_a` | Pump Current | A | Dòng điện bơm | Anomaly, feature |
| `temperature_c` | Pump Temperature | °C | Nhiệt độ bơm | Anomaly, feature |
| `power_kw` | Pump Power | kW | Trường C/S/công suất | Anomaly, feature |

**[NEED FACTORY CONFIRMATION]** TS, C/S và vị trí đo nhiệt độ.

## Chất lượng nước — `water_quality`

| Location chuẩn | Parameter | Tên hiển thị | Đơn vị | Vai trò |
|---|---|---|---:|---|
| `raw_water_pond` | `ph` | pH | — | Anomaly, feature/forecast candidate |
| `raw_water_pond` | `turbidity` | Turbidity | NTU | Anomaly, process analysis, feature |
| `raw_water_pond` | `chlorine_cl2` | Cl2 | mg/L | Anomaly, feature/forecast candidate |
| `raw_water_pond` | `color` | Color | TCU | Anomaly, process analysis |
| `raw_water_pond` | `salinity` | Salinity | mg/L | Measured downstream label candidate |
| `raw_water_pond` | `hardness` | Hardness | mg/L | Anomaly, process analysis |
| `settling_basin` | `ph` | pH | — | Anomaly, process analysis |
| `settling_basin` | `turbidity` | Turbidity | NTU | Anomaly, process analysis |
| `settling_basin` | `color` | Color | TCU | Anomaly, process analysis |
| `filter_basin` | `turbidity` | Turbidity | NTU | Anomaly, process analysis |
| `storage_tank` | `ph` | pH | — | Anomaly; reference 6.0–8.5 |
| `storage_tank` | `turbidity` | Turbidity | NTU | Anomaly, process analysis |
| `storage_tank` | `chlorine_cl2` | Cl2 | mg/L | Anomaly, feature/forecast candidate |
| `secondary_pump_station` | `ph` | pH | — | Anomaly, quality monitoring |
| `secondary_pump_station` | `turbidity` | Turbidity | NTU | Anomaly, quality monitoring |
| `secondary_pump_station` | `chlorine_cl2` | Cl2 | mg/L | Anomaly, quality monitoring |
| `secondary_pump_station` | `color` | Color | TCU | Anomaly, quality monitoring |
| `secondary_pump_station` | `salinity` | Salinity | mg/L | Measured downstream label candidate |
| `secondary_pump_station` | `hardness` | Hardness | mg/L | Anomaly, quality monitoring |

Khoảng pH 6.0–8.5 chỉ áp dụng như reference range được cung cấp cho
`storage_tank.ph`; không áp dụng tự động cho các vị trí khác.

## Dữ liệu công đoạn — `process_operation`

| Location chuẩn | Parameter | Tên hiển thị | Đơn vị | Diễn giải |
|---|---|---|---:|---|
| `settling_basin` | `settling_turb` | Settling Turb | NTU | Độ đục vận hành tại bể lắng |
| `filter_1` | `filter_level_1`…`filter_level_4` | Filter 1 Level 1…4 | Chưa rõ | Giữ nguyên tên biến |
| `filter_1` | `filter_turb` | Filter 1 Turb | NTU | Độ đục vận hành bể lọc 1 |
| `filter_2` | `filter_level_1`…`filter_level_4` | Filter 2 Level 1…4 | Chưa rõ | Giữ nguyên tên biến |
| `filter_2` | `filter_turb` | Filter 2 Turb | NTU | Độ đục vận hành bể lọc 2 |

**[NEED FACTORY CONFIRMATION]** Ý nghĩa, đơn vị, cách đo và trạng thái hợp lệ
của bốn `filter_level` cho mỗi bể.

## Bảng đầu ra

| Bảng | Mục đích | Các trường cốt lõi |
|---|---|---|
| `data_quality_log` | Audit mọi kiểm tra/xử lý dữ liệu | timestamp, rule, original_value, action, reason |
| `anomalies` | Bất thường phát hiện được | timestamp, location, parameter, score, type, severity |
| `forecasts` | Forecast +1…+6h | issued_at, target_timestamp, prediction, bounds, horizon |
| `alerts` | Cảnh báo cần người vận hành xác minh | severity, message, recommendation, acknowledgement |
| `model_runs` | Khả năng tái lập và đánh giá model | data period, features, metrics, artifact path |
