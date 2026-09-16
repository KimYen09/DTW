import React from 'react';
import {
  AlertTriangle,
  Radio,
  Clock,
  RotateCw,
  Bell,
  Cpu,
  Layers,
  Sun,
  Moon
} from 'lucide-react';
import { NavPage, SystemKPIs } from '../types';

interface HeaderProps {
  currentPage: NavPage;
  kpis: SystemKPIs;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAlerts: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const pageTitles: Record<NavPage, { title: string; subtitle: string }> = {
  overview: {
    title: 'Tổng quan Hệ thống',
    subtitle: 'Theo dõi toàn bộ chỉ số vận hành trạm cấp nước theo thời gian thực'
  },
  water_quality: {
    title: 'Giám sát Chất lượng Nước (Water Quality)',
    subtitle: 'Phân tích thông số lý hóa tại các phân đoạn hồ nước thô và bể chứa'
  },
  river_monitoring: {
    title: 'Giám sát Mực nước & Độ dẫn Sông Tiền (River Monitoring)',
    subtitle: 'Theo dõi chỉ số EC và cao trình mực nước sông cấp nguồn'
  },
  pump_monitoring: {
    title: 'Giám sát Trạm Bơm (Pump Monitoring)',
    subtitle: 'Theo dõi tình trạng tần số, dòng điện, nhiệt độ và công suất 5 tổ máy bơm'
  },
  anomaly_detection: {
    title: 'Phát hiện Bất thường (Anomaly Detection)',
    subtitle: 'Thuật toán Machine Learning nhận diện biến dị bất thường của cảm biến'
  },
  forecast: {
    title: 'Dự báo Vận hành (Operational Forecast)',
    subtitle: 'Mô hình dự báo đa bước thời gian (1h đến 6h) hỗ trợ điều tiết'
  },
  alert_log: {
    title: 'Nhật ký Cảnh báo (Alert Log)',
    subtitle: 'Lưu trữ và phân loại các cảnh báo phát sinh trên toàn mạng lưới'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  kpis,
  onRefresh,
  isRefreshing,
  onOpenAlerts,
  isDarkMode,
  onToggleTheme
}) => {
  const currentInfo = pageTitles[currentPage];

  return (
    <header id="main-header" className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
      {/* Upper bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        {/* Title and subtitle */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <span>{currentInfo.title}</span>
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-800/50">
              <Radio className="w-3 h-3 text-cyan-700 dark:text-cyan-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-400 truncate max-w-xl">
            {currentInfo.subtitle}
          </p>
        </div>

        {/* Right side telemetry status pill & actions */}
        <div className="flex items-center gap-2.5">
          {/* Risk Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
              kpis.currentRisk === 'CRITICAL'
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 animate-pulse'
                : kpis.currentRisk === 'WARNING'
                ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                kpis.currentRisk === 'CRITICAL'
                  ? 'bg-rose-500'
                  : kpis.currentRisk === 'WARNING'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span>Mức rủi ro: {kpis.currentRisk}</span>
          </div>

          {/* Sync status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
            <span className="text-[11px] text-slate-700 dark:text-slate-400">Cập nhật:</span>
            <span className="text-slate-800 dark:text-slate-200">{kpis.lastUpdated.split(' ')[1]}</span>
          </div>

          <button
            id="btn-header-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            title="Đồng bộ lại dữ liệu"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-500 dark:text-cyan-400' : 'text-slate-700 dark:text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            id="btn-header-alerts"
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
            title="Xem tất cả cảnh báo"
          >
            <Bell className="w-4 h-4" />
            {kpis.activeAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 font-mono">
                {kpis.activeAlerts}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors"
            title="Toggle Light/Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mandatory Notice Banner from screenshots */}
      <div className="bg-amber-950/40 border-t border-b border-amber-500/20 px-6 py-2 flex items-center gap-2.5 text-xs text-amber-200/90">
        <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
        <span className="font-mono text-[11px] sm:text-xs">
          <strong>Dữ liệu hiện tại là SYNTHETIC / SIMULATED — NOT FACTORY DATA.</strong> Dashboard chỉ hỗ trợ xem xét vận hành, không điều khiển thiết bị.
        </span>
      </div>
    </header>
  );
};
