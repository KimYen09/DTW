# Quy ước dữ liệu và time alignment

## Timestamp

- Chuẩn lưu trữ: ISO-8601 có offset, timezone nghiệp vụ `Asia/Ho_Chi_Minh`.
- Tần suất mục tiêu: một bản ghi mỗi giờ cho từng biến.
- Không tự động sắp xếp rồi bỏ timestamp trùng: giữ raw, đánh dấu và ghi lý do
  hợp nhất/chọn bản ghi trong `data_quality_log`.
- Mỗi giờ bị thiếu phải tạo cờ `missing_hour`; không tạo giá trị đo giả.

## Đơn vị

Chuẩn đơn vị: level `m`, EC `µS/cm`, Qnt `m³/h`, turbidity `NTU`, chlorine và
salinity/hardness `mg/L`, color `TCU`, current `A`, temperature `°C`, power
`kW`, TS `Hz`. Nếu dữ liệu nguồn khác chuẩn, pipeline chỉ chuyển đổi khi đơn vị
nguồn được xác nhận và lưu lại phép chuyển đổi trong audit log.

## Missing và dữ liệu thay thế

- Missing do không có bản ghi, `NULL`, mã mất tín hiệu hoặc timestamp bị thiếu
  phải được phân biệt.
- Không forward-fill mặc định. Các cách nội suy/chuyển tiếp chỉ được áp dụng
  riêng theo biến, khoảng thiếu và mục tiêu phân tích; mọi áp dụng phải log.
- Một giá trị được làm sạch không thay thế raw data; raw data luôn được giữ lại.

## Bơm và sudden jump

Khi chưa có xác nhận trạng thái vận hành của bơm, một thay đổi đột ngột của
TS/current/power/temperature có thể chỉ là bơm start/stop hoặc đổi tải. Vì vậy
Phase 4 chỉ kiểm tra generic sudden jump cho biến ngoài nhóm bơm. Đánh giá jump
của bơm sẽ dùng rule theo trạng thái ở Phase 6, sau **[NEED FACTORY CONFIRMATION]**
về TS, C/S và trạng thái run/stop.

## Ghép dữ liệu giữa công đoạn

Không ghép đơn thuần theo cùng timestamp để tính removal efficiency. Trước hết
cần **[NEED FACTORY CONFIRMATION]** về thời gian lưu/thời gian di chuyển nước,
chu kỳ lấy mẫu, và ý nghĩa của mỗi phép đo. Khi chưa xác nhận, dashboard chỉ
trình bày xu hướng từng công đoạn và correlation có cảnh báo không suy luận nhân quả.

## EC và salinity

`river_ec` là EC đo trực tiếp. Không đổi EC thành salinity bằng công thức mặc
định. Salinity tại hồ nước thô/trạm bơm cấp 2 là biến đo downstream nếu dữ liệu
có sẵn. Chỉ xây dựng estimated salinity khi dữ liệu nhãn đủ tốt và mô hình được
đánh giá bằng tập test theo thời gian.
