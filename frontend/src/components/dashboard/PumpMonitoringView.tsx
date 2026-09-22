import { useState } from 'react';
import { Gauge, Zap, Thermometer, Activity, Power, CheckCircle, Sliders, AlertCircle } from 'lucide-react';
import { PumpData } from '../../types';

interface PumpMonitoringViewProps {
  pumps: PumpData[];
  onTogglePump?: (id: number) => void;
}

export function PumpMonitoringView({ pumps }: PumpMonitoringViewProps) {
  const [selectedPumpId, setSelectedPumpId] = useState<number>(1);
  const selectedPump = pumps.find((p) => p.id === selectedPumpId) || pumps[0];

  const totalRunning = pumps.filter((p) => p.status === 'running').length;
  const totalPower = pumps.reduce((acc, p) => acc + p.power, 0);
  const maxTemp = Math.max(...pumps.map((p) => p.temp));

  return (
    <div className="space-y-6">
      {/* 4 Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tổng tổ bơm vận hành</span>
            <Power className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalRunning} / {pumps.length}
            </span>
            <span className="text-xs text-slate-400">tổ máy</span>
          </div>
          <span className="text-[11px] text-slate-500">1 tổ máy dự phòng luân phiên</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tổng công suất tiêu thụ</span>
            <Zap className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {totalPower.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">kW</span>
          </div>
          <span className="text-[11px] text-slate-500">Tiêu chuẩn định mức trạm</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Lưu lượng trạm bơm</span>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              801.956
            </span>
            <span className="text-xs text-slate-400">m³/h</span>
          </div>
          <span className="text-[11px] text-slate-500">Cung cấp tuyến ống áp lực</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Nhiệt độ cuộn dây tối đa</span>
            <Thermometer className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">
              {maxTemp.toFixed(3)}
            </span>
            <span className="text-xs text-slate-400">°C</span>
          </div>
          <span className="text-[11px] text-slate-500">Ngưỡng giới hạn nhiệt F: &lt; 75°C</span>
        </div>
      </div>

      {/* 5 Pump Station Cards Grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Danh sách 5 Tổ Máy Bơm Cấp 1 (Nhấp để chọn chẩn đoán chuyên sâu)
          </h3>
          <span className="text-xs text-slate-400">Biến tần điều khiển VFD tự động</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {pumps.map((pump) => {
            const isSelected = pump.id === selectedPumpId;
            const isRunning = pump.status === 'running';

            return (
              <div
                key={pump.id}
                onClick={() => setSelectedPumpId(pump.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/20 dark:bg-cyan-950/20'
                    : 'border-slate-200/80 bg-white/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80'
                } shadow-sm backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {pump.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isRunning
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {isRunning ? 'Chạy' : 'Dừng'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tần số:</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-mono">
                      {pump.frequency.toFixed(1)} Hz
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dòng điện:</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-mono">
                      {pump.current.toFixed(1)} A
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nhiệt độ:</span>
                    <strong className="text-amber-600 dark:text-amber-400 font-mono">
                      {pump.temp > 0 ? `${pump.temp.toFixed(1)} °C` : '—'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Công suất:</span>
                    <strong className="text-slate-700 dark:text-slate-300 font-mono">
                      {pump.power.toFixed(1)} kW
                    </strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
                  <span className={`text-[11px] font-semibold ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                    {isSelected ? '● Đang xem chẩn đoán' : 'Xem thông số chi tiết'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Pump Deep-Dive Diagnosis Panel */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Chẩn đoán Chuyên sâu: {selectedPump.name} (Biến tần VFD {selectedPump.vfdBrand})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phân tích cơ điện tử, hiệu suất thủy lực và độ rung cơ học theo chuẩn ISO 10816-3
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
              Trạng thái: Vận hành Tự động (Auto Mode)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3.5 dark:bg-slate-800/50">
            <span className="text-xs text-slate-400">Hiệu suất năng lượng (Efficiency)</span>
            <div className="mt-1 text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {selectedPump.efficiency > 0 ? `${selectedPump.efficiency}%` : '0% (Nghỉ)'}
            </div>
            <span className="text-[11px] text-slate-500">Tối ưu tổn hao điện năng</span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 dark:bg-slate-800/50">
            <span className="text-xs text-slate-400">Độ rung trục (Vibration)</span>
            <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {selectedPump.vibration} mm/s
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Đạt chuẩn ISO (&lt; 2.8 mm/s)
            </span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 dark:bg-slate-800/50">
            <span className="text-xs text-slate-400">Thời gian chạy tích lũy</span>
            <div className="mt-1 text-2xl font-black text-slate-700 dark:text-slate-300">
              {selectedPump.runningHours} h
            </div>
            <span className="text-[11px] text-slate-500">Chu kỳ bảo dưỡng: 5000h</span>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 dark:bg-slate-800/50">
            <span className="text-xs text-slate-400">Hệ thống bảo vệ quá tải</span>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span>Rơ le nhiệt & Áp suất OK</span>
            </div>
            <span className="text-[11px] text-slate-500">Tự động ngắt khi kẹt cánh</span>
          </div>
        </div>
      </div>
    </div>
  );
}
