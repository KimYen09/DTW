import { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, Filter, Cpu, ArrowUpDown } from 'lucide-react';
import { AnomalyRecord } from '../../types';

interface AnomalyDetectionViewProps {
  anomalies: AnomalyRecord[];
}

export function AnomalyDetectionView({ anomalies }: AnomalyDetectionViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const filtered = anomalies.filter((item) => {
    const matchesSearch =
      item.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = selectedLocation === 'ALL' || item.location === selectedLocation;
    const matchesSeverity = selectedSeverity === 'ALL' || item.severity === selectedSeverity;

    return matchesSearch && matchesLocation && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tổng dị biệt phát hiện</span>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {anomalies.length}
          </div>
          <span className="text-[11px] text-slate-400">Ghi nhận trong 90 ngày quan trắc</span>
        </div>

        <div className="rounded-xl border border-rose-300/60 bg-rose-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-rose-500/30 dark:bg-rose-950/20">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Bất thường nghiêm trọng</span>
          <div className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
            1
          </div>
          <span className="text-[11px] text-rose-600/80 dark:text-rose-300">Xung đột biến 980 µS/cm Sông Tiền</span>
        </div>

        <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-950/20">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Cảnh báo sớm</span>
          <div className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
            8
          </div>
          <span className="text-[11px] text-amber-600/80 dark:text-amber-300">Đa biến & Ngoại lai MAD</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">Thuật toán giám sát AI</span>
          <div className="mt-2 text-sm font-black text-cyan-600 dark:text-cyan-400">
            Isolation Forest + Robust Z
          </div>
          <span className="text-[11px] text-slate-400">Chống báo động giả đa biến</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo vị trí, thông số, kiểu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Vị trí: Tất cả trạm</option>
              <option value="multi_location">multi_location (Tương quan đa biến)</option>
              <option value="tien_river">tien_river (Sông Tiền)</option>
              <option value="storage_tank">storage_tank (Bể chứa)</option>
              <option value="raw_water_reservoir">raw_water_reservoir (Hồ thô)</option>
              <option value="pump_station_1">pump_station_1 (Trạm bơm cấp 1)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Mức độ: Tất cả mức</option>
              <option value="critical">Nghiêm trọng (Critical)</option>
              <option value="warning">Cảnh báo (Warning)</option>
              <option value="info">Thông tin (Info)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Anomaly Records Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bảng Chi Tiết Sự Cố Bất Thường (Hiển thị {filtered.length} / {anomalies.length} bản ghi)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Dữ liệu huấn luyện & suy luận trực tiếp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                <th className="pb-3 pr-3">Thời gian (Timestamp)</th>
                <th className="pb-3 px-3">Vị trí (Location)</th>
                <th className="pb-3 px-3">Thông số (Parameter)</th>
                <th className="pb-3 px-3">Giá trị đo</th>
                <th className="pb-3 px-3">Khoảng kỳ vọng</th>
                <th className="pb-3 px-3">Điểm dị biệt</th>
                <th className="pb-3 px-3">Thuật toán</th>
                <th className="pb-3 px-3">Kiểu bất thường</th>
                <th className="pb-3 pl-3 text-right">Mức độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filtered.map((ano) => {
                const isCrit = ano.severity === 'critical';
                return (
                  <tr key={ano.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 pr-3 font-sans text-slate-700 dark:text-slate-300 text-[11px]">
                      {ano.timestamp}
                    </td>
                    <td className="py-3 px-3 font-bold text-cyan-700 dark:text-cyan-300">
                      {ano.location}
                    </td>
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      {ano.parameter}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {typeof ano.value === 'number' ? ano.value.toFixed(3) : ano.value}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                      {ano.expRange}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                      {ano.score.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {ano.method}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {ano.type}
                    </td>
                    <td className="py-3 pl-3 text-right font-sans">
                      {isCrit ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          CRITICAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          WARNING
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
