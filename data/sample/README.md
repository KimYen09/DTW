# Synthetic sample data

**SYNTHETIC / SIMULATED — NOT FACTORY DATA**

Các file trong thư mục này được tạo bởi `src/data/generate_synthetic_data.py`
để phát triển và kiểm thử pipeline trước khi nhận dữ liệu thật. Chúng không là
dữ liệu vận hành thật, không mô tả chính xác quy luật thủy lực/hóa lý, và không
được dùng để kết luận về Sông Tiền hoặc nhà máy.

## Files

| File | Nội dung |
|---|---|
| `water_plant_synthetic_hourly.csv` | Dữ liệu dạng wide theo giờ; một dòng duplicate được chèn có chủ đích |
| `synthetic_event_labels.csv` | Ground truth của các lỗi/sự kiện mô phỏng, chỉ dùng đánh giá nội bộ |
| `synthetic_metadata.json` | Nguồn dữ liệu, seed, số hàng và cảnh báo sử dụng |

## Sự kiện mô phỏng có chủ đích

- Mất tín hiệu EC và thiếu dữ liệu độ đục hồ nước thô.
- Giá trị bơm 3 bị frozen.
- Spike EC ngắn hạn không có biến hỗ trợ.
- Drift nhiệt độ bơm 2.
- Nhiễu/bất thường độ đục kéo dài qua nhiều công đoạn.
- Giá trị dòng điện âm không hợp lệ.
- Timestamp/record duplicate và record không theo thứ tự thời gian.

`river_ec_us_cm` là EC mô phỏng; không có công thức chuyển đổi EC thành salinity.
