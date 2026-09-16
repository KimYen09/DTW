"""Read-only Streamlit dashboard for water-plant decision support."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import streamlit as st

from data_loader import load_dashboard_data


st.set_page_config(page_title="Water Plant Analytics", page_icon="💧", layout="wide")

UNIT_BY_COLUMN = {
    "river_ec_us_cm": "µS/cm", "river_level_m": "m", "raw_water_level_m": "m", "qnt_m3_h": "m³/h",
    "raw_water_ph": "", "settling_ph": "", "storage_ph": "", "secondary_ph": "",
    "raw_water_turbidity_ntu": "NTU", "settling_turbidity_ntu": "NTU", "filter_basin_turbidity_ntu": "NTU",
    "storage_turbidity_ntu": "NTU", "secondary_turbidity_ntu": "NTU",
    "raw_water_chlorine_cl2_mg_l": "mg/L", "storage_chlorine_cl2_mg_l": "mg/L", "secondary_chlorine_cl2_mg_l": "mg/L",
}
WATER_QUALITY_OPTIONS = {
    "Hồ nước thô": {
        "pH": "raw_water_ph", "Độ đục": "raw_water_turbidity_ntu", "Cl2": "raw_water_chlorine_cl2_mg_l",
        "Màu": "raw_water_color_tcu", "Mặn": "raw_water_salinity_mg_l", "Độ cứng": "raw_water_hardness_mg_l",
    },
    "Bể lắng": {"pH": "settling_ph", "Độ đục": "settling_turbidity_ntu", "Màu": "settling_color_tcu"},
    "Bể lọc": {"Độ đục": "filter_basin_turbidity_ntu"},
    "Bể chứa": {"pH": "storage_ph", "Độ đục": "storage_turbidity_ntu", "Cl2": "storage_chlorine_cl2_mg_l"},
    "Trạm bơm cấp 2": {
        "pH": "secondary_ph", "Độ đục": "secondary_turbidity_ntu", "Cl2": "secondary_chlorine_cl2_mg_l",
        "Màu": "secondary_color_tcu", "Mặn": "secondary_salinity_mg_l", "Độ cứng": "secondary_hardness_mg_l",
    },
}


@st.cache_data(show_spinner=False)
def get_data() -> dict:
    """Cache read-only artifacts for responsive page navigation."""
    return load_dashboard_data()


def _prepare_timeframe(frame: pd.DataFrame, column: str = "timestamp") -> pd.DataFrame:
    """Return a copy with safely parsed, sorted timestamps for charts."""
    if frame.empty or column not in frame:
        return frame
    result = frame.copy()
    result[column] = pd.to_datetime(result[column], errors="coerce")
    return result.dropna(subset=[column]).sort_values(column)


def _latest_value(frame: pd.DataFrame, column: str) -> tuple[float | None, str | None]:
    """Read the latest non-null observation and timestamp for one column."""
    if frame.empty or column not in frame:
        return None, None
    valid = frame.dropna(subset=[column])
    if valid.empty:
        return None, None
    row = valid.iloc[-1]
    return float(row[column]), str(row["timestamp"])


def _metric(label: str, value: float | None, unit: str = "") -> None:
    """Render a metric while retaining a clear unavailable state."""
    display = "N/A" if value is None else f"{value:,.3f} {unit}".strip()
    st.metric(label, display)


def _show_synthetic_banner() -> None:
    """Keep simulated-data status visible throughout the dashboard."""
    st.warning("Dữ liệu hiện tại là SYNTHETIC / SIMULATED — NOT FACTORY DATA. Dashboard chỉ hỗ trợ xem xét vận hành, không điều khiển thiết bị.")


def overview(data: dict) -> None:
    """Render the high-level operational overview."""
    st.header("Tổng quan")
    cleaned = _prepare_timeframe(data["cleaned"])
    if cleaned.empty:
        st.error("Chưa có clean dataset. Chạy `python3 main.py clean` trước.")
        return
    _show_synthetic_banner()
    columns = st.columns(6)
    metrics = [
        ("Current EC", "river_ec_us_cm"), ("Current pH (bể chứa)", "storage_ph"),
        ("Current Turbidity (bể chứa)", "storage_turbidity_ntu"), ("Current Cl2 (bể chứa)", "storage_chlorine_cl2_mg_l"),
        ("Current River Level", "river_level_m"), ("Qnt", "qnt_m3_h"),
    ]
    for container, (label, parameter) in zip(columns, metrics):
        with container:
            value, _ = _latest_value(cleaned, parameter)
            _metric(label, value, UNIT_BY_COLUMN.get(parameter, ""))

    alerts = data["alerts"]
    risk_summary = data["risk_summary"]
    left, middle, right = st.columns(3)
    with left:
        st.metric("Active alerts", int((alerts.get("status") == "open").sum()) if not alerts.empty else 0)
    with middle:
        st.metric("Current risk", risk_summary.get("current_risk_level", "NORMAL"))
    with right:
        health = "Review needed" if data["quality_summary"].get("quality_issue_count", 0) else "No logged issues"
        st.metric("Sensor health", health)

    st.subheader("Pump status — latest timestamp")
    latest = cleaned.iloc[-1]
    pump_rows = []
    for pump_id in range(1, 6):
        frequency = latest.get(f"pump_{pump_id}_ts_hz")
        pump_rows.append({
            "Pump": pump_id, "TS (Hz)": frequency, "Current (A)": latest.get(f"pump_{pump_id}_current_a"),
            "Temperature (°C)": latest.get(f"pump_{pump_id}_temperature_c"), "Power (kW)": latest.get(f"pump_{pump_id}_power_kw"),
            "Status": "Running candidate" if pd.notna(frequency) and frequency > 0 else "Stopped/unknown",
        })
    st.dataframe(pd.DataFrame(pump_rows), use_container_width=True, hide_index=True)


def water_quality(data: dict) -> None:
    """Render location-selectable water quality statistics and trend."""
    st.header("Water Quality")
    cleaned = _prepare_timeframe(data["cleaned"])
    if cleaned.empty:
        st.error("Chưa có clean dataset.")
        return
    _show_synthetic_banner()
    location = st.selectbox("Vị trí", list(WATER_QUALITY_OPTIONS))
    options = WATER_QUALITY_OPTIONS[location]
    display_parameter = st.selectbox("Chỉ tiêu", list(options))
    parameter = options[display_parameter]
    series = cleaned[["timestamp", parameter]].dropna()
    if series.empty:
        st.info("Không có quan sát hợp lệ cho lựa chọn này.")
        return
    value = series[parameter]
    latest = float(value.iloc[-1])
    metrics = st.columns(6)
    for container, label, result in zip(metrics, ["Min", "Max", "Mean", "Median", "Std. dev.", "Current"], [value.min(), value.max(), value.mean(), value.median(), value.std(), latest]):
        with container:
            _metric(label, float(result), UNIT_BY_COLUMN.get(parameter, ""))
    st.line_chart(series.set_index("timestamp"), y=parameter, use_container_width=True)
    if location == "Bể chứa" and parameter == "storage_ph":
        st.caption("Reference range 6.0–8.5 is shown only for storage-tank pH, as supplied. It is not applied automatically elsewhere.")


def river_monitoring(data: dict) -> None:
    """Render River Level/EC trend, candidates and six-hour EC forecast."""
    st.header("River Monitoring")
    cleaned = _prepare_timeframe(data["cleaned"])
    if cleaned.empty:
        st.error("Chưa có clean dataset.")
        return
    _show_synthetic_banner()
    st.subheader("Sông Tiền Level và EC")
    st.line_chart(cleaned.set_index("timestamp")[["river_level_m", "river_ec_us_cm"]], use_container_width=True)
    st.caption("EC là Electrical Conductivity (µS/cm), không phải độ mặn.")

    anomalies = data["anomalies"]
    river_anomalies = anomalies[anomalies["parameter"] == "river_ec_us_cm"] if not anomalies.empty else pd.DataFrame()
    st.subheader("EC anomaly candidates")
    if river_anomalies.empty:
        st.info("Không có EC anomaly candidate.")
    else:
        st.dataframe(river_anomalies[["timestamp", "value", "detection_method", "anomaly_type", "severity", "explanation"]], use_container_width=True, hide_index=True)

    next_forecast = _prepare_timeframe(data["next_forecast"], "target_timestamp")
    st.subheader("EC forecast +1h đến +6h")
    if next_forecast.empty:
        st.info("Chưa có forecast. Chạy `python3 main.py forecast-ec`.")
    else:
        st.line_chart(next_forecast.set_index("target_timestamp")[["prediction"]], use_container_width=True)
        st.dataframe(next_forecast[["target_timestamp", "horizon_hours", "model", "prediction"]], use_container_width=True, hide_index=True)


def pump_monitoring(data: dict) -> None:
    """Render all pump latest values and selectable historical trends."""
    st.header("Pump Monitoring")
    cleaned = _prepare_timeframe(data["cleaned"])
    if cleaned.empty:
        st.error("Chưa có clean dataset.")
        return
    _show_synthetic_banner()
    pump_id = st.selectbox("Máy bơm", [1, 2, 3, 4, 5])
    parameters = [f"pump_{pump_id}_{suffix}" for suffix in ("ts_hz", "current_a", "temperature_c", "power_kw")]
    labels = ["TS (Hz)", "Current (A)", "Temperature (°C)", "Power (kW)"]
    latest = cleaned.iloc[-1]
    cards = st.columns(4)
    for container, label, parameter in zip(cards, labels, parameters):
        with container:
            _metric(label, None if pd.isna(latest[parameter]) else float(latest[parameter]))
    st.line_chart(cleaned.set_index("timestamp")[parameters], use_container_width=True)
    st.caption("TS và C/S cần được kỹ thuật viên xác nhận ý nghĩa SCADA trước khi diễn giải sâu hoặc dùng làm rule vận hành.")


def anomaly_detection(data: dict) -> None:
    """Render filterable anomaly candidate log."""
    st.header("Anomaly Detection")
    anomalies = data["anomalies"]
    _show_synthetic_banner()
    if anomalies.empty:
        st.info("Chưa có anomaly candidates. Chạy `python3 main.py detect-anomalies`.")
        return
    locations = ["All"] + sorted(anomalies["location"].dropna().unique().tolist())
    types = ["All"] + sorted(anomalies["anomaly_type"].dropna().unique().tolist())
    severities = ["All"] + sorted(anomalies["severity"].dropna().unique().tolist())
    first, second, third = st.columns(3)
    location = first.selectbox("Location", locations)
    anomaly_type = second.selectbox("Anomaly type", types)
    severity = third.selectbox("Severity", severities)
    result = anomalies.copy()
    if location != "All":
        result = result[result["location"] == location]
    if anomaly_type != "All":
        result = result[result["anomaly_type"] == anomaly_type]
    if severity != "All":
        result = result[result["severity"] == severity]
    st.dataframe(result, use_container_width=True, hide_index=True)
    st.caption("Các dòng là anomaly candidates cần xác minh, không phải chẩn đoán nguyên nhân chắc chắn.")


def forecast_page(data: dict) -> None:
    """Render model comparison and actual-versus-forecast series."""
    st.header("Forecast")
    _show_synthetic_banner()
    metrics, predictions = data["forecast_metrics"], _prepare_timeframe(data["forecast_predictions"], "target_timestamp")
    if metrics.empty or predictions.empty:
        st.info("Chưa có forecast artifacts. Chạy `python3 main.py forecast-ec`.")
        return
    st.subheader("Test metrics by horizon")
    st.dataframe(metrics[["horizon_hours", "model", "mae", "rmse", "mape_percent", "r2", "selected_for_operational_forecast"]], use_container_width=True, hide_index=True)
    horizon = st.selectbox("Horizon", sorted(predictions["horizon_hours"].unique().tolist()))
    model = st.selectbox("Model", sorted(predictions["model"].unique().tolist()))
    series = predictions[(predictions["horizon_hours"] == horizon) & (predictions["model"] == model)]
    st.line_chart(series.set_index("target_timestamp")[["actual", "prediction"]], use_container_width=True)
    st.caption("Point forecast only. Confidence interval chưa được hiệu chỉnh trên dữ liệu thật.")


def alert_log(data: dict) -> None:
    """Render the read-only operational alert log."""
    st.header("Alert Log")
    _show_synthetic_banner()
    alerts = data["alerts"]
    if alerts.empty:
        st.info("Chưa có alerts. Chạy `python3 main.py decision-support`.")
        return
    st.dataframe(alerts, use_container_width=True, hide_index=True)
    st.caption("Acknowledgement đang là trường read-only. Dashboard không thay đổi dữ liệu sản xuất hay trạng thái vận hành.")


def main() -> None:
    """Route the selected Streamlit page."""
    data = get_data()
    st.sidebar.title("Water Plant Analytics")
    page = st.sidebar.radio("Trang", [
        "Tổng quan", "Water Quality", "River Monitoring", "Pump Monitoring",
        "Anomaly Detection", "Forecast", "Alert Log",
    ])
    st.sidebar.caption("Decision support only — no PLC/SCADA control")
    if st.sidebar.button("Refresh data"):
        get_data.clear()
        st.rerun()
    pages = {
        "Tổng quan": overview, "Water Quality": water_quality, "River Monitoring": river_monitoring,
        "Pump Monitoring": pump_monitoring, "Anomaly Detection": anomaly_detection,
        "Forecast": forecast_page, "Alert Log": alert_log,
    }
    pages[page](data)


if __name__ == "__main__":
    main()
