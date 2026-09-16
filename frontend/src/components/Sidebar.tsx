import React from 'react';
import {
  LayoutDashboard,
  Droplets,
  Waves,
  Gauge,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NavPage } from '../types';

interface SidebarProps {
  currentPage: NavPage;
  onSelectPage: (page: NavPage) => void;
  activeAlertCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  activeAlertCount,
  onRefresh,
  isRefreshing,
  collapsed,
  onToggleCollapse
}) => {
  const navItems = [
    {
      id: 'overview' as NavPage,
      label: 'Tổng quan',
      subLabel: 'Overview',
      icon: LayoutDashboard
    },
    {
      id: 'water_quality' as NavPage,
      label: 'Water Quality',
      subLabel: 'Chất lượng nước',
      icon: Droplets
    },
    {
      id: 'river_monitoring' as NavPage,
      label: 'River Monitoring',
      subLabel: 'Giám sát sông Tiền',
      icon: Waves
    },
    {
      id: 'pump_monitoring' as NavPage,
      label: 'Pump Monitoring',
      subLabel: 'Giám sát trạm bơm',
      icon: Gauge
    },
    {
      id: 'anomaly_detection' as NavPage,
      label: 'Anomaly Detection',
      subLabel: 'Phát hiện bất thường',
      icon: ShieldAlert
    },
    {
      id: 'forecast' as NavPage,
      label: 'Forecast',
      subLabel: 'Dự báo vận hành',
      icon: TrendingUp
    },
    {
      id: 'alert_log' as NavPage,
      label: 'Alert Log',
      subLabel: 'Nhật ký cảnh báo',
      icon: AlertTriangle,
      badge: activeAlertCount
    }
  ];

  return (
    <aside
      id="sidebar-container"
      className={`relative flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/95 backdrop-blur-xl transition-all duration-300 z-30 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-lg shrink-0 overflow-hidden">
            <svg xmlns="http://www.svg.org/2000/svg" viewBox="0 0 200 120" className="w-full h-full p-0.5">
              <ellipse cx="100" cy="60" rx="90" ry="50" fill="#001278" transform="rotate(-15 100 60)" />
              <text x="100" y="75" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="52" fontStyle="italic" fill="white" textAnchor="middle" letterSpacing="-2">DTW</text>
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-white truncate">
                DONG TAM WATER
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-cyan-400/90 font-mono flex items-center gap-1.5 truncate">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SCADA Telemetry v2.4
              </p>
            </div>
          )}
        </div>

        <button
          id="btn-collapse-sidebar"
          onClick={onToggleCollapse}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          className="p-1.5 text-slate-700 dark:text-slate-400 hover:text-white rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation section */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[11px] font-medium tracking-wider uppercase text-slate-700 dark:text-slate-400">
            Điều hướng hệ thống
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative text-left ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:bg-slate-800/70 border border-transparent'
              }`}
            >
              <div
                className={`p-1.5 rounded-md transition-colors shrink-0 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300'
                    : 'text-slate-700 dark:text-slate-400 group-hover:text-slate-800 dark:text-slate-200 group-hover:bg-slate-100 dark:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div className="truncate">
                    <div className="truncate text-xs font-semibold leading-tight">{item.label}</div>
                    <div className="truncate text-[10px] text-slate-700 dark:text-slate-400 font-normal">{item.subLabel}</div>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}

              {/* Collapsed Badge indicator */}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer System Advice & Action */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 space-y-3">
        {!collapsed && (
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700/50 text-[11px] text-slate-700 dark:text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <Activity className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400" />
              Cơ chế giám sát
            </div>
            Decision support only — no PLC/SCADA control
          </div>
        )}

        <button
          id="btn-sidebar-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 transition-all ${
            isRefreshing ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'
          }`}
          title="Làm mới dữ liệu từ trạm"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-700 dark:text-cyan-400' : ''}`} />
          {!collapsed && <span>{isRefreshing ? 'Đang đồng bộ...' : 'Refresh data'}</span>}
        </button>

        {!collapsed && (
          <div className="flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-400 font-mono px-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live telemetry
            </span>
            <span>Ping 12ms</span>
          </div>
        )}
      </div>
    </aside>
  );
};
