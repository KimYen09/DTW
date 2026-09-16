import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  BarChart,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { forecastMetricsList, generateForecastTimeSeries } from '../data/mockData';

export const ForecastView: React.FC = () => {
  const [selectedHorizon, setSelectedHorizon] = useState<number>(1);
  const [selectedModel, setSelectedModel] = useState<string>('moving_average_6');

  const forecastData = useMemo(() => {
    return generateForecastTimeSeries(selectedHorizon, selectedModel);
  }, [selectedHorizon, selectedModel]);

  // Current metric for selected horizon and model
  const activeMetric = forecastMetricsList.find(
    (m) => m.horizon_hours === selectedHorizon && m.model === selectedModel
  ) || forecastMetricsList[1];

  return (
    <div id="forecast-view" className="space-y-6 pb-12">
      {/* Test Metrics by Horizon Table (Exactly like Screenshots 6 & 7) */}
      <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              Test metrics by horizon
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Đánh giá hiệu năng kiểm thử các thuật toán dự báo chuỗi thời gian (Q1/2025 Test set)
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mô hình khuyến nghị: moving_average_6 (R² &gt; 0.90)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-400 font-mono">
                <th className="py-2.5 px-4 font-semibold">horizon_hours</th>
                <th className="py-2.5 px-4 font-semibold">model</th>
                <th className="py-2.5 px-4 font-semibold">mae</th>
                <th className="py-2.5 px-4 font-semibold">rmse</th>
                <th className="py-2.5 px-4 font-semibold">mape_percent</th>
                <th className="py-2.5 px-4 font-semibold">r2</th>
                <th className="py-2.5 px-4 font-semibold text-center">selected_for_operational_forecast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
              {forecastMetricsList.map((m, idx) => {
                const isCurrent = m.horizon_hours === selectedHorizon && m.model === selectedModel;
                return (
                  <tr
                    key={idx}
                    onClick={() => {
                      setSelectedHorizon(m.horizon_hours);
                      setSelectedModel(m.model);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/40 text-cyan-200'
                        : 'hover:bg-slate-100 dark:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-white">
                      +{m.horizon_hours}h
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-cyan-700 dark:text-cyan-400">
                      {m.model}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{m.mae.toFixed(4)}</td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">{m.rmse.toFixed(4)}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-semibold text-amber-800 dark:text-amber-300">
                        {m.mape_percent.toFixed(4)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-semibold ${
                          m.r2 >= 0.9 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m.r2.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={m.selected_for_operational_forecast}
                        readOnly
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-cyan-500 focus:ring-0 cursor-default"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model & Horizon Selector Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-400 font-mono uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
          Cấu hình biểu đồ trực quan hóa dự báo
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Horizon select */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Bước dự báo trước (Horizon)
            </label>
            <select
              value={selectedHorizon}
              onChange={(e) => setSelectedHorizon(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>1 giờ tới (+1h)</option>
              <option value={2}>2 giờ tới (+2h)</option>
              <option value={3}>3 giờ tới (+3h)</option>
              <option value={4}>4 giờ tới (+4h)</option>
            </select>
          </div>

          {/* Model select */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Mô hình thuật toán
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="moving_average_6">moving_average_6 (Baseline MA-6)</option>
              <option value="random_forest">random_forest (Cây quyết định ngẫu nhiên)</option>
              <option value="persistence">persistence (Mô hình lưu giữ điểm trước)</option>
            </select>
          </div>

          {/* Active Model R2 stat card */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-700 dark:text-slate-400">Độ khớp R²:</span>
              <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                {activeMetric?.r2.toFixed(4) || '0.9067'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-700 dark:text-slate-400">Sai số MAPE:</span>
              <div className="text-base font-bold font-mono text-amber-800 dark:text-amber-300 mt-0.5">
                {activeMetric?.mape_percent.toFixed(2) || '1.74'}%
              </div>
            </div>
          </div>

          {/* Active Model MAE stat card */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-700 dark:text-slate-400">Sai số MAE:</span>
              <div className="text-base font-bold font-mono text-cyan-800 dark:text-cyan-300 mt-0.5">
                {activeMetric?.mae.toFixed(4) || '4.4284'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-700 dark:text-slate-400">RMSE:</span>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {activeMetric?.rmse.toFixed(4) || '5.5229'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Line Chart with Confidence Ribbon */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              So sánh Giá trị thực tế (Actual) vs Dự báo (Forecast {selectedModel} +{selectedHorizon}h)
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Quan sát độ lệch thời gian thực và dải tin cậy mô phỏng
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              Giá trị thực tế (Actual)
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-3 h-0.5 bg-purple-400 inline-block" />
              Dự báo (Predicted)
            </span>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={10}
              />
              <YAxis
                domain={[220, 280]}
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
                formatter={(val: any, name: any) => [
                  `${Number(val).toFixed(2)} µS/cm`,
                  name === 'actual' ? 'Thực tế' : name === 'prediction' ? 'Dự báo' : name
                ]}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Area
                type="monotone"
                dataKey="upperBound"
                fill="#38bdf8"
                stroke="none"
                fillOpacity={0.08}
                name="Dải tin cậy trên"
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="actual"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="prediction"
                name="prediction"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Note required by screenshot 7 */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400 shrink-0" />
            <strong>Lưu ý:</strong> Point forecast only. Confidence interval chưa được hiệu chỉnh trên dữ liệu thật.
          </span>
          <span className="font-mono text-slate-500">RMSE: {activeMetric?.rmse.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
};
