import { useState } from 'react';
import { BellRing, Download, Search, CheckCircle, AlertTriangle, FileText, Check } from 'lucide-react';
import { AlertLogItem } from '../../types';

interface AlertLogViewProps {
  initialAlerts: AlertLogItem[];
}

export function AlertLogView({ initialAlerts }: AlertLogViewProps) {
  const [alerts, setAlerts] = useState<AlertLogItem[]>(initialAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'ACKNOWLEDGED' } : item
      )
    );
    showToast(`Đã tiếp nhận cảnh báo #${id}`);
  };

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'RESOLVED' } : item
      )
    );
    showToast(`Đã giải quyết và đóng sự cố #${id}`);
  };

  const handleExportCSV = () => {
    const headers = ['Mã', 'Thời gian', 'Vị trí', 'Thông số', 'Loại', 'Mức độ', 'Giá trị', 'Trạng thái', 'Nội dung'];
    const rows = alerts.map((a) => [
      a.id,
      a.timestamp,
      a.location,
      a.parameter,
      a.alertType,
      a.severity,
      String(a.value),
      a.status,
      `"${a.message.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nhat_ky_canh_bao_DTW_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Đã xuất file báo cáo CSV thành công!');
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.parameter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const totalCount = alerts.length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const openCount = alerts.filter((a) => a.status === 'OPEN').length;
  const ackCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-bounce">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">Tổng số cảnh báo</span>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-400">Ghi nhận trong ca trực SCADA</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">Nghiêm trọng (Critical)</span>
          <div className="mt-2 text-3xl font-black text-slate-700 dark:text-slate-300">
            {criticalCount}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Đã kiểm soát an toàn
          </span>
        </div>

        <div className="rounded-xl border border-amber-300/60 bg-amber-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-amber-500/30 dark:bg-amber-950/20">
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Đang mở (Open)</span>
          <div className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
            {openCount}
          </div>
          <span className="text-[11px] text-amber-600/80 dark:text-amber-300">Yêu cầu kíp trực xác nhận</span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">Đã tiếp nhận (Ack)</span>
          <div className="mt-2 text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {ackCount}
          </div>
          <span className="text-[11px] text-slate-400">Đang thực hiện quy trình kỹ thuật</span>
        </div>
      </div>

      {/* Filter and Export Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo nội dung, vị trí, thông số..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Mức độ: Tất cả</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="WARNING">WARNING</option>
            <option value="INFO">INFO</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="OPEN">OPEN (Đang mở)</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED (Đã tiếp nhận)</option>
            <option value="RESOLVED">RESOLVED (Đã xử lý)</option>
          </select>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <Download className="h-4 w-4 text-cyan-400" />
          <span>Xuất file CSV</span>
        </button>
      </div>

      {/* Alert Log Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Danh sách Nhật Ký Sự Cố & Cảnh Báo (SCADA Alert Log)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Hiển thị {filteredAlerts.length} bản ghi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                <th className="pb-3 pr-3">Thời gian</th>
                <th className="pb-3 px-3">Vị trí trạm</th>
                <th className="pb-3 px-3">Thông số</th>
                <th className="pb-3 px-3">Loại cảnh báo</th>
                <th className="pb-3 px-3">Mức độ</th>
                <th className="pb-3 px-3">Giá trị đo</th>
                <th className="pb-3 px-3">Trạng thái</th>
                <th className="pb-3 px-3">Nội dung & Khuyến nghị</th>
                <th className="pb-3 pl-3 text-right">Thao tác ca trực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredAlerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-3 font-sans text-slate-700 dark:text-slate-300 text-[11px]">
                    {alt.timestamp}
                  </td>
                  <td className="py-3 px-3 font-bold text-cyan-700 dark:text-cyan-300">
                    {alt.location}
                  </td>
                  <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                    {alt.parameter}
                  </td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                    {alt.alertType}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {alt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {typeof alt.value === 'number' ? alt.value.toFixed(1) : alt.value}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    {alt.status === 'OPEN' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        OPEN
                      </span>
                    ) : alt.status === 'ACKNOWLEDGED' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                        ACKNOWLEDGED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        RESOLVED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-sans text-slate-700 dark:text-slate-300 max-w-xs">
                    <p className="truncate font-medium">{alt.message}</p>
                    <p className="text-[10px] text-slate-400 truncate">{alt.recommendation}</p>
                  </td>
                  <td className="py-3 pl-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      {alt.status === 'OPEN' && (
                        <button
                          onClick={() => handleAcknowledge(alt.id)}
                          className="rounded bg-cyan-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-cyan-500 transition-colors"
                        >
                          Tiếp nhận
                        </button>
                      )}
                      {alt.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(alt.id)}
                          className="rounded bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 transition-colors"
                        >
                          Giải quyết
                        </button>
                      )}
                      {alt.status === 'RESOLVED' && (
                        <span className="text-[11px] text-slate-400">Đã lưu trữ</span>
                      )}
                    </div>
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
