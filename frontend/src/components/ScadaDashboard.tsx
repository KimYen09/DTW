import { useState } from 'react';
import { 
  ViewMode, 
  TelemetryMetric, 
  PumpData, 
  AnomalyRecord, 
  AlertLogItem 
} from '../types';
import { 
  Activity, 
  Droplet, 
  Waves, 
  Gauge, 
  ShieldAlert, 
  TrendingUp, 
  BellRing, 
  RefreshCw, 
  Upload, 
  Sun, 
  Moon, 
  ArrowLeft,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
  X,
  Check,
  Grid
} from 'lucide-react';
import { WaterRippleCanvas } from './WaterRippleCanvas';
import { OverviewView } from './dashboard/OverviewView';
import { WaterQualityView } from './dashboard/WaterQualityView';
import { RiverMonitoringView } from './dashboard/RiverMonitoringView';
import { PumpMonitoringView } from './dashboard/PumpMonitoringView';
import { AnomalyDetectionView } from './dashboard/AnomalyDetectionView';
import { ForecastView } from './dashboard/ForecastView';
import { AlertLogView } from './dashboard/AlertLogView';

interface ScadaDashboardProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  metrics: TelemetryMetric[];
  pumps: PumpData[];
  anomalies: AnomalyRecord[];
  alerts: AlertLogItem[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefreshData: () => void;
}

export function ScadaDashboard({
  currentView,
  onSelectView,
  metrics,
  pumps,
  anomalies,
  alerts,
  darkMode,
  onToggleDarkMode,
  onRefreshData
}: ScadaDashboardProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAlertDrawer, setShowAlertDrawer] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [enableRippleBackground, setEnableRippleBackground] = useState(true);

  const navItems = [
    { id: 'overview' as ViewMode, label: 'Tổng quan', labelEn: 'Overview', icon: Activity },
    { id: 'water_quality' as ViewMode, label: 'Chất lượng nước', labelEn: 'Water Quality', icon: Droplet },
    { id: 'river_monitoring' as ViewMode, label: 'Giám sát sông Tiền', labelEn: 'River Monitoring', icon: Waves },
    { id: 'pump_monitoring' as ViewMode, label: 'Giám sát trạm bơm', labelEn: 'Pump Monitoring', icon: Gauge },
    { id: 'anomaly_detection' as ViewMode, label: 'Phát hiện bất thường', labelEn: 'Anomaly Detection', icon: ShieldAlert, badge: '9' },
    { id: 'forecast' as ViewMode, label: 'Dự báo', labelEn: 'Forecast', icon: TrendingUp },
    { id: 'alert_log' as ViewMode, label: 'Nhật ký cảnh báo', labelEn: 'Alert Log', icon: BellRing, badge: '5', badgeColor: 'bg-amber-500' }
  ];

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefreshData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('http://localhost:8000/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          setImportSuccess(true);
          onRefreshData();
          setTimeout(() => {
            setImportSuccess(false);
            setShowImportModal(false);
          }, 1500);
        } else {
          alert('Upload failed');
        }
      } catch (error) {
        console.error('Upload error', error);
        alert('Upload failed');
      }
    }
  };

  const activeTitle = navItems.find((n) => n.id === currentView)?.label || 'Bảng điều khiển';

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-800'}`}>
      {/* Top SCADA Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Brand & Return to DTW Intro */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('intro')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Quay lại trang giới thiệu DTW"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden sm:inline">Giới thiệu DTW</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden">
              <img src="/logo.png" alt="DTW Logo" className="h-full w-full object-contain p-1" />
            </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {activeTitle}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE TELEMETRY
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Risk Indicator */}
            <div className="hidden items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span>MỨC RỦI RO: WARNING</span>
            </div>

            {/* Import Excel button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Upload className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="hidden md:inline">Nhập dữ liệu (Excel)</span>
            </button>

            {/* Refresh button */}
            <button
              onClick={handleRefreshClick}
              className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 ${
                isRefreshing ? 'opacity-70' : ''
              }`}
              title="Làm mới dữ liệu tức thời"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {/* Alert Bell Button */}
            <button
              onClick={() => setShowAlertDrawer(!showAlertDrawer)}
              className="relative rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title="Thông báo cảnh báo"
            >
              <BellRing className="h-4 w-4 text-amber-500" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                5
              </span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              title={darkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Advisory Warning Banner matching user's original layout */}
        <div className="flex items-center justify-between border-t border-amber-300/40 bg-amber-500/10 px-4 py-1.5 text-[11px] text-amber-700 dark:text-amber-300">
          <div className="flex items-center gap-2 truncate">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <span className="truncate">
              <strong>LƯU Ý VẬN HÀNH:</strong> Dữ liệu mô phỏng theo dõi vận hành trạm cấp nước Đồng Tâm (DTW) - 
              Dashboard chỉ hỗ trợ xem xét và rà soát giám sát, không thay thế hệ thống điều khiển PLC tại chỗ.
            </span>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-slate-400">
            Node: DTW-TGIANG-01
          </span>
        </div>
      </header>

      {/* Main Workspace Layout with Sidebar */}
      <div className="flex min-h-[calc(100vh-6rem)]">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 hidden md:block">
          <div className="mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Phân Hệ Nghiệp Vụ DTW
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-600 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400 dark:text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                        item.badgeColor
                          ? `${item.badgeColor} text-white`
                          : isActive
                          ? 'bg-slate-800 text-white dark:bg-cyan-700'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Return to Intro Page Button */}
          <div className="mt-8 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => onSelectView('intro')}
              className="flex w-full items-center gap-2 rounded-xl border border-cyan-300/50 bg-cyan-50/50 p-2.5 text-xs font-bold text-cyan-800 hover:bg-cyan-100/70 transition-all dark:border-cyan-700/40 dark:bg-cyan-950/30 dark:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <div className="text-left">
                <div>Về Trang Giới Thiệu DTW</div>
                <div className="text-[10px] font-normal text-cyan-600 dark:text-cyan-400">
                  Nền nước gợn sóng & sứ mệnh
                </div>
              </div>
            </button>

            {/* Operator Station Badge */}
            <div className="mt-4 rounded-lg bg-slate-100 p-2.5 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                <span>Trạm quan trắc Sông Tiền</span>
              </div>
              <div className="mt-1 text-[10px]">
                Kíp trực: Ca 1 (06:00 - 14:00)
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                SCADA Server: Kết nối ổn định (12ms)
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl">
          {/* Sub-view rendering */}
          {currentView === 'overview' && (
            <OverviewView metrics={metrics} pumps={pumps} onNavigate={onSelectView} />
          )}

          {currentView === 'water_quality' && (
            <WaterQualityView />
          )}

          {currentView === 'river_monitoring' && (
            <RiverMonitoringView />
          )}

          {currentView === 'pump_monitoring' && (
            <PumpMonitoringView pumps={pumps} />
          )}

          {currentView === 'anomaly_detection' && (
            <AnomalyDetectionView anomalies={anomalies} />
          )}

          {currentView === 'forecast' && (
            <ForecastView />
          )}

          {currentView === 'alert_log' && (
            <AlertLogView initialAlerts={alerts} />
          )}
        </main>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nhập file dữ liệu đo lường (Excel / CSV)
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tải lên file dữ liệu nhật ký trạm bơm, độ mặn EC hoặc chỉ tiêu chất lượng nước (.xlsx, .csv) để đồng bộ vào mô hình phân tích.
            </p>

            <div className="mt-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-cyan-400 transition-colors dark:border-slate-700">
              <Upload className="mx-auto h-8 w-8 text-cyan-500" />
              <label className="mt-2 block cursor-pointer text-xs font-bold text-cyan-600 hover:underline">
                <span>Chọn tập tin từ máy tính</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-[11px] text-slate-400">
                Hỗ trợ định dạng Excel SCADA và CSV chuẩn thời gian thực
              </p>
            </div>

            {importSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
                <Check className="h-4 w-4" />
                <span>Nhập dữ liệu thành công! Đang làm mới biểu đồ...</span>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Alert Preview Popover */}
      {showAlertDrawer && (
        <div className="fixed top-16 right-4 z-40 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Cảnh báo đang hoạt động (5)
            </span>
            <button
              onClick={() => setShowAlertDrawer(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto text-xs">
            {alerts.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                onClick={() => {
                  setShowAlertDrawer(false);
                  onSelectView('alert_log');
                }}
                className="cursor-pointer rounded-lg bg-slate-50 p-2 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800"
              >
                <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                  <span className="truncate">{alt.parameter}</span>
                  <span className="text-[10px] text-amber-500 font-bold">{alt.severity}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500 truncate">{alt.message}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setShowAlertDrawer(false);
              onSelectView('alert_log');
            }}
            className="mt-3 block w-full rounded-lg bg-cyan-600 py-1.5 text-center text-xs font-semibold text-white hover:bg-cyan-500"
          >
            Mở toàn bộ nhật ký sự cố
          </button>
        </div>
      )}
    </div>
  );
}
