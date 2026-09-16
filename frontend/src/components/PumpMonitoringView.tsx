import React, { useState } from 'react';
import {
  Gauge,
  Zap,
  Flame,
  Activity,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Power,
  Sliders,
  BarChart3
} from 'lucide-react';
import { PumpData } from '../types';

interface PumpMonitoringViewProps {
  pumps: PumpData[];
}

export const PumpMonitoringView: React.FC<PumpMonitoringViewProps> = ({ pumps }) => {
  const [selectedPumpId, setSelectedPumpId] = useState<number>(1);
  const selectedPump = pumps.find((p) => p.id === selectedPumpId) || pumps[0];

  const totalPower = pumps.reduce((sum, p) => sum + p.powerKw, 0);
  const runningCount = pumps.filter((p) => p.status === 'Running candidate').length;

  return (
    <div id="pump-monitoring-view" className="space-y-6 pb-12">
      {/* Top Station Aggregates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-1">
            <span>Tổng tổ bơm vận hành</span>
            <Gauge className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {runningCount} / {pumps.length}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-400">tổ máy online</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-400 font-mono">
            Bơm 1, 2, 3 tải chính; Bơm 4 dự phòng
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-1">
            <span>Tổng công suất tiêu thụ</span>
            <Zap className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">
              {totalPower.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-400">kW</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-400 font-mono">
            Hiệu suất trung bình: 91.8%
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-1">
            <span>Lưu lượng trạm bơm (Qnt)</span>
            <Activity className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-800 dark:text-cyan-300">
              801.956
            </span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-400">m³/h</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700 dark:text-slate-400 font-mono">
            Áp lực ống góp: 4.2 bar
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-400 mb-1">
            <span>Nhiệt độ cuộn dây max</span>
            <Flame className="w-4 h-4 text-rose-700 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              36.475
            </span>
            <span className="text-xs font-mono text-slate-700 dark:text-slate-400">°C (Tổ 3)</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
            An toàn (&lt; 75°C ngưỡng ngắt)
          </div>
        </div>
      </div>

      {/* 5 Pumps Interactive Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 font-mono flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            Chi tiết các tổ máy bơm trạm cấp 1
          </h3>
          <span className="text-xs text-slate-700 dark:text-slate-400">Click chọn tổ bơm để xem chuẩn đoán</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {pumps.map((pump) => {
            const isSelected = pump.id === selectedPumpId;
            const isRunning = pump.status === 'Running candidate';

            return (
              <div
                key={pump.id}
                onClick={() => setSelectedPumpId(pump.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-cyan-500 ring-1 ring-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-white font-mono">
                    BƠM #{pump.id}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
                    <span>Tần số (Hz):</span>
                    <span className="text-cyan-800 dark:text-cyan-300 font-semibold">{pump.tsHz.toFixed(3)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
                    <span>Dòng điện (A):</span>
                    <span className="text-slate-800 dark:text-slate-200">{pump.currentA.toFixed(3)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
                    <span>Nhiệt độ:</span>
                    <span className="text-amber-800 dark:text-amber-300">{pump.tempC.toFixed(3)} °C</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-400">
                    <span>Công suất:</span>
                    <span className="text-white font-semibold">{pump.powerKw.toFixed(3)} kW</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80">
                  <span
                    className={`block text-center py-1 rounded text-[11px] font-semibold ${
                      isRunning
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {pump.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Pump Diagnostic Box */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
              Chẩn đoán chuyên sâu: {selectedPump.name}
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Thời gian chạy tích lũy: {selectedPump.runningHours || 3200} giờ | Độ rung ổ trục: {selectedPump.vibrationMmS || 1.4} mm/s
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              Biến tần VFD: ABB ACS880
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-800/50 font-mono">
              Hiệu suất: {selectedPump.efficiencyPercent || 92}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Tải trọng biến tần (Load ratio)</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-2.5 rounded-full transition-all"
                style={{ width: `${(selectedPump.tsHz / 50) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-700 dark:text-slate-400 pt-1">
              <span>0 Hz</span>
              <span className="text-cyan-800 dark:text-cyan-300 font-semibold">{((selectedPump.tsHz / 50) * 100).toFixed(1)}% (50Hz max)</span>
              <span>50 Hz</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Mức nhiệt độ động cơ</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-400 h-2.5 rounded-full transition-all"
                style={{ width: `${(selectedPump.tempC / 80) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-700 dark:text-slate-400 pt-1">
              <span>20°C</span>
              <span className="text-amber-800 dark:text-amber-300 font-semibold">{selectedPump.tempC.toFixed(1)}°C (Ngưỡng 75°C)</span>
              <span>80°C</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs text-slate-700 dark:text-slate-400 font-medium">Độ rung cơ khí (Vibration)</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-2.5 rounded-full transition-all"
                style={{ width: `${((selectedPump.vibrationMmS || 1.4) / 4.5) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-slate-700 dark:text-slate-400 pt-1">
              <span>0 mm/s</span>
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">{selectedPump.vibrationMmS || 1.4} mm/s (ISO 10816 Zone A)</span>
              <span>4.5 mm/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
