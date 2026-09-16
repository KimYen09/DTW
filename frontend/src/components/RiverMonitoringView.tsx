import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import {
  Waves,
  Activity,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  TrendingUp,
  Search
} from 'lucide-react';
import { generateRiverData, ecHourlyForecast, anomalyCandidatesList } from '../data/mockData';

export const RiverMonitoringView: React.FC = () => {
  const riverData = useMemo(() => generateRiverData(), []);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Filter river anomalies
  const riverAnomalies = useMemo(() => {
    return anomalyCandidatesList.filter((item) => {
      if (item.location !== 'tien_river') return false;
      if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false;
      return true;
    });
  }, [filterSeverity]);

  return (
    <div id="river-monitoring-view" className="space-y-6 pb-12">
      {/* Sông Tiền Level và EC Chart Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              Sông Tiền Level và EC
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Tương quan độ dẫn điện (µS/cm) và biến thiên mực nước triều (m)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 font-mono">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              river_ec_us_cm (Độ dẫn điện)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-mono">
              <span className="w-3 h-0.5 bg-blue-500 inline-block" />
              river_level_m (Cao trình mực nước)
            </span>
          </div>
        </div>

        {/* Chart with Dual Axes */}
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={riverData}
              margin={{ top: 15, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickMargin={10}
              />
              {/* Left Y Axis for EC (0 - 1000 µS/cm) */}
              <YAxis
                yAxisId="left"
                domain={[0, 1000]}
                stroke="#06b6d4"
                tick={{ fontSize: 11, fill: '#06b6d4' }}
                tickFormatter={(v) => `${v}`}
              />
              {/* Right Y Axis for Level (0 - 4 m) */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 4]}
                stroke="#3b82f6"
                tick={{ fontSize: 11, fill: '#3b82f6' }}
                tickFormatter={(v) => `${v}m`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'river_ec_us_cm') {
                    return [`${value} µS/cm`, 'Độ dẫn điện (EC)'];
                  }
                  return [`${value} m`, 'Mực nước Sông Tiền'];
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="river_ec_us_cm"
                name="river_ec_us_cm"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={(props: any) => {
                  if (props.payload.isAnomaly) {
                    return (
                      <circle
                        cx={props.cx}
                        cy={props.cy}
                        r={6}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={2}
                        key={props.key}
                      />
                    );
                  }
                  return <React.Fragment key={props.key} />;
                }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="river_level_m"
                name="river_level_m"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Clarifying Note required by screenshot */}
        <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <Info className="w-4 h-4 text-cyan-700 dark:text-cyan-400 shrink-0" />
            <strong>Lưu ý:</strong> EC là Electrical Conductivity (µS/cm), không phải độ mặn.
          </span>
          <span className="text-[11px] text-slate-700 dark:text-slate-400 font-mono hidden sm:inline">
            Đỉnh nhọn tháng 2: xung đột biến 980 µS/cm
          </span>
        </div>
      </div>

      {/* EC Anomaly Candidates Section */}
      <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              EC anomaly candidates
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Danh sách các mẫu dữ liệu EC bất thường cần kiểm tra xác minh
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-700 dark:text-slate-400">Mức độ:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tất cả ({anomalyCandidatesList.filter(i => i.location === 'tien_river').length})</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-400 font-mono">
                <th className="py-2.5 px-4 font-semibold">timestamp</th>
                <th className="py-2.5 px-4 font-semibold">value</th>
                <th className="py-2.5 px-4 font-semibold">detection_method</th>
                <th className="py-2.5 px-4 font-semibold">anomaly_type</th>
                <th className="py-2.5 px-4 font-semibold">severity</th>
                <th className="py-2.5 px-4 font-semibold">explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
              {riverAnomalies.map((item) => (
                <tr key={item.id} className="hover:bg-slate-100 dark:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                    {item.value !== null && item.value !== undefined ? (
                      <span className={item.severity === 'critical' ? 'text-rose-700 dark:text-rose-400' : 'text-amber-800 dark:text-amber-300'}>
                        {typeof item.value === 'number' ? item.value.toFixed(3) : item.value}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">None</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-cyan-700 dark:text-cyan-400 whitespace-nowrap">
                    {item.detection_method}
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px]">
                      {item.anomaly_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        item.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-sans text-xs text-slate-700 dark:text-slate-300 min-w-[280px]">
                    {item.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EC Forecast +1h đến +6h Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              EC forecast +1h đến +6h
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Dự báo xu hướng độ dẫn điện Sông Tiền trong 6 giờ tới để cảnh báo xâm nhập mặn/tạp chất
            </p>
          </div>
          <span className="text-xs text-cyan-700 dark:text-cyan-400 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Cập nhật theo chu kỳ triều
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {ecHourlyForecast.map((item, idx) => {
            const isNow = idx === 0;
            return (
              <div
                key={item.hour}
                className={`p-3 rounded-lg border text-center transition-all ${
                  isNow
                    ? 'bg-cyan-950/40 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-700 dark:text-slate-400">{item.hour}</div>
                <div
                  className={`text-lg font-bold font-mono my-1 ${
                    isNow ? 'text-cyan-800 dark:text-cyan-300' : 'text-white'
                  }`}
                >
                  {item.forecast.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Range: {item.lower.toFixed(1)} - {item.upper.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
