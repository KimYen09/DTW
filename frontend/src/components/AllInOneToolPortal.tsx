import { useState, useMemo } from 'react';
import { ViewMode, TelemetryMetric, PumpData } from '../types';
import { WaterRippleCanvas } from './WaterRippleCanvas';
import { 
  Activity, 
  Droplet, 
  Waves, 
  Gauge, 
  ShieldAlert, 
  TrendingUp, 
  BellRing, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Compass, 
  Cpu, 
  Radio, 
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  Layers,
  Zap,
  Info
} from 'lucide-react';

interface AllInOneToolPortalProps {
  onSelectView: (view: ViewMode) => void;
  metrics: TelemetryMetric[];
  pumps: PumpData[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function AllInOneToolPortal({
  onSelectView,
  metrics,
  pumps,
  darkMode,
  onToggleDarkMode
}: AllInOneToolPortalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Categories inspired by tool.allinonemmo.com directory navigation
  const categories = [
    { id: 'ALL', label: 'Tất cả công cụ', count: 7 },
    { id: 'SCADA', label: 'Vận hành & SCADA', count: 2 },
    { id: 'QUALITY', label: 'Chất lượng & Sông Tiền', count: 2 },
    { id: 'AI', label: 'Trí tuệ Nhân tạo AI', count: 2 },
    { id: 'REPORT', label: 'Nhật ký & Báo cáo', count: 1 }
  ];

  // Tool catalog
  const tools = useMemo(() => [
    {
      id: 'overview' as ViewMode,
      category: 'SCADA',
      title: 'Bảng Điều Khiển Tổng Quan SCADA',
      titleEn: 'SCADA Telemetry Overview Dashboard',
      desc: 'Giám sát tổng thể thời gian thực 6 chỉ số đo lường trọng yếu (EC, pH, độ đục, Clo dư, mực nước sông Tiền, lưu lượng) và trạng thái 5 tổ máy bơm cấp 1.',
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Công cụ Trung tâm',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      status: 'Trực tiếp 24/7',
      liveStat: `${metrics.find(m => m.id === 'flow_rate')?.value.toFixed(0) || '1785'} m³/h`,
      liveLabel: 'Lưu lượng cấp hiện tại',
      tags: ['SCADA', 'Telemetry', 'Tổng quan', 'Bơm']
    },
    {
      id: 'water_quality' as ViewMode,
      category: 'QUALITY',
      title: 'Bộ Phân Tích Chất Lượng Nước',
      titleEn: 'Water Quality Telemetry & QCVN',
      desc: 'Quan trắc thông số lý hóa tại hồ nước thô và bể chứa thành phẩm. Tự động kiểm tra chuẩn QCVN 01-1:2018/BYT, thống kê 6 chỉ số mô tả (Min, Max, Mean, Median, Std dev).',
      icon: Droplet,
      color: 'from-teal-500 to-emerald-600',
      badge: 'QCVN 01-1:2018',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      status: 'Đạt chuẩn BYT',
      liveStat: `${metrics.find(m => m.id === 'ph')?.value.toFixed(2) || '7.47'} pH`,
      liveLabel: 'pH bể chứa thành phẩm',
      tags: ['Chất lượng', 'pH', 'Độ đục', 'Clo dư']
    },
    {
      id: 'river_monitoring' as ViewMode,
      category: 'QUALITY',
      title: 'Giám Sát Sông Tiền & Chống Hạn Mặn',
      titleEn: 'Tien River Level & Salinity EC Radar',
      desc: 'Theo dõi đồng thời cao trình triều cường và độ mặn EC Sông Tiền qua biểu đồ trục kép. Phát hiện sớm xung đột biến mặn để chủ động đóng/mở van lấy nước thô.',
      icon: Waves,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Chống Xâm Nhập Mặn',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      status: 'Xung triều cường',
      liveStat: `${metrics.find(m => m.id === 'ec')?.value.toFixed(0) || '644'} µS/cm`,
      liveLabel: 'Độ dẫn điện EC Sông Tiền',
      tags: ['Sông Tiền', 'Độ mặn', 'EC', 'Mực nước']
    },
    {
      id: 'pump_monitoring' as ViewMode,
      category: 'SCADA',
      title: 'Giám Sát & Chẩn Đoán Trạm Bơm Cấp 1',
      titleEn: 'Pump Station & VFD Telemetry',
      desc: 'Chẩn đoán 5 tổ máy bơm cao áp tích hợp biến tần VFD ABB ACS880: Tần số (Hz), dòng điện (A), nhiệt độ cuộn dây (°C), công suất (kW), rung trục và hiệu suất cơ điện.',
      icon: Gauge,
      color: 'from-sky-500 to-cyan-600',
      badge: '5 Tổ Máy Bơm VFD',
      badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      status: '4/5 Tổ máy chạy',
      liveStat: `${pumps.reduce((acc, p) => acc + p.power, 0).toFixed(1)} kW`,
      liveLabel: 'Tổng công suất tiêu thụ',
      tags: ['Trạm bơm', 'Biến tần', 'VFD', 'Động cơ']
    },
    {
      id: 'anomaly_detection' as ViewMode,
      category: 'AI',
      title: 'AI Phát Hiện Bất Thường Dị Biệt',
      titleEn: 'AI Isolation Forest & Robust Z Engine',
      desc: 'Ứng dụng mô hình học máy Machine Learning (Isolation Forest và Robust Z-score) để quét tương quan đa biến, phát hiện cảm biến trôi dạt hoặc xung bất thường.',
      icon: ShieldAlert,
      color: 'from-amber-500 to-rose-600',
      badge: 'Thuật toán Machine Learning',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      status: '9 Dị biệt ghi nhận',
      liveStat: '9 Dị biệt',
      liveLabel: '1 Nghiêm trọng / 8 Cảnh báo',
      tags: ['AI', 'Học máy', 'Isolation Forest', 'Z-score']
    },
    {
      id: 'forecast' as ViewMode,
      category: 'AI',
      title: 'Công Cụ Dự Báo Thủy Văn & Điều Tiết',
      titleEn: 'Time-Series Forecast Benchmarking (+1h - +6h)',
      desc: 'So sánh và đối chuẩn sai số dự báo MAE, RMSE, MAPE, R² giữa các mô hình chuỗi thời gian (Moving Average, Random Forest, Persistence) hỗ trợ kíp trực ca.',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Mô hình Chuỗi thời gian',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      status: 'R² > 0.90 Đạt chuẩn',
      liveStat: 'R² = 0.9067',
      liveLabel: 'Mô hình Moving Average',
      tags: ['Dự báo', 'Thủy văn', 'MAE', 'Random Forest']
    },
    {
      id: 'alert_log' as ViewMode,
      category: 'REPORT',
      title: 'Nhật Ký Cảnh Báo & Xử Lý Sự Cố',
      titleEn: 'SCADA Alert Triage & CSV Audit Exporter',
      desc: 'Trung tâm tiếp nhận, xác nhận và giải quyết cảnh báo vận hành của trạm nước Đồng Tâm. Hỗ trợ tìm kiếm, lọc theo mức độ nguy hại và xuất báo cáo CSV.',
      icon: BellRing,
      color: 'from-rose-500 to-pink-600',
      badge: 'Triage & Audit Log',
      badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
      status: '5 Sự cố đang mở',
      liveStat: '5 Cảnh báo',
      liveLabel: 'Yêu cầu kíp trực xác nhận',
      tags: ['Cảnh báo', 'Nhật ký', 'Xuất CSV', 'Báo cáo']
    }
  ], [metrics, pumps]);

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    return tools.filter((t) => {
      const matchCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
      const matchSearch =
        searchTerm === '' ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [tools, selectedCategory, searchTerm]);

  return (
    <div className={`relative min-h-screen w-full select-none overflow-hidden transition-colors duration-300 ${
      darkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      {/* Interactive Water Ripple Canvas Background (Nền nước gợn sóng) */}
      <WaterRippleCanvas
        className="z-0"
        theme={darkMode ? 'dark' : 'light'}
      />

      {/* Gentle frosted glass scrim for comfortable reading while keeping ripple water visible */}
      <div className={`pointer-events-none absolute inset-0 z-0 backdrop-blur-[1.5px] transition-colors duration-300 ${
        darkMode ? 'bg-slate-950/40' : 'bg-white/40'
      }`} />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Header styled after modern Tool Hub portals like tool.allinonemmo.com */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/75 p-4 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-white shadow-lg overflow-hidden">
              <img src="/logo.png" alt="DTW Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  DTW TOOL HUB
                </span>
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  ALL-IN-ONE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hệ sinh thái công cụ số hóa, SCADA và AI Nhà máy Nước Đồng Tâm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hệ thống trực tuyến 24/7</span>
            </div>

            <button
              onClick={() => onSelectView('overview')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 dark:bg-cyan-600 dark:hover:bg-cyan-500"
            >
              <Activity className="h-4 w-4 text-cyan-400 dark:text-white" />
              <span>Bảng SCADA</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Hero Section with Search and Quick Category Chips */}
        <section className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/80 bg-cyan-50/80 px-4 py-1.5 text-xs font-semibold text-cyan-800 shadow-xs backdrop-blur-sm dark:border-cyan-800/80 dark:bg-cyan-950/50 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Tham khảo kiến trúc All-in-One MMO Tool • Nền gợn sóng nước tương tác</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            Cổng Công Cụ Vận Hành & Viễn Trắc <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 bg-clip-text text-transparent">
              Công Ty Cấp Nước Đồng Tâm (DTW)
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Nhấp chuột vào mặt nước để tạo <strong>hiệu ứng gợn sóng tương tác</strong>. Lựa chọn bất kỳ công cụ nào bên dưới để mở giao diện quản trị chuyên sâu hoặc xem xét dữ liệu vận hành.
          </p>

          {/* Central Live Search Box (Allinonemmo style) */}
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="relative flex items-center rounded-2xl border border-white/80 bg-white/90 p-2 shadow-lg backdrop-blur-md transition-all focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 dark:border-slate-800 dark:bg-slate-900/90">
              <Search className="ml-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm công cụ: pH, trạm bơm, độ mặn EC, dự báo, AI, sự cố..."
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mr-2 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                >
                  Xóa
                </button>
              )}
            </div>

            {/* Quick Keyword Suggestions */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400">Gợi ý tìm nhanh:</span>
              {['Trạm Bơm VFD', 'Sông Tiền', 'Độ dẫn điện EC', 'AI Machine Learning', 'Xuất CSV'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="rounded-full border border-slate-200/80 bg-white/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills (inspired by tool.allinonemmo.com) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md dark:bg-cyan-600 dark:text-white'
                      : 'border border-white/80 bg-white/70 text-slate-600 hover:bg-white dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tools Bento Grid (7 Dedicated Tool Cards) */}
        <section className="mb-14">
          <div className="mb-4 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Danh sách công cụ ({filteredTools.length} sẵn sàng)</span>
            <span>Nhấp "Mở công cụ" để chuyển trực tiếp vào chức năng</span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/85 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:bg-white/95 hover:shadow-xl hover:shadow-cyan-500/10 dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-cyan-500 dark:hover:bg-slate-900/95"
                >
                  {/* Decorative Gradient Top Line */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.color}`} />

                  <div>
                    {/* Header Row: Icon + Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${tool.color} text-white shadow-md shadow-cyan-500/20`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${tool.badgeColor}`}>
                          {tool.badge}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {tool.status}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors dark:text-white dark:group-hover:text-cyan-400">
                      {tool.title}
                    </h3>
                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {tool.titleEn}
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {tool.desc}
                    </p>
                  </div>

                  {/* Bottom Stats Preview & Action Button */}
                  <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{tool.liveLabel}</span>
                        <strong className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono">
                          {tool.liveStat}
                        </strong>
                      </div>

                      <button
                        onClick={() => onSelectView(tool.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 group-hover:bg-cyan-600 hover:shadow-md active:scale-95 dark:bg-slate-800 dark:group-hover:bg-cyan-600"
                      >
                        <span>Mở công cụ</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Plant Overview & Real-Time Specifications */}
        <section className="mb-10 rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/70">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            <div>
              <span className="text-xs text-slate-400">Công suất thiết kế</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                150.000
              </div>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">m³/ngày đêm</span>
            </div>

            <div>
              <span className="text-xs text-slate-400">Chỉ tiêu quy chuẩn</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                QCVN 01-1
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Đạt kiểm nghiệm</span>
            </div>

            <div>
              <span className="text-xs text-slate-400">Độ dẫn điện EC Sông Tiền</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                644.40
              </div>
              <span className="text-[11px] text-amber-500 font-semibold">µS/cm (Đang giám sát)</span>
            </div>

            <div>
              <span className="text-xs text-slate-400">Số trạm bơm tự động</span>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                5 Tổ Máy
              </div>
              <span className="text-[11px] text-blue-500 font-semibold">Biến tần VFD ABB ACS880</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="rounded-2xl border border-white/60 bg-white/60 p-4 text-center text-xs text-slate-500 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Công ty Cấp nước Đồng Tâm (DTW)</span> — Nền tảng viễn trắc thông minh & AI
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectView('overview')}
                className="font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
              >
                Vào Dashboard SCADA
              </button>
              <span>•</span>
              <button
                onClick={onToggleDarkMode}
                className="font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
              >
                {darkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
