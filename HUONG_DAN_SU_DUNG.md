# Hướng Dẫn Kiểm Tra và Sử Dụng Dự Án DTW SCADA & AI

Tài liệu này hướng dẫn chi tiết cách khởi chạy, kiểm thử và sử dụng **Hệ thống Giám sát SCADA & AI Nhà máy Nước Đồng Tâm (DTW)**. Dự án bao gồm phần Phân tích Dữ liệu (Python/Backend) và Giao diện tương tác trực quan (React/Frontend).

---

## 1. Yêu cầu hệ thống (Prerequisites)
- **Node.js** (Phiên bản >= 18.x) dành cho Frontend (React/Vite).
- **Python** (Phiên bản >= 3.10) dành cho Backend và Data Pipeline.
- Trình duyệt web hiện đại (Chrome, Edge, Safari).

---

## 2. Cách khởi chạy dự án (How to run)

### A. Khởi chạy Giao diện Web & Mobile (Frontend)
Đây là phần giao diện tương tác chính (Dashboard & Tool Hub).
Mở Terminal, đi tới thư mục chứa dự án và chạy các lệnh sau:

```bash
# 1. Di chuyển vào thư mục frontend
cd frontend

# 2. Cài đặt các thư viện (nếu chưa cài)
npm install

# 3. Khởi chạy máy chủ phát triển
npm run dev
```
> **Lưu ý:** Mặc định, giao diện sẽ chạy tại địa chỉ: **http://localhost:3000**. Hãy mở liên kết này trên trình duyệt.

### B. Khởi chạy Data Pipeline & Backend (Python)
Mở một cửa sổ Terminal **mới**, đi tới thư mục gốc của dự án (`DTW`) và chạy:

```bash
# 1. Kích hoạt môi trường ảo (nếu có)
source venv/bin/activate  # Trên Mac/Linux
# hoặc: venv\Scripts\activate # Trên Windows

# 2. Cài đặt thư viện Python (nếu chưa cài)
pip install -r requirements.txt

# 3. Chạy toàn bộ luồng xử lý AI (tạo dữ liệu, làm sạch, dự báo)
python3 main.py all

# 4. Xem giao diện Data Dashboard cơ bản (Streamlit - tuỳ chọn)
streamlit run dashboard/app.py
```

---

## 3. Hướng dẫn Kiểm tra và Trải nghiệm (Testing Guide)

Khi đã mở **http://localhost:3000** trên trình duyệt, hãy làm theo các kịch bản sau để kiểm tra toàn bộ tính năng:

### Kịch bản 1: Trải nghiệm Giao diện Trang chủ (Intro Page)
- **Quan sát thiết kế:** Nền nước gợn sóng có thể tương tác (bấm chuột để thấy gợn sóng). 
- **Đọc thông tin:** Đọc phần Sứ mệnh và các luồng nghiệp vụ của DTW.
- Chú ý dòng slogan *"Đồng Tâm - Hợp lực - Toả sáng"* đã được căn chỉnh cân bằng kích thước chữ tự động.

### Kịch bản 2: Kiểm tra Giao diện trên Máy tính (SCADA Dashboard)
- Tại trang chủ, bấm vào nút **Khám Phá Tổng Quan SCADA**.
- **Điều hướng:** Dùng thanh Menu bên trái để chuyển qua lại giữa các module:
  - **Tổng quan (Overview):** Xem 6 chỉ số trọng yếu.
  - **Chất lượng nước:** Theo dõi pH, Độ đục, Clo dư so với chuẩn QCVN 01-1.
  - **Phát hiện bất thường (Anomaly Detection):** Xem danh sách các điểm dị biệt AI phát hiện, thử tính năng **Bộ lọc** và **Tìm kiếm** trong bảng dữ liệu.
  - **Giám sát trạm bơm:** Xem biểu đồ dòng điện, áp suất.
- **Tính năng bổ sung:** Bấm nút chuyển đổi Chế độ Sáng/Tối (Dark/Light mode) ở góc trên bên phải. Thử nút hình chiếc chuông cảnh báo (Alert) để xem ngăn chứa thông báo.

### Kịch bản 3: Kiểm tra Giao diện trên Điện thoại (Mobile Tool Hub)
Dự án được tích hợp tính năng **Tự động nhận diện thiết bị**.
- **Cách test:** 
  1. Nhấn `F12` để mở Developer Tools trên trình duyệt.
  2. Bật chế độ "Toggle Device Toolbar" (biểu tượng điện thoại). Chọn thiết bị như iPhone 12/14.
  3. Làm mới (Refresh) lại trang chủ (`F5`).
  4. Bấm vào nút **Khám Phá Tổng Quan SCADA** một lần nữa.
- **Kết quả mong đợi:** Ứng dụng sẽ thông minh **không** mở giao diện máy tính, mà sẽ tự động chuyển hướng bạn vào **Giao diện Cổng Công Cụ (Tool Hub)** tối giản dành riêng cho điện thoại.
- **Trải nghiệm Hub:** 
  - Cuộn dọc để xem danh sách các tính năng.
  - Thử gõ vào thanh **Tìm kiếm** (ví dụ: gõ "AI" hoặc "Sông Tiền").
  - Bấm vào một công cụ bất kỳ, hệ thống sẽ mở đúng tính năng đó.

---

## 4. Xử lý sự cố thường gặp (Troubleshooting)

- **Lỗi "Port in use" (Lỗi trùng cổng):** 
  Nếu chạy `npm run dev` báo cổng 3000 đã được sử dụng, hãy tắt các terminal cũ đang chạy, hoặc truy cập vào đường dẫn mới mà Terminal cung cấp (ví dụ `http://localhost:3001`).

- **Giao diện không tự chuyển sang Mobile?**
  Đảm bảo rằng bạn đã làm mới lại trang web (F5) **SAU KHI** bật chế độ giả lập điện thoại (F12) để thuộc tính `window.innerWidth` được trình duyệt cập nhật chính xác kích thước màn hình (nhỏ hơn 768px).
