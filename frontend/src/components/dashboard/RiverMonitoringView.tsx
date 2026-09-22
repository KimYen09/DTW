import { useState } from 'react';
import { Waves, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { riverMonitoringTimeSeries } from '../../data/mockScadaData';
import { RiverDualAxisChart } from '../charts/RiverDualAxisChart';

export function RiverMonitoringView() {
  const [anomalyStatus, setAnomalyStatus] = useState<'reviewing' | 'acknowledged'>('reviewing');

  const anomalyCandidates = [
    {
      id: 'ec-ano-1',
      timestamp: '2025-02-03T14:00:00+07:00',
      ecValue: 980.0,
      expected: '200 - 350 µS/cm',
      zScore: -8.45,
      type: 'Xung triều cường / Nhiễu cảm biến',
      severity: 'CRITICAL'
    },
    {
      id: 'ec-ano-2',
      timestamp: '2025-02-03T15:00:00+07:00',
      ecValue: 840.5,
      expected: '200 - 350 µS/cm',
      zScore: -6.12,
      type: 'Triều rút chậm',
      severity: 'WARNING'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Important Advisory Callout Banner */}
      <div className="flex items-start gap-3.5 rounded-xl border border-amber-300/60 bg-amber-50/80 p-4 text-xs dark:border-amber-500/30 dark:bg-amber-950/20">
        <div className="rounded-lg bg-amber-500/20 p-2 text-amber-600 dark:text-amber-400 shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 dark:text-amber-200">
            Lưu ý kỹ thuật quan trắc EC Sông Tiền:
          </h4>
          <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>EC (Electrical Conductivity)</strong> đo lường bằng đơn vị <strong>µS/cm</strong>, biểu thị khả năng dẫn điện của các ion khoáng trong nước. 
            Đỉnh nhọn ngày <strong>03/02/2025 (xung đột biến 980 µS/cm)</strong> tương ứng với hiện tượng triều cường đẩy mặn xâm nhập sâu từ cửa biển hoặc có thể do xung nhiễu bám bẩn điện cực đo. Đã kích hoạt kịch bản đóng van lấy nước tự động sang hồ chứa dự phòng.
          </p>
        </div>
      </div>

      {/* Main Dual-Axis Chart Panel */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sông Tiền: Mực Nước Triều (m) & Độ Dẫn Điện EC (µS/cm)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biểu đồ trục kép theo dõi tương quan thủy văn và xung mặn theo chu kỳ nhật triều
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
              Trạm Cửa Nhận Nước Thô #1
            </span>
          </div>
        </div>

        <RiverDualAxisChart data={riverMonitoringTimeSeries} height={300} />
      </div>

      {/* Anomaly Candidates Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Danh sách Ứng viên Bất thường EC (EC Anomaly Candidates)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Phát hiện bởi Robust Z-score & Cửa sổ trượt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                <th className="pb-3 pr-4">Thời gian (Timestamp)</th>
                <th className="pb-3 px-4">Giá trị đo EC</th>
                <th className="pb-3 px-4">Khoảng kỳ vọng</th>
                <th className="pb-3 px-4">Điểm Z-score</th>
                <th className="pb-3 px-4">Nhận định sự cố</th>
                <th className="pb-3 pl-4 text-right">Trạng thái xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {anomalyCandidates.map((ano) => (
                <tr key={ano.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-sans text-slate-800 dark:text-slate-200">
                    {ano.timestamp}
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400">
                    {ano.ecValue.toFixed(1)} µS/cm
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {ano.expected}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                    {ano.zScore.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-700 dark:text-slate-300">
                    {ano.type}
                  </td>
                  <td className="py-3 pl-4 text-right font-sans">
                    {anomalyStatus === 'acknowledged' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Đã xác nhận
                      </span>
                    ) : (
                      <button
                        onClick={() => setAnomalyStatus('acknowledged')}
                        className="rounded-lg bg-cyan-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors"
                      >
                        Tiếp nhận xử lý
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
