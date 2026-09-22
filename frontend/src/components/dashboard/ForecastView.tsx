import { useState } from 'react';
import { TrendingUp, CheckCircle, Award, Sparkles } from 'lucide-react';
import { forecastMetricsData } from '../../data/mockScadaData';
import { InteractiveTimeSeriesChart } from '../charts/InteractiveTimeSeriesChart';

export function ForecastView() {
  const [selectedModel, setSelectedModel] = useState<string>('moving_average_6');

  // Simulated forecast data points for the next 6 hours
  const forecastPreview = [
    { day: 'Hiện tại (0h)', val: 7.07 },
    { day: '+1h (Dự báo)', val: 7.09 },
    { day: '+2h (Dự báo)', val: 7.12 },
    { day: '+3h (Dự báo)', val: 7.15 },
    { day: '+4h (Dự báo)', val: 7.18 },
    { day: '+5h (Dự báo)', val: 7.16 },
    { day: '+6h (Dự báo)', val: 7.14 }
  ];

  return (
    <div className="space-y-6">
      {/* Model Recommendation Banner */}
      <div className="flex items-start gap-3.5 rounded-xl border border-teal-300/60 bg-teal-50/80 p-4 text-xs dark:border-teal-500/30 dark:bg-teal-950/20">
        <div className="rounded-lg bg-teal-500/20 p-2 text-teal-600 dark:text-teal-400 shrink-0">
          <Award className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-teal-900 dark:text-teal-200">
            Khuyến nghị mô hình vận hành SCADA DTW:
          </h4>
          <p className="text-teal-800 dark:text-teal-300 leading-relaxed">
            Mô hình <strong>moving_average_6</strong> đạt độ ổn định và độ tin cậy cao nhất cho kíp trực ca với 
            <strong> R² &gt; 0.90</strong> và sai số tương đối <strong>MAPE chỉ 1.74%</strong> ở bước dự báo +1h, 
            duy trì <strong>R² = 0.885</strong> ở bước +6h. Độ lệch thấp hơn đáng kể so với Random Forest và Persistence.
          </p>
        </div>
      </div>

      {/* Forecast Evaluation Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bảng Đánh Giá Sai Số Mô Hình Chuỗi Thời Gian (Forecast Benchmarks)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kiểm thử trên tập dữ liệu kiểm nghiệm 90 ngày của trạm quan trắc DTW
            </p>
          </div>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            Tần suất dự báo: 1 giờ / lần
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                <th className="pb-3 pr-4">Bước dự báo (Horizon)</th>
                <th className="pb-3 px-4">Mô hình (Model)</th>
                <th className="pb-3 px-4">MAE</th>
                <th className="pb-3 px-4">RMSE</th>
                <th className="pb-3 px-4">MAPE (%)</th>
                <th className="pb-3 px-4">R² Score</th>
                <th className="pb-3 pl-4 text-right">Chọn áp dụng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {forecastMetricsData.map((m, idx) => {
                const isMa = m.model === 'moving_average_6';
                const isSelected = selectedModel === m.model;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${
                      isMa ? 'bg-cyan-50/30 dark:bg-cyan-950/15' : ''
                    }`}
                  >
                    <td className="py-2.5 pr-4 font-bold text-slate-800 dark:text-slate-200">
                      {m.horizon}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        {isMa && <Sparkles className="h-3 w-3 text-cyan-500" />}
                        <span>{m.model}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {m.mae.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                      {m.rmse.toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-cyan-600 dark:text-cyan-400">
                      {m.mape.toFixed(4)}%
                    </td>
                    <td className="py-2.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {m.r2.toFixed(4)}
                    </td>
                    <td className="py-2.5 pl-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedModel(m.model)}
                        className={`rounded px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isSelected ? '✓ Đang chọn' : 'Chọn'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Forecast Horizon Curve */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Mô phỏng quỹ đạo dự báo pH (+1h đến +6h tới)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dựa trên mô hình đã chọn: <strong>{selectedModel}</strong>
          </p>
        </div>

        <InteractiveTimeSeriesChart
          data={forecastPreview}
          metricLabel={`pH_forecast_${selectedModel}`}
          unit="pH"
          minThreshold={6.5}
          maxThreshold={8.5}
          lineColor="#8b5cf6"
          fillGradient={{ start: 'rgba(139, 92, 246, 0.25)', end: 'rgba(139, 92, 246, 0.0)' }}
          height={220}
        />
      </div>
    </div>
  );
}
