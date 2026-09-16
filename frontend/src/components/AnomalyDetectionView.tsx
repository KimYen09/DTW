import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Eye,
  Info,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AnomalyCandidate } from '../types';
import { anomalyCandidatesList } from '../data/mockData';

export const AnomalyDetectionView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAnomalies = useMemo(() => {
    return anomalyCandidatesList.filter((item) => {
      if (selectedLocation !== 'all' && item.location !== selectedLocation) return false;
      if (selectedType !== 'all' && item.anomaly_type !== selectedType) return false;
      if (selectedSeverity !== 'all' && item.severity !== selectedSeverity) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesParam = item.parameter.toLowerCase().includes(query);
        const matchesExpl = item.explanation.toLowerCase().includes(query);
        const matchesMethod = item.detection_method.toLowerCase().includes(query);
        const matchesEvidence = item.evidence.toLowerCase().includes(query);
        if (!matchesParam && !matchesExpl && !matchesMethod && !matchesEvidence) return false;
      }
      return true;
    });
  }, [selectedLocation, selectedType, selectedSeverity, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div id="anomaly-detection-view" className="space-y-6 pb-12">
      {/* Overview stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-700 dark:text-slate-400">Tổng dị biệt phát hiện</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {anomalyCandidatesList.length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Q1/2025 Dataset</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-rose-700 dark:text-rose-400">Critical Anomaly</span>
          <div className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-400 mt-1">
            {anomalyCandidatesList.filter((a) => a.severity === 'critical').length}
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400/80 font-mono">Xung đột biến 980 µS/cm</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-amber-700 dark:text-amber-400">Warning Candidates</span>
          <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1">
            {anomalyCandidatesList.filter((a) => a.severity === 'warning').length}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400/80 font-mono">Đa biến & Ngoại lai MAD</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-cyan-700 dark:text-cyan-400">Thuật toán giám sát</span>
          <div className="text-sm font-bold font-mono text-cyan-800 dark:text-cyan-300 mt-2">
            Isolation Forest + Robust Z
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Rolling MAD window 24h</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-400 font-mono uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            Bộ lọc & Tìm kiếm bất thường
          </div>

          <span className="text-xs text-slate-700 dark:text-slate-400 font-mono">
            Hiển thị {filteredAnomalies.length} / {anomalyCandidatesList.length} bản ghi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-700 dark:text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo giải thích, tham số..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Location filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tất cả vị trí</option>
              <option value="multi_location">multi_location</option>
              <option value="storage_tank">storage_tank</option>
              <option value="tien_river">tien_river</option>
            </select>
          </div>

          {/* Anomaly type filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tất cả loại bất thường</option>
              <option value="statistical_outlier">statistical_outlier</option>
              <option value="sensor_anomaly_candidate">sensor_anomaly_candidate</option>
              <option value="missing_data">missing_data</option>
            </select>
          </div>

          {/* Severity filter */}
          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main High-Tech Table matching Screenshots 4 & 5 */}
      <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-400 font-mono">
                <th className="py-3 px-3.5 font-semibold">timestamp</th>
                <th className="py-3 px-3 font-semibold">location</th>
                <th className="py-3 px-3 font-semibold">parameter</th>
                <th className="py-3 px-3 font-semibold">value</th>
                <th className="py-3 px-3 font-semibold">exp_range</th>
                <th className="py-3 px-3 font-semibold">score</th>
                <th className="py-3 px-3 font-semibold">method</th>
                <th className="py-3 px-3 font-semibold">type</th>
                <th className="py-3 px-3 font-semibold">severity</th>
                <th className="py-3 px-3 font-semibold">evidence</th>
                <th className="py-3 px-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
              {filteredAnomalies.map((item) => {
                const isExpanded = expandedId === item.id;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => toggleExpand(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-100 dark:bg-slate-800/60' : 'hover:bg-slate-100 dark:bg-slate-800/30'
                      }`}
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-800 dark:text-slate-200">
                        {item.timestamp}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-300 dark:border-slate-700">
                          {item.location}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-cyan-700 dark:text-cyan-400 font-medium">
                        {item.parameter}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-bold text-white">
                        {item.value !== null && item.value !== undefined ? (
                          <span className={item.severity === 'critical' ? 'text-rose-700 dark:text-rose-400' : 'text-amber-800 dark:text-amber-300'}>
                            {typeof item.value === 'number' ? item.value.toFixed(3) : item.value}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 dark:text-slate-400 text-[11px]">
                        {item.expected_range_low !== null && item.expected_range_low !== undefined
                          ? `[${item.expected_range_low.toFixed(2)}, ${item.expected_range_high?.toFixed(2)}]`
                          : <span className="text-slate-600">—</span>}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap font-semibold">
                        <span className={item.anomaly_score < 0 ? 'text-amber-700 dark:text-amber-400' : item.anomaly_score > 10 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                          {item.anomaly_score.toFixed(3)}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 dark:text-slate-400 text-[11px]">
                        {item.detection_method}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 text-[10px] border border-slate-200 dark:border-slate-800">
                          {item.anomaly_type}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
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

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-400 text-[11px] max-w-[200px] truncate">
                        {item.evidence}
                      </td>

                      <td className="py-3 px-2 text-right pr-3">
                        <button
                          type="button"
                          className="p-1 rounded text-slate-700 dark:text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable detail explanation row */}
                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={11} className="py-3 px-5">
                          <div className="rounded-lg bg-white dark:bg-slate-900 p-3.5 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-cyan-700 dark:text-cyan-400" />
                                Chi tiết giải thích thuật toán (Explanation & Diagnostics)
                              </span>
                              <span className="text-[11px] text-slate-700 dark:text-slate-400 font-mono">
                                Mã định danh: {item.id}
                              </span>
                            </div>

                            <p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                              {item.explanation}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-400 font-mono">
                              <span><strong>Bằng chứng (Evidence):</strong> {item.evidence}</span>
                              {item.end_timestamp && (
                                <span className="ml-auto"><strong>Kết thúc:</strong> {item.end_timestamp}</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
