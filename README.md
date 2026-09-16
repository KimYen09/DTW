# Water Quality Analytics, Anomaly Detection and Forecasting System

Hệ thống phân tích dữ liệu vận hành nhà máy nước theo giờ, phục vụ giám sát chất lượng dữ liệu, phân tích xu hướng, phát hiện bất thường, dự báo và hỗ trợ ra quyết định. Hệ thống chỉ đưa ra khuyến nghị; không điều khiển PLC/SCADA.

## 1. Project overview
Hệ thống được xây dựng như một dự án thực tập/khóa luận Data Science, sử dụng dữ liệu hoạt động thực tế (hoặc mô phỏng Synthetic Data) của nhà máy nước. Mục tiêu là xây dựng một hệ thống có khả năng thu thập, làm sạch dữ liệu, phát hiện các bất thường về chất lượng nước, dự báo các chỉ số rủi ro (đặc biệt là River EC) và cung cấp một Dashboard Dashboard hỗ trợ vận hành.

## 2. Business problem
Các nhà máy xử lý nước thường xuyên phải đối mặt với các vấn đề:
- Chất lượng dữ liệu ghi nhận từ SCADA/Sensor có nhiều khoảng trống (missing), lỗi (sensor frozen), hoặc nhiễu.
- Cần phân biệt rõ giữa lỗi cảm biến (Sensor Anomaly) và sự thay đổi chất lượng nước thực tế (Process Anomaly).
- Biến động chất lượng nước trên Sông Tiền (như hiện tượng tăng độ dẫn điện EC, nguy cơ nhiễm mặn) cần được dự báo sớm vài giờ trước khi nước chảy vào các công đoạn xử lý sâu hơn để có hành động ứng phó phù hợp.
- Cần công cụ giám sát trực quan (Dashboard) hỗ trợ người vận hành ra quyết định, cảnh báo rủi ro dựa trên dữ liệu khoa học.

## 3. Data
Dữ liệu bao gồm các thông số chất lượng nước và vận hành, được lấy mẫu theo giờ tại các vị trí:
- **Sông Tiền**: Level (mực nước), EC (Độ dẫn điện - µS/cm).
- **Hồ nước thô & Trạm bơm cấp 1**: Level, Lưu lượng Qnt, Thông số 5 máy bơm (TS, Current, Temp, Power), pH, Độ đục, Cl2, Màu, Mặn, Độ cứng.
- **Bể lắng**: pH, Độ đục, Màu.
- **Bể lọc**: Level (1-4), Độ đục.
- **Bể chứa**: pH, Độ đục, Cl2.
- **Trạm bơm cấp 2**: pH, Độ đục, Cl2, Màu, Mặn, Độ cứng.

> **QUAN TRỌNG**: Tại Sông Tiền, chỉ tiêu đo trực tiếp là độ dẫn điện (Electrical Conductivity - EC), KHÔNG PHẢI độ mặn (Salinity). Không tự ý nội suy EC thành Salinity nếu chưa có dữ liệu đo đạc thực tế để đối chiếu và huấn luyện.

## 4. Architecture
Hệ thống bao gồm 4 module chính:
- **Module 1 (Data Engineering & Quality):** Tiền xử lý, lọc nhiễu, xử lý missing value, feature engineering (lag, rolling, datetime features).
- **Module 2 (Anomaly Detection):** Rule-based rules và Isolation Forest giúp phân loại Sensor Anomaly và Process Anomaly.
- **Module 3 (Forecasting):** Dự báo River EC từ +1h đến +6h, dùng mô hình Baseline (Persistence) và LightGBM/XGBoost, với cơ chế cross-validation TimeSeriesSplit.
- **Module 4 (Decision Support & Dashboard):** Đánh giá mức độ rủi ro (Risk Assessment), nhật ký cảnh báo (Alerts) và Dashboard giao diện người dùng bằng Streamlit.

## 5. Installation
Yêu cầu hệ thống: Python 3.10+.
```bash
git clone <repository_url>
cd DTW
python3 -m venv venv
source venv/bin/activate  # Hoặc venv\Scripts\activate trên Windows
pip install -r requirements.txt
```

## 6. Data schema
Xem chi tiết tại [Database schema](database/schema.sql) và [Data dictionary](docs/data_dictionary.md).
Dữ liệu được tổ chức lưu trữ logic thành các bảng: `water_quality`, `river_operation`, `pump_operation`, `process_operation`, `anomaly`, `forecast`, `alerts`.

## 7. Data preprocessing
Các vấn đề làm sạch được thực hiện:
- **Missing Value Handling**: Forward-fill có giới hạn (không áp dụng vô điều kiện), đánh dấu dữ liệu thiếu.
- **Sensor Audit**: Phát hiện "sudden jump", "sensor frozen" (loại trừ các trường hợp máy bơm nghỉ - bơm off thì value = 0 là bình thường).
- **Time Alignment**: Đồng bộ timezone (`Asia/Ho_Chi_Minh`) và tần suất lấy mẫu (hourly).
- **Feature Engineering**: Tạo features thời gian (giờ, ngày, sin_hour, cos_hour), Lag features (t-1, t-2, t-6) và Rolling features (mean/std).

## 8. EDA (Exploratory Data Analysis)
Tự động thống kê, mô tả các biến: Mean, Median, Min, Max, Độ lệch chuẩn (Std).
Phân tích tính phân phối và tương quan giữa các biến mục tiêu để hiểu rõ các thông số vận hành (Level, Lưu lượng) ảnh hưởng thế nào đến chất lượng nước. 

## 9. Anomaly detection
- **Thống kê/Rule-based**: Dùng Z-score, IQR, Rolling standard deviation để tìm điểm dị biệt.
- **Machine Learning**: Dùng thuật toán **Isolation Forest** trên cụm biến (EC, Level, Lưu lượng) để tìm đa biến bất thường (Multi-variate anomalies). 
- Đưa ra nhận định: Là bất thường cảm biến (sensor noise/freeze) hay bất thường quy trình (ảnh hưởng từ nguồn nước).

## 10. Forecasting
Tập trung dự báo **Sông Tiền EC** tại các Horizon: `+1h`, `+2h`, `+3h`, `+4h`, `+5h`, `+6h`.
- Khởi tạo **Baseline Model** (Persistence) làm mốc so sánh cơ sở.
- Áp dụng các thuật toán mạnh mẽ như **LightGBM / XGBoost**.
- Deep Learning (GRU/LSTM) chỉ được tích hợp nếu có minh chứng hiệu năng thực sự vượt trội.

## 11. Evaluation
- Dữ liệu được chia theo thời gian (Chronological Split): Train (sớm), Validation (giữa), Test (mới nhất) để tránh Data Leakage.
- Metrics đánh giá theo từng horizon: **MAE**, **RMSE**, **MAPE**, **R²**.
- Hỗ trợ giải thích mô hình bằng Feature Importance (Shap/Gain), giúp người vận hành hiểu vì sao mô hình ra dự báo đó.

## 12. Dashboard
Giao diện **Streamlit** trực quan với 7 trang chính:
1. **Tổng quan:** Hiện trạng các chỉ số chính và tình trạng Máy Bơm.
2. **Water Quality:** Biểu đồ xu hướng và các KPI thống kê tại từng khu vực.
3. **River Monitoring:** Cảnh báo và dự báo EC tại Sông Tiền trong 6 giờ tiếp theo.
4. **Pump Monitoring:** Trạng thái chi tiết (Tần số, Dòng, Nhiệt, Công suất) của 5 máy bơm.
5. **Anomaly Detection:** Nhật ký các điểm dị biệt và mức độ nghiêm trọng.
6. **Forecast:** Đối chiếu giá trị Thực Tế và giá trị Dự Báo theo từng mô hình và Horizon.
7. **Alert Log:** Các cảnh báo rủi ro hỗ trợ người vận hành ra quyết định.

## 13. How to run
Thực thi tuần tự các module trong Data Pipeline:

```bash
# 1. Khởi tạo dữ liệu giả lập (Nếu chưa có dữ liệu thật)
python3 -m src.data.generate_synthetic_data

# 2. Xử lý và làm sạch dữ liệu
python3 main.py clean

# 3. Phân tích mô tả (EDA)
python3 main.py eda

# 4. Chạy mô hình phát hiện bất thường
python3 main.py detect-anomalies

# 5. Huấn luyện và dự báo
python3 main.py forecast-ec

# 6. Đánh giá rủi ro, sinh cảnh báo (Decision Support)
python3 main.py decision-support

# 7. Khởi động giao diện Dashboard (Local Server)
streamlit run dashboard/app.py
```

## 14. Limitations
- Hệ thống chỉ cung cấp Khuyến Nghị (Recommendation/Decision Support), không tự động điều khiển van, cống hay PLC/SCADA.
- Các ngưỡng giá trị (Threshold) phụ thuộc nhiều vào tham chiếu của từng nhà máy và cần được cấu hình thực tế trong `config.yaml`.
- Việc quy đổi từ EC sang Salinity (Độ mặn) chưa khả thi nếu thiếu tập dữ liệu nhãn Ground-truth đo đạc thật sự.

## 15. Future work
- Áp dụng hệ thống trực tiếp vào dữ liệu thật (Real-time Data Streaming) của nhà máy.
- Tính toán chính xác **Removal Efficiency** (Hiệu suất xử lý) sau khi xác định được thời gian trễ (time-lag) nước di chuyển giữa các bể thông qua Tracer test.
- Nghiên cứu mở rộng việc áp dụng Deep Learning (LSTM) cho các chuỗi thời gian dài và phức tạp hơn khi lượng dữ liệu lớn.
- Phát triển API để kết nối trực tiếp với Database SCADA.
