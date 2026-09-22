import { 
  Zap, 
  Droplet, 
  Waves, 
  Activity, 
  AlertTriangle, 
  Cpu, 
  ArrowUpRight,
  CheckCircle,
  Clock,
  Gauge
} from 'lucide-react';
import { TelemetryMetric, PumpData, ViewMode } from '../../types';

interface OverviewViewProps {
  metrics: TelemetryMetric[];
  pumps: PumpData[];
  onNavigate: (view: ViewMode) => void;
}

export function OverviewView({ metrics, pumps, onNavigate }: OverviewViewProps) {
  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'ec': return Zap;
      case 'ph': return Droplet;
      case 'turbidity': return Waves;
      case 'chlorine': return CheckCircle;
      case 'river_level': return Waves;
      case 'flow_rate': return Gauge;
      default: return Activity;
    }
  };

  const getStatusBadge = (status: string, note?: string) => {
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          {note || 'Cảnh báo'}
        </span>
      );
    }
    if (status === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          {note || 'Nguy hiểm'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        {note || 'Bình thường'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Metric Cards Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Activity className="h-4 w-4 text-cyan-500" />
            <span>Thông số đo lường chính (Key Telemetry Metrics)</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">Đơn vị chuẩn SCADA</span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metrics.map((m) => {
            const Icon = getMetricIcon(m.id);
            const isWarning = m.status === 'warning';

            return (
              <div
                key={m.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                  isWarning
                    ? 'border-amber-400/40 bg-amber-500/5 dark:bg-amber-950/20'
                    : 'border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80'
                } shadow-sm backdrop-blur-sm hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium truncate">{m.nameEn}</span>
                    <div className="rounded-lg bg-slate-100 p-1.5 text-cyan-600 dark:bg-slate-800 dark:text-cyan-400">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {m.name}
                  </div>

                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black tracking-tight ${
                      isWarning ? 'text-amber-500' : 'text-cyan-600 dark:text-cyan-400'
                    }`}>
                      {m.value.toFixed(3)}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {m.unit}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                    {m.subText}
                  </span>
                  {getStatusBadge(m.status, m.note)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Secondary Status Cards: Alerts, Risk, Sensor Health */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Active Alerts */}
        <div 
          onClick={() => onNavigate('alert_log')}
          className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-amber-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Cảnh báo đang mở (Active Alerts)
            </span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500 dark:bg-amber-950/40">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-500">5</span>
            <span className="text-xs font-medium text-slate-400">sự cố cần rà soát</span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Yêu cầu rà soát và ghi nhận nhật ký vận hành trạm cấp
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            <span>Mở nhật ký cảnh báo</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        {/* Current Risk Level */}
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/5 p-5 shadow-sm backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mức rủi ro hiện tại (Current Risk)
            </span>
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-2xl font-black tracking-tight text-amber-500">
              WARNING
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            Ảnh hưởng bởi dị biệt EC cảm biến Sông Tiền (xung triều cường)
          </p>
          <div className="mt-3 text-[11px] text-slate-400">
            Khuyến nghị: Theo dõi liên tục van lấy nước thô
          </div>
        </div>

        {/* Sensor Health */}
        <div 
          onClick={() => onNavigate('anomaly_detection')}
          className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-cyan-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tình trạng cảm biến (Sensor Health)
            </span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-500 dark:bg-cyan-950/40">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black tracking-tight text-cyan-600 dark:text-cyan-400">
              Review needed
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Phát hiện mất đồng bộ / ngoại lai z-score tại trạm thô
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
            <span>Chi tiết thuật toán AI Isolation Forest</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>

      {/* Pump Station Status Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Trạng thái trạm bơm (Pump Status)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trạng thái vận hành tức thời 5 tổ bơm cấp 1 và trạm nước thô
            </p>
          </div>
          <button
            onClick={() => onNavigate('pump_monitoring')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
          >
            <span>Xem phân tích trạm bơm chi tiết</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                <th className="pb-3 pr-4">Bơm (Pump)</th>
                <th className="pb-3 px-4">Tần số (TS - Hz)</th>
                <th className="pb-3 px-4">Dòng điện (Current - A)</th>
                <th className="pb-3 px-4">Nhiệt độ (Temp - °C)</th>
                <th className="pb-3 px-4">Công suất (Power - kW)</th>
                <th className="pb-3 pl-4 text-right">Trạng thái (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {pumps.map((pump) => {
                const isRunning = pump.status === 'running';
                return (
                  <tr key={pump.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pr-4 font-sans font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{pump.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-cyan-600 dark:text-cyan-400 font-semibold">
                      {pump.frequency.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {pump.current.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-amber-600 dark:text-amber-400">
                      {pump.temp > 0 ? `⚡ ${pump.temp.toFixed(3)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {pump.power.toFixed(3)}
                    </td>
                    <td className="py-3 pl-4 text-right font-sans">
                      {isRunning ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Running candidate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-500/20">
                          Stopped / unknown
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
