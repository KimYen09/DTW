import { useState } from 'react';
import { 
  ViewMode, 
  TelemetryMetric, 
  PumpData, 
  AnomalyRecord, 
  AlertLogItem 
} from '../types';
import { 
  Home, 
  Gauge, 
  BellRing, 
  Settings,
  ArrowLeft,
  Activity,
  Droplet
} from 'lucide-react';

interface MobileDashboardProps {
  onSelectView: (view: ViewMode) => void;
  metrics: TelemetryMetric[];
  pumps: PumpData[];
  anomalies: AnomalyRecord[];
  alerts: AlertLogItem[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onRefreshData: () => void;
}

export function MobileDashboard({
  onSelectView,
  metrics,
  pumps,
  alerts,
  darkMode,
  onToggleDarkMode,
  onRefreshData
}: MobileDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'pumps' | 'alerts' | 'settings'>('home');

  const renderHomeTab = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tổng quan</h2>
        <button onClick={onRefreshData} className="rounded-full bg-slate-200 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300">
          <Activity className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {metrics.slice(0, 4).map(m => (
          <div key={m.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{m.name}</div>
            <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {m.value} <span className="text-sm text-slate-500">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPumpsTab = () => (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trạm Bơm</h2>
      <div className="flex flex-col gap-3">
        {pumps.map(p => (
          <div key={p.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-800 dark:text-white">{p.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'running' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                {p.statusText}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div>Tần số: {p.frequency} Hz</div>
              <div>Dòng: {p.current} A</div>
              <div>Nhiệt độ: {p.temp} °C</div>
              <div>CS: {p.power} kW</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cảnh Báo</h2>
      <div className="flex flex-col gap-3">
        {alerts.slice(0, 5).map(a => (
          <div key={a.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-xs font-bold ${a.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`}>{a.severity}</span>
              <span className="text-xs text-slate-500">{new Date(a.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="font-medium text-slate-800 dark:text-slate-200">{a.message}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cài Đặt</h2>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <button 
          onClick={onToggleDarkMode}
          className="w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <span className="text-slate-800 dark:text-slate-200 font-medium">Chế độ tối (Dark Mode)</span>
          <div className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-500' : 'bg-slate-300'} relative`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
          </div>
        </button>
        <button 
          onClick={() => onSelectView('intro')}
          className="w-full flex items-center gap-3 p-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Về trang giới thiệu</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 pt-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <Droplet className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">DTW Mobile</span>
        </div>
        <button onClick={() => onSelectView('intro')} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'pumps' && renderPumpsTab()}
        {activeTab === 'alerts' && renderAlertsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between z-20 pb-safe">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'home' ? 'fill-teal-100 dark:fill-teal-900/50' : ''}`} />
          <span className="text-[10px] font-medium">Tổng quan</span>
        </button>
        <button 
          onClick={() => setActiveTab('pumps')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'pumps' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Gauge className={`w-6 h-6 ${activeTab === 'pumps' ? 'fill-teal-100 dark:fill-teal-900/50' : ''}`} />
          <span className="text-[10px] font-medium">Trạm bơm</span>
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'alerts' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <div className="relative">
            <BellRing className={`w-6 h-6 ${activeTab === 'alerts' ? 'fill-teal-100 dark:fill-teal-900/50' : ''}`} />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900"></span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cảnh báo</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'fill-teal-100 dark:fill-teal-900/50' : ''}`} />
          <span className="text-[10px] font-medium">Cài đặt</span>
        </button>
      </div>
    </div>
  );
}
