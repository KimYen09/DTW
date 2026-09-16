import React from 'react';
import {
  Zap,
  Droplets,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Waves,
  BarChart3,
  Flame,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { SystemKPIs, PumpData, NavPage } from '../types';

interface OverviewViewProps {
  kpis: SystemKPIs;
  pumps: PumpData[];
  onNavigate: (page: NavPage) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  kpis,
  pumps,
  onNavigate
}) => {
  return (
    <div id="overview-view" className="space-y-6 pb-12">
      {/* KPI Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            Thông số đo lường chính (Key Telemetry Metrics)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Đơn vị chuẩn SCADA</span>
        </div>

        {/* 6 primary metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* EC */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-cyan-500/40 transition-all shadow-sm group">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current EC</span>
              <span className="p-1 rounded bg-cyan-950/60 text-cyan-700 dark:text-cyan-400">
                <Activity className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-cyan-800 dark:text-cyan-300 transition-colors">
                {kpis.currentEc.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400/80">µS/cm</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span>Độ dẫn điện</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Bình thường</span>
            </div>
          </div>

          {/* pH */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-blue-500/40 transition-all shadow-sm group">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current pH (bể chứa)</span>
              <span className="p-1 rounded bg-blue-950/60 text-blue-400">
                <Droplets className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-blue-300 transition-colors">
                {kpis.currentPh.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-400">pH</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span>Chuẩn QCVN: 6.5 - 8.5</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Đạt chuẩn</span>
            </div>
          </div>

          {/* Turbidity */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-amber-500/40 transition-all shadow-sm group">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current Turbidity (bể chứa)</span>
              <span className="p-1 rounded bg-amber-950/60 text-amber-700 dark:text-amber-400">
                <Waves className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-amber-800 dark:text-amber-300 transition-colors">
                {kpis.currentTurbidity.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-amber-700 dark:text-amber-400/80">NTU</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span>Độ đục sau lọc</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">&lt; 2.0 NTU</span>
            </div>
          </div>

          {/* Cl2 */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-teal-500/40 transition-all shadow-sm group">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current Cl2 (bể chứa)</span>
              <span className="p-1 rounded bg-teal-950/60 text-teal-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-teal-300 transition-colors">
                {kpis.currentCl2.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-teal-400/80">mg/L</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span>Clo dư khử trùng</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Tối ưu</span>
            </div>
          </div>

          {/* River Level */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-indigo-500/40 transition-all shadow-sm group">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current River Level</span>
              <span className="p-1 rounded bg-indigo-950/60 text-indigo-400">
                <Waves className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                {kpis.currentRiverLevel.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-indigo-400/80">m</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span>Mực nước sông Tiền</span>
              <span className="text-slate-700 dark:text-slate-300">Triều cường tb</span>
            </div>
          </div>

          {/* Qnt */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 hover:border-sky-500/40 transition-all shadow-sm group">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-2">
              <span className="font-medium text-slate-700 dark:text-slate-300">Qnt (Lưu lượng cấp)</span>
              <span className="p-1 rounded bg-sky-950/60 text-sky-400">
                <BarChart3 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-white group-hover:text-sky-300 transition-colors">
                {kpis.qnt.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-sky-400/80">m³/h</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-2">
              <span>Công suất hiện thời</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">85% CS thiết kế</span>
            </div>
          </div>
        </div>

        {/* 3 Secondary health status blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-3.5">
          {/* Active alerts */}
          <div
            onClick={() => onNavigate('alert_log')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Active alerts</div>
              <div className="text-3xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1">{kpis.activeAlerts}</div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400/80 mt-1">Yêu cầu rà soát và ghi nhận nhật ký</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Current risk */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Current risk</div>
              <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                {kpis.currentRisk}
              </div>
              <div className="text-[11px] text-slate-700 dark:text-slate-400 mt-1">Ảnh hưởng bởi dị biệt EC cảm biến Sông Tiền</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          {/* Sensor health */}
          <div
            onClick={() => onNavigate('anomaly_detection')}
            className="p-4 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center justify-between"
          >
            <div>
              <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Sensor health</div>
              <div className="text-2xl font-bold font-mono text-cyan-800 dark:text-cyan-300 mt-1 flex items-center gap-2">
                {kpis.sensorHealth}
              </div>
              <div className="text-[11px] text-cyan-700 dark:text-cyan-400/80 mt-1">Phát hiện mất đồng bộ / ngoại lai z-score</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Pump Status Table — latest timestamp (Exact recreation from Image 1) */}
      <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              Pump status — latest timestamp
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Trạng thái vận hành tức thời 5 tổ bơm cấp 1 và trạm nước thô
            </p>
          </div>
          <button
            onClick={() => onNavigate('pump_monitoring')}
            className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            Xem phân tích trạm bơm chi tiết
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-400 font-mono">
                <th className="py-3 px-4 font-semibold">Pump</th>
                <th className="py-3 px-4 font-semibold">TS (Hz)</th>
                <th className="py-3 px-4 font-semibold">Current (A)</th>
                <th className="py-3 px-4 font-semibold">Temperature (°C)</th>
                <th className="py-3 px-4 font-semibold">Power (kW)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-800 dark:text-slate-200">
              {pumps.map((pump) => {
                const isRunning = pump.status === 'Running candidate';
                const isStopped = pump.status === 'Stopped/unknown';

                return (
                  <tr
                    key={pump.id}
                    className="hover:bg-slate-100 dark:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <span>Tổ bơm #{pump.id}</span>
                    </td>
                    <td className="py-3 px-4 text-cyan-800 dark:text-cyan-300 font-semibold">
                      {pump.tsHz.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {pump.currentA.toFixed(3)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                        <Flame className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400/80" />
                        {pump.tempC.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {pump.powerKw.toFixed(3)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                          isRunning
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                        {pump.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('water_quality')}
          className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400">
              <Droplets className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-700 dark:text-cyan-400 transition-colors" />
          </div>
          <h4 className="text-sm font-semibold text-white group-hover:text-cyan-800 dark:text-cyan-300">Phân tích Chất lượng Nước</h4>
          <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
            Biểu đồ xu hướng pH, độ đục, độ dẫn và clo dư theo chuỗi thời gian Q1/2025.
          </p>
        </div>

        <div
          onClick={() => onNavigate('river_monitoring')}
          className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Waves className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <h4 className="text-sm font-semibold text-white group-hover:text-blue-300">Giám sát Sông Tiền & Bất thường</h4>
          <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
            Quan trắc tương quan mực nước và xung đột biến EC đạt 980 µS/cm.
          </p>
        </div>

        <div
          onClick={() => onNavigate('forecast')}
          className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
          <h4 className="text-sm font-semibold text-white group-hover:text-teal-300">Mô hình Dự báo Vận hành</h4>
          <p className="text-xs text-slate-700 dark:text-slate-400 mt-1">
            So sánh MAE, RMSE của Moving Average 6, Random Forest và Persistence.
          </p>
        </div>
      </div>
    </div>
  );
};
