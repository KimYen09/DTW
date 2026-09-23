import { useState, useMemo } from 'react';
import { 
  ViewMode, 
  TelemetryMetric, 
  PumpData, 
  AnomalyRecord, 
  AlertLogItem 
} from '../types';
import { 
  Search,
  ArrowLeft,
  Activity,
  Droplet,
  Waves,
  Gauge,
  ShieldAlert,
  TrendingUp,
  BellRing,
  ChevronRight,
  Sun,
  Moon
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
  const [searchTerm, setSearchTerm] = useState('');

  // Danh sách công cụ được tối giản lại dựa trên AllInOneToolPortal
  const tools = useMemo(() => [
    {
      id: 'overview' as ViewMode,
      title: 'Tổng Quan SCADA',
      desc: 'Giám sát 6 chỉ số trọng yếu và trạng thái tổ máy bơm',
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Trung tâm',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
    },
    {
      id: 'water_quality' as ViewMode,
      title: 'Chất Lượng Nước',
      desc: 'Quan trắc thông số lý hóa, kiểm tra chuẩn QCVN 01-1',
      icon: Droplet,
      color: 'from-teal-500 to-emerald-600',
      badge: 'QCVN',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
    },
    {
      id: 'river_monitoring' as ViewMode,
      title: 'Giám Sát Sông Tiền',
      desc: 'Theo dõi cao trình triều cường và độ mặn EC',
      icon: Waves,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Chống Hạn Mặn',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    },
    {
      id: 'pump_monitoring' as ViewMode,
      title: 'Quản Trị Trạm Bơm',
      desc: 'Phân tích điện năng tiêu thụ, dòng, áp suất VFD',
      icon: Gauge,
      color: 'from-fuchsia-500 to-purple-600',
      badge: 'Hiệu suất',
      badgeColor: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20'
    },
    {
      id: 'anomaly_detection' as ViewMode,
      title: 'Phát Hiện Bất Thường AI',
      desc: 'Hệ thống AI tự động phân tích và cảnh báo rủi ro',
      icon: ShieldAlert,
      color: 'from-orange-500 to-red-600',
      badge: 'Isolation Forest',
      badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
    },
    {
      id: 'forecast' as ViewMode,
      title: 'Dự Báo & Mô Phỏng',
      desc: 'Dự đoán thông số 1h - 24h tới với AI',
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-600',
      badge: 'Random Forest',
      badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-500/20'
    },
    {
      id: 'alert_log' as ViewMode,
      title: 'Nhật Ký Cảnh Báo',
      desc: 'Quản lý, xác nhận sự cố và xuất báo cáo CSV',
      icon: BellRing,
      color: 'from-rose-500 to-pink-600',
      badge: 'Audit Log',
      badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
    }
  ], []);

  const filteredTools = tools.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 pt-6 border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} sticky top-0 z-20`}>
        <div className="flex items-center gap-3">
          <button onClick={() => onSelectView('intro')} className={`p-2 rounded-full ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">DTW Tool Hub</span>
            <span className={`text-[10px] font-semibold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>Tất Cả Trong Một</span>
          </div>
        </div>
        <button onClick={onToggleDarkMode} className={`p-2 rounded-full ${darkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-10 relative">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm công cụ..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-3 pl-10 pr-4 rounded-xl border outline-none font-medium text-sm transition-all ${
              darkMode 
                ? 'bg-slate-900 border-slate-800 focus:border-cyan-500 placeholder-slate-500' 
                : 'bg-white border-slate-200 focus:border-cyan-500 placeholder-slate-400 shadow-sm'
            }`}
          />
        </div>

        {/* Tools List */}
        <div className="flex flex-col gap-4">
          {filteredTools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectView(tool.id)}
                className={`text-left flex items-start gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98] ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr ${tool.color} text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm truncate">{tool.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className={`inline-block mb-1 px-2 py-0.5 rounded text-[9px] font-bold self-start border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                  <p className={`text-xs line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tool.desc}
                  </p>
                </div>
              </button>
            )
          })}
          
          {filteredTools.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm">
              Không tìm thấy công cụ nào phù hợp
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
