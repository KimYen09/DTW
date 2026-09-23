import { useState, useEffect } from 'react';
import { ViewMode, TelemetryMetric, PumpData, AlertLogItem } from './types';
import { 
  initialTelemetryMetrics, 
  initialPumps, 
  anomalyRecordsData, 
  alertLogData 
} from './data/mockScadaData';
import { CompanyIntro } from './components/CompanyIntro';
import { ScadaDashboard } from './components/ScadaDashboard';
import { MobileDashboard } from './components/MobileDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('intro');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [metrics, setMetrics] = useState<TelemetryMetric[]>(initialTelemetryMetrics);
  const [pumps, setPumps] = useState<PumpData[]>(initialPumps);
  const [alerts, setAlerts] = useState<AlertLogItem[]>(alertLogData);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [kpisRes, pumpsRes, alertsRes] = await Promise.all([
        fetch('http://localhost:8000/api/kpis').catch(() => null),
        fetch('http://localhost:8000/api/pumps').catch(() => null),
        fetch('http://localhost:8000/api/alerts').catch(() => null)
      ]);

      if (kpisRes?.ok) {
        const data = await kpisRes.json();
        // Transform SystemKPIs into TelemetryMetric[]
        const newMetrics: TelemetryMetric[] = [
          {
            id: 'ec',
            name: 'Độ dẫn điện EC',
            nameEn: 'Current EC',
            value: data.ec?.value || 644.4,
            unit: data.ec?.unit || 'µS/cm',
            status: data.ec?.status || 'normal',
            subText: 'Độ dẫn điện',
            note: 'Dữ liệu thực',
            trend: 'steady'
          },
          {
            id: 'ph',
            name: 'pH hiện tại (bể chứa)',
            nameEn: 'Current pH',
            value: data.phLevel?.value || 7.47,
            unit: data.phLevel?.unit || 'pH',
            status: data.phLevel?.status || 'optimal',
            subText: 'Chuẩn QCVN: 6.5 - 8.5',
            note: 'Dữ liệu thực',
            trend: 'steady'
          },
          {
            id: 'turbidity',
            name: 'Độ đục hiện tại (bể chứa)',
            nameEn: 'Current Turbidity',
            value: data.turbidity?.value || 4.24,
            unit: data.turbidity?.unit || 'NTU',
            status: data.turbidity?.status || 'warning',
            subText: 'Độ đục sau lọc',
            note: 'Dữ liệu thực',
            trend: 'steady'
          },
          {
            id: 'river_level',
            name: 'Mực nước sông hiện tại',
            nameEn: 'Current River Level',
            value: data.riverLevel?.value || 4.16,
            unit: data.riverLevel?.unit || 'm',
            status: data.riverLevel?.status || 'normal',
            subText: 'Mực nước sông Tiền',
            note: 'Dữ liệu thực',
            trend: 'steady'
          },
          {
            id: 'flow_rate',
            name: 'Lưu lượng cấp hiện tại',
            nameEn: 'Current Qnt',
            value: data.waterFlow?.value || 1785.0,
            unit: data.waterFlow?.unit || 'm³/h',
            status: data.waterFlow?.status || 'optimal',
            subText: 'Công suất hiện thời',
            note: 'Dữ liệu thực',
            trend: 'steady'
          }
        ];
        setMetrics(newMetrics);
      }

      if (pumpsRes?.ok) {
        const data = await pumpsRes.json();
        // map backend pump to new UI PumpData
        const newPumps: PumpData[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          frequency: p.frequency || 0,
          current: p.current || 0,
          temp: p.temp || 0,
          power: p.power || 0,
          status: p.status === 'Running' || p.status === 'Đang chạy (Running)' ? 'running' : 'stopped',
          statusText: p.status,
          efficiency: p.efficiency || 0,
          vibration: p.vibration || 0,
          vfdBrand: 'Unknown',
          runningHours: p.runningHours || 0
        }));
        setPumps(newPumps);
      }

      if (alertsRes?.ok) {
        const data = await alertsRes.json();
        const newAlerts: AlertLogItem[] = data.map((a: any) => ({
          id: a.id,
          timestamp: a.timestamp,
          location: a.location,
          parameter: a.parameter,
          alertType: a.alert_type,
          severity: String(a.severity).toUpperCase(),
          value: a.value,
          forecastVal: a.forecast,
          status: String(a.status).toUpperCase(),
          message: a.message,
          recommendation: a.recommendation
        }));
        setAlerts(newAlerts);
      }
    } catch (e) {
      console.error('Error fetching API:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectView = (view: ViewMode) => {
    // Tự động điều hướng: Nếu người dùng ở trang intro bấm vào "Tổng quan" trên điện thoại
    // thì sẽ tự động chuyển vào Tool Hub (mobile_dashboard) thay vì bảng SCADA máy tính
    if (isMobile && view === 'overview' && currentView === 'intro') {
      setCurrentView('mobile_dashboard');
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className={`w-full min-h-screen font-sans ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {currentView === 'intro' ? (
        <CompanyIntro 
          onSelectView={handleSelectView} 
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      ) : currentView === 'mobile_dashboard' ? (
        <MobileDashboard
          onSelectView={setCurrentView}
          metrics={metrics}
          pumps={pumps}
          anomalies={anomalyRecordsData}
          alerts={alerts}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onRefreshData={fetchData}
        />
      ) : (
        <ScadaDashboard
          currentView={currentView}
          onSelectView={handleSelectView}
          metrics={metrics}
          pumps={pumps}
          anomalies={anomalyRecordsData}
          alerts={alerts}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onRefreshData={fetchData}
        />
      )}
    </div>
  );
}
