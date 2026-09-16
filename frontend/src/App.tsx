/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavPage, SystemKPIs, PumpData, AlertItem } from './types';
import { initialKPIs, initialPumps, initialAlertLogs } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { WaterQualityView } from './components/WaterQualityView';
import { RiverMonitoringView } from './components/RiverMonitoringView';
import { PumpMonitoringView } from './components/PumpMonitoringView';
import { AnomalyDetectionView } from './components/AnomalyDetectionView';
import { ForecastView } from './components/ForecastView';
import { AlertLogView } from './components/AlertLogView';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [kpis, setKpis] = useState<SystemKPIs | null>(null);
  const [pumps, setPumps] = useState<PumpData[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active alert count calculation
  const activeAlertCount = alerts.filter((a) => a.status === 'open').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const baseUrl = import.meta.env.BASE_URL;
      const [kpisRes, pumpsRes, alertsRes] = await Promise.all([
        fetch(`${baseUrl}data/kpis.json`),
        fetch(`${baseUrl}data/pumps.json`),
        fetch(`${baseUrl}data/alerts.json`)
      ]);
      if (kpisRes.ok) setKpis(await kpisRes.json());
      if (pumpsRes.ok) setPumps(await pumpsRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      showToast('Đã đồng bộ dữ liệu viễn trắc thành công.');
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi đồng bộ dữ liệu. Đang dùng dữ liệu cũ.');
      if (!kpis) setKpis(initialKPIs);
      if (pumps.length === 0) setPumps(initialPumps);
      if (alerts.length === 0) setAlerts(initialAlertLogs);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  // Alert actions
  const handleAcknowledgeAlert = (id: string, operatorName: string) => {
    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'acknowledged',
              acknowledged_at: now,
              acknowledged_by: operatorName
            }
          : item
      )
    );
    showToast(`Cảnh báo [${id}] đã được tiếp nhận bởi ${operatorName}`);
  };

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'resolved' } : item))
    );
    showToast(`Đã đánh dấu xử lý hoàn tất cảnh báo [${id}]`);
  };

  if (!kpis) {
    return <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 tech-grid">
      {/* Sidebar navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        activeAlertCount={activeAlertCount}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50/90 dark:bg-slate-950/90">
        {/* Universal Top Header */}
        <Header
          currentPage={currentPage}
          kpis={kpis}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onOpenAlerts={() => setCurrentPage('alert_log')}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'overview' && (
              <OverviewView
                kpis={kpis}
                pumps={pumps}
                onNavigate={setCurrentPage}
              />
            )}

            {currentPage === 'water_quality' && <WaterQualityView />}

            {currentPage === 'river_monitoring' && <RiverMonitoringView />}

            {currentPage === 'pump_monitoring' && <PumpMonitoringView pumps={pumps} />}

            {currentPage === 'anomaly_detection' && <AnomalyDetectionView />}

            {currentPage === 'forecast' && <ForecastView />}

            {currentPage === 'alert_log' && (
              <AlertLogView
                alerts={alerts}
                onAcknowledgeAlert={handleAcknowledgeAlert}
                onResolveAlert={handleResolveAlert}
              />
            )}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-500/40 text-slate-900 dark:text-cyan-300 text-xs font-mono shadow-xl shadow-slate-200/50 dark:shadow-cyan-950/40 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
