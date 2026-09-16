import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Droplets,
  Filter,
  BarChart2,
  Calendar,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';
import { waterQualityStatsMap, generateWaterQualitySeries } from '../data/mockData';

export const WaterQualityView: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<'raw_reservoir' | 'storage_tank'>('raw_reservoir');
  const [selectedMetric, setSelectedMetric] = useState<'ph' | 'ec' | 'turbidity' | 'cl2'>('ph');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');

  // Load static or current stats
  const locationStats = waterQualityStatsMap[selectedLocation] || waterQualityStatsMap.raw_reservoir;
  const currentStat = locationStats[selectedMetric] || locationStats.ph;

  // Chart data
  const rawData = useMemo(() => generateWaterQualitySeries(), []);

  const filteredData = useMemo(() => {
    if (timeRange === '7d') return rawData.slice(-7);
    if (timeRange === '30d') return rawData.slice(-30);
    return rawData;
  }, [rawData, timeRange]);

  // Determine active data key based on selection
  const getDataKey = () => {
    if (selectedMetric === 'ph') {
      return selectedLocation === 'raw_reservoir' ? 'raw_water_ph' : 'treated_water_ph';
    }
    if (selectedMetric === 'ec') return 'ec';
    if (selectedMetric === 'turbidity') return 'turbidity';
    if (selectedMetric === 'cl2') return 'chlorine';
    return 'raw_water_ph';
  };

  const currentDataKey = getDataKey();

  return (
    <div id="water-quality-view" className="space-y-6 pb-12">
      {/* Filter Control Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-700 dark:text-slate-400 font-mono uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
          Bộ lọc thông số quan trắc (Telemetry Filters)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Location Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vị trí quan trắc
            </label>
            <select
              id="select-wq-location"
              value={selectedLocation}
              onChange={(e) => {
                const val = e.target.value as 'raw_reservoir' | 'storage_tank';
                setSelectedLocation(val);
                if (val === 'raw_reservoir' && selectedMetric === 'cl2') {
                  setSelectedMetric('ph');
                }
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="raw_reservoir">Hồ nước thô (Raw Water Reservoir)</option>
              <option value="storage_tank">Bể chứa nước sạch (Treated Water Storage Tank)</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Chỉ tiêu chất lượng
            </label>
            <select
              id="select-wq-metric"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="ph">pH (Độ kiềm/axit)</option>
              <option value="ec">EC - Electrical Conductivity (µS/cm)</option>
              <option value="turbidity">Turbidity - Độ đục (NTU)</option>
              {selectedLocation === 'storage_tank' && (
                <option value="cl2">Cl2 - Clo dư khử trùng (mg/L)</option>
              )}
            </select>
          </div>

          {/* Time Preset */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Khung thời gian xem
            </label>
            <div className="flex rounded-lg bg-slate-50 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTimeRange('7d')}
                className={`flex-1 py-1 text-xs rounded font-medium transition-all ${
                  timeRange === '7d'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-700 dark:text-slate-400 hover:text-white'
                }`}
              >
                7 Ngày
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30d')}
                className={`flex-1 py-1 text-xs rounded font-medium transition-all ${
                  timeRange === '30d'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-700 dark:text-slate-400 hover:text-white'
                }`}
              >
                30 Ngày
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`flex-1 py-1 text-xs rounded font-medium transition-all ${
                  timeRange === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-700 dark:text-slate-400 hover:text-white'
                }`}
              >
                Q1/2025 (90d)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Row (Min, Max, Mean, Median, Std. dev., Current) Exactly like Image 2 */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
            Thống kê mô tả: {currentStat.parameter} ({currentStat.location})
          </span>
          <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-mono">
            Quy chuẩn: {currentStat.targetRange[0]} - {currentStat.targetRange[1]} {currentStat.unit}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Min */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">Min</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {currentStat.min.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Giá trị nhỏ nhất</span>
          </div>

          {/* Max */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">Max</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {currentStat.max.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Giá trị lớn nhất</span>
          </div>

          {/* Mean */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">Mean</span>
            <div className="text-xl font-bold font-mono text-cyan-800 dark:text-cyan-300 mt-1">
              {currentStat.mean.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Trung bình cộng</span>
          </div>

          {/* Median */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">Median</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {currentStat.median.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Trung vị phân bố</span>
          </div>

          {/* Std. dev. */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs text-slate-700 dark:text-slate-400 font-medium">Std. dev.</span>
            <div className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1">
              {currentStat.stdDev.toFixed(3)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Độ lệch chuẩn</span>
          </div>

          {/* Current */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-sm">
            <span className="text-xs text-cyan-800 dark:text-cyan-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Current
            </span>
            <div className="text-xl font-bold font-mono text-cyan-200 mt-1">
              {currentStat.current.toFixed(3)}
            </div>
            <span className="text-[10px] text-cyan-700 dark:text-cyan-400/80 font-mono">Tức thời {currentStat.unit}</span>
          </div>
        </div>
      </div>

      {/* Main Time-series Chart */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              Chuỗi thời gian: {currentStat.parameter} ({currentStat.location})
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Tần suất mẫu 1 giờ, tự động nội suy và loại bỏ nhiễu rung
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              {currentDataKey}
            </span>
            {selectedMetric === 'ph' && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-rose-400/70 border-dashed border-b border-rose-400 inline-block" />
                Ngưỡng an toàn (6.5 - 8.5)
              </span>
            )}
          </div>
        </div>

        {/* Chart container */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={10}
              />
              <YAxis
                domain={
                  selectedMetric === 'ph'
                    ? [6.4, 7.8]
                    : selectedMetric === 'ec'
                    ? [200, 320]
                    : [0, 'auto']
                }
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => v.toFixed(1)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                }}
                formatter={(val: any) => [
                  `${Number(val).toFixed(3)} ${currentStat.unit}`,
                  currentStat.parameter
                ]}
                labelFormatter={(label) => `Thời điểm: ${label}`}
              />
              {selectedMetric === 'ph' && (
                <>
                  <ReferenceLine
                    y={6.5}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: 'Min QCVN 6.5', fill: '#ef4444', fontSize: 10, position: 'insideBottomLeft' }}
                  />
                  <ReferenceLine
                    y={8.5}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{ value: 'Max QCVN 8.5', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }}
                  />
                </>
              )}
              <Line
                type="monotone"
                dataKey={currentDataKey}
                name={currentStat.parameter}
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0284c7', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Note */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400 shrink-0" />
            Dữ liệu quan trắc liên tục với cảm biến phân tích quang phổ quang học & điện cực thủy tinh.
          </span>
          <span className="font-mono text-slate-500">Mẫu: 90 điểm chuỗi thời gian</span>
        </div>
      </div>
    </div>
  );
};
