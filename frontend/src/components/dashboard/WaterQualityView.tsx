import { useState } from 'react';
import { Filter, Droplet, CheckCircle2, AlertCircle } from 'lucide-react';
import { waterQualityTimeSeries } from '../../data/mockScadaData';
import { InteractiveTimeSeriesChart } from '../charts/InteractiveTimeSeriesChart';

export function WaterQualityView() {
  const [selectedLocation, setSelectedLocation] = useState('raw_water');
  const [selectedMetric, setSelectedMetric] = useState('ph');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('90d');

  // Filter or adjust dataset based on selected metric
  const chartData = waterQualityTimeSeries.map((item) => {
    let val = item.raw_ph;
    if (selectedMetric === 'turbidity') val = item.turbidity;
    else if (selectedMetric === 'chlorine') val = item.chlorine;
    else if (selectedMetric === 'ph_storage') val = item.ph;

    return {
      day: item.day,
      val: val
    };
  });

  // Descriptive stats based on chosen metric
  const stats = selectedMetric === 'turbidity' ? {
    min: 3.60,
    max: 5.10,
    mean: 4.15,
    median: 4.10,
    stdDev: 0.38,
    current: 4.24,
    unit: 'NTU',
    standard: '< 2.0 NTU sau lọc',
    isSafe: false
  } : selectedMetric === 'chlorine' ? {
    min: 1.15,
    max: 1.30,
    mean: 1.22,
    median: 1.21,
    stdDev: 0.04,
    current: 1.20,
    unit: 'mg/L',
    standard: '0.8 - 1.2 mg/L',
    isSafe: true
  } : {
    min: 6.715,
    max: 7.363,
    mean: 7.050,
    median: 7.051,
    stdDev: 0.090,
    current: 7.074,
    unit: 'pH',
    standard: '6.5 - 8.5',
    isSafe: true
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Filters Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4 text-cyan-500" />
          <span>Bộ lọc thông số quan trắc (Telemetry Filters)</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Location selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Vị trí quan trắc
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="raw_water">Hồ nước thô (Raw Water Reservoir)</option>
              <option value="storage_tank">Bể chứa nước sạch (Treated Water Storage Tank)</option>
              <option value="lamella">Bể lắng Lamen (Lamella Clarifier)</option>
              <option value="filter_bed">Bể lọc cát thạch anh (Sand Filter Bed)</option>
            </select>
          </div>

          {/* Metric selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Chỉ tiêu chất lượng
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ph">pH (Độ kiềm/axit hồ nước thô)</option>
              <option value="turbidity">Độ đục (Turbidity NTU)</option>
              <option value="chlorine">Clo dư khử trùng (Residual Chlorine mg/L)</option>
              <option value="ph_storage">pH bể chứa thành phẩm (pH Storage)</option>
            </select>
          </div>

          {/* Timeframe buttons */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Khung thời gian xem
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedTimeframe('7d')}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  selectedTimeframe === '7d'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                7 Ngày
              </button>
              <button
                onClick={() => setSelectedTimeframe('30d')}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  selectedTimeframe === '30d'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                30 Ngày
              </button>
              <button
                onClick={() => setSelectedTimeframe('90d')}
                className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                  selectedTimeframe === '90d'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                Q1/2025 (90d)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Descriptive Statistics Cards */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Thống kê mô tả: {selectedMetric.toUpperCase()} ({selectedLocation === 'raw_water' ? 'Hồ Nước Thô' : 'Bể Chứa'})
          </h3>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            Quy chuẩn QCVN: {stats.standard}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <span className="text-xs text-slate-400">Thấp nhất (Min)</span>
            <div className="mt-1 text-xl font-black text-slate-800 dark:text-slate-200">
              {stats.min.toFixed(3)}
            </div>
            <span className="text-[11px] text-slate-400">Giá trị nhỏ nhất</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <span className="text-xs text-slate-400">Cao nhất (Max)</span>
            <div className="mt-1 text-xl font-black text-slate-800 dark:text-slate-200">
              {stats.max.toFixed(3)}
            </div>
            <span className="text-[11px] text-slate-400">Giá trị lớn nhất</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <span className="text-xs text-slate-400">Trung bình (Mean)</span>
            <div className="mt-1 text-xl font-black text-cyan-600 dark:text-cyan-400">
              {stats.mean.toFixed(3)}
            </div>
            <span className="text-[11px] text-slate-400">Trung bình cộng</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <span className="text-xs text-slate-400">Trung vị (Median)</span>
            <div className="mt-1 text-xl font-black text-slate-800 dark:text-slate-200">
              {stats.median.toFixed(3)}
            </div>
            <span className="text-[11px] text-slate-400">Trung vị phân bố</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <span className="text-xs text-slate-400">Độ lệch chuẩn (Std. dev.)</span>
            <div className="mt-1 text-xl font-black text-amber-500">
              {stats.stdDev.toFixed(3)}
            </div>
            <span className="text-[11px] text-slate-400">Độ lệch chuẩn</span>
          </div>

          <div className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 p-3.5 shadow-sm backdrop-blur-sm dark:bg-cyan-950/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">Hiện tại (Current)</span>
              {stats.isSafe ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <div className="mt-1 text-xl font-black text-cyan-600 dark:text-cyan-300">
              {stats.current.toFixed(3)} {stats.unit}
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {stats.isSafe ? 'Tức thời (Đạt chuẩn)' : 'Cần chú ý theo dõi'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Time-Series Graph */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Chuỗi thời gian: {selectedMetric.toUpperCase()} ({selectedLocation === 'raw_water' ? 'Hồ nước thô' : 'Bể chứa'})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tần suất mẫu 1 giờ, tự động nội suy và loại bỏ nhiễu rung cảm biến
            </p>
          </div>
        </div>

        <InteractiveTimeSeriesChart
          data={chartData}
          metricLabel={`raw_water_${selectedMetric}`}
          unit={stats.unit}
          minThreshold={selectedMetric === 'ph' ? 6.5 : undefined}
          maxThreshold={selectedMetric === 'ph' ? 8.5 : undefined}
          thresholdLabel={selectedMetric === 'ph' ? 'Ngưỡng an toàn (6.5 - 8.5)' : undefined}
          lineColor="#06b6d4"
        />
      </div>
    </div>
  );
}
