# EDA Report

## Data scope

- Nguồn phân tích: `data/processed/water_plant_cleaned_hourly.csv`.
- Số bản ghi clean: 2160.
- Dataset này là **SYNTHETIC / SIMULATED — NOT FACTORY DATA**.
- Timestamp được phân tích ở timezone `Asia/Ho_Chi_Minh (+07:00)`.

## Descriptive highlights

| Variable | Non-missing | Missing | Mean | Min | Max | Latest |
|---|---:|---:|---:|---:|---:|---:|
| River EC (µS/cm) | 2148 | 12 | 256.0596 | 216.039 | 980.0 | 243.587 |
| Raw-water turbidity (NTU) | 2150 | 10 | 23.5323 | 7.981 | 48.892 | 26.411 |
| Storage pH | 2160 | 0 | 7.1505 | 6.969 | 7.315 | 7.242 |

## Process analysis boundary

Các bảng stage turbidity chỉ mô tả phân phối theo từng công đoạn. Không tính
Removal Efficiency vì chưa có **[NEED FACTORY CONFIRMATION]** về thời gian lưu,
độ trễ chuyển nước, và chu kỳ/vị trí lấy mẫu. So sánh cùng giờ không chứng minh
hiệu quả xử lý hoặc quan hệ nhân quả.

## EC interpretation boundary

`river_ec_us_cm` là EC đo trực tiếp/mô phỏng. Correlation trong
`ec_feature_correlation.csv` là liên hệ mô tả, không phải quan hệ nhân quả và
không phải công thức đổi EC thành salinity. Các biến salinity downstream được
loại khỏi bảng correlation này để tránh diễn giải sai trong dữ liệu synthetic.

## Generated artifacts

- `eda_variable_summary.csv`: thống kê theo tất cả biến số.
- `river_hourly_profile.csv`: hồ sơ EC và Level theo giờ trong ngày.
- `ec_feature_correlation.csv`: correlation Pearson mô tả với các feature an toàn.
- `process_turbidity_stage_summary.csv`: thống kê turbidity theo công đoạn.
- `kpi_snapshot.json`: các giá trị gần nhất và reference check pH bể chứa.
