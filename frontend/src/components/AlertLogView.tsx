import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Download,
  Clock,
  ShieldAlert,
  UserCheck,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import { AlertItem } from '../types';

interface AlertLogViewProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string, operatorName: string) => void;
  onResolveAlert: (id: string) => void;
}

export const AlertLogView: React.FC<AlertLogViewProps> = ({
  alerts,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<AlertItem | null>(null);
  const [operatorName, setOperatorName] = useState('Kỹ sư Vận hành Ca 1');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        const matchesParam = item.parameter.toLowerCase().includes(q);
        const matchesRec = item.recommendation.toLowerCase().includes(q);
        if (!matchesLoc && !matchesMsg && !matchesParam && !matchesRec) return false;
      }
      return true;
    });
  }, [alerts, severityFilter, statusFilter, searchQuery]);

  const exportCSV = () => {
    const headers = [
      'timestamp',
      'location',
      'parameter',
      'alert_type',
      'severity',
      'value',
      'status',
      'message',
      'recommendation'
    ];
    const rows = filteredAlerts.map((a) => [
      a.timestamp,
      a.location,
      a.parameter,
      a.alert_type,
      a.severity,
      `"${a.value}"`,
      a.status,
      `"${a.message.replace(/"/g, '""')}"`,
      `"${a.recommendation.replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `water_plant_alerts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="alert-log-view" className="space-y-6 pb-12">
      {/* Alert Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-700 dark:text-slate-400">Tổng số cảnh báo</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {alerts.length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Toàn bộ phiên ghi</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Critical (Nghiêm trọng)</span>
          <div className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-400 mt-1">
            {alerts.filter((a) => a.severity === 'critical').length}
          </div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400/80 font-mono">Cần xử lý tức thì</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Đang mở (Open)</span>
          <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300 mt-1">
            {alerts.filter((a) => a.status === 'open').length}
          </div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400/80 font-mono">Chưa tiếp nhận</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Đã tiếp nhận & Xử lý</span>
          <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300 mt-1">
            {alerts.filter((a) => a.status !== 'open').length}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400/80 font-mono">Có chữ ký vận hành</span>
        </div>
      </div>

      {/* Filter and Search Action Strip */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-400 font-mono uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
            Tra cứu & Phân loại cảnh báo SCADA
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-cyan-800 dark:text-cyan-300 border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Xuất file CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-700 dark:text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm thông điệp, vị trí, khuyến nghị..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Severity selector */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tất cả mức độ (All Severity)</option>
              <option value="critical">Critical (Nghiêm trọng)</option>
              <option value="warning">Warning (Cảnh báo)</option>
              <option value="info">Info (Thông tin)</option>
            </select>
          </div>

          {/* Status selector */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tất cả trạng thái (All Status)</option>
              <option value="open">Đang mở (Open)</option>
              <option value="acknowledged">Đã xác nhận (Acknowledged)</option>
              <option value="resolved">Đã xử lý xong (Resolved)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Log Table matching Screenshot 8 */}
      <div className="rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-700 dark:text-slate-400 font-mono">
                <th className="py-2.5 px-3.5 font-semibold">timestamp</th>
                <th className="py-2.5 px-3 font-semibold">location</th>
                <th className="py-2.5 px-3 font-semibold">parameter</th>
                <th className="py-2.5 px-3 font-semibold">alert_type</th>
                <th className="py-2.5 px-3 font-semibold">severity</th>
                <th className="py-2.5 px-3 font-semibold">value</th>
                <th className="py-2.5 px-3 font-semibold">forecast</th>
                <th className="py-2.5 px-3 font-semibold">status</th>
                <th className="py-2.5 px-3 font-semibold">message</th>
                <th className="py-2.5 px-3 font-semibold">recommendation</th>
                <th className="py-2.5 px-3 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-700 dark:text-slate-300">
              {filteredAlerts.map((item) => {
                const isOpen = item.status === 'open';
                const isAck = item.status === 'acknowledged';

                return (
                  <tr key={item.id} className="hover:bg-slate-100 dark:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      {item.timestamp}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] border border-slate-300 dark:border-slate-700">
                        {item.location}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-cyan-700 dark:text-cyan-400 font-medium">
                      {item.parameter}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-400">
                      {item.alert_type}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
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

                    <td className="py-2.5 px-3 whitespace-nowrap font-bold text-white">
                      {item.value !== null && item.value !== undefined ? (
                        <span className={item.severity === 'critical' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                          {item.value}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-400">
                      {item.forecast}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isOpen
                            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                            : isAck
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-sans text-xs text-slate-700 dark:text-slate-300 max-w-[240px] truncate" title={item.message}>
                      {item.message}
                    </td>

                    <td className="py-2.5 px-3 font-sans text-xs text-slate-700 dark:text-slate-400 max-w-[260px] truncate" title={item.recommendation}>
                      {item.recommendation}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {isOpen ? (
                          <button
                            onClick={() => setSelectedAlertForModal(item)}
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-[11px] font-sans font-medium transition-colors"
                          >
                            Tiếp nhận
                          </button>
                        ) : isAck ? (
                          <button
                            onClick={() => onResolveAlert(item.id)}
                            className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 text-[11px] font-sans font-medium transition-colors"
                          >
                            Đã xử lý
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đóng
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acknowledge Alert Confirmation Modal */}
      {selectedAlertForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <ShieldAlert className="w-5 h-5" />
                Xác nhận tiếp nhận cảnh báo (Acknowledge Alert)
              </div>
              <button
                onClick={() => setSelectedAlertForModal(null)}
                className="text-slate-700 dark:text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono space-y-1">
                <div><span className="text-slate-700 dark:text-slate-400">Thời điểm:</span> {selectedAlertForModal.timestamp}</div>
                <div><span className="text-slate-700 dark:text-slate-400">Vị trí:</span> {selectedAlertForModal.location}</div>
                <div><span className="text-slate-700 dark:text-slate-400">Tham số:</span> {selectedAlertForModal.parameter}</div>
                <div><span className="text-slate-700 dark:text-slate-400">Giá trị đo:</span> <strong className="text-amber-800 dark:text-amber-300">{selectedAlertForModal.value}</strong></div>
              </div>

              <div>
                <span className="text-slate-700 dark:text-slate-400">Khuyến nghị kỹ thuật:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 p-2.5 rounded bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700">
                  {selectedAlertForModal.recommendation}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Họ tên kỹ sư xác nhận:
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              <button
                onClick={() => setSelectedAlertForModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onAcknowledgeAlert(selectedAlertForModal.id, operatorName);
                  setSelectedAlertForModal(null);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow"
              >
                Ký nhận vào nhật ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
