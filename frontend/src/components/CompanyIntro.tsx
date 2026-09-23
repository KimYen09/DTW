import { WaterRippleCanvas } from './WaterRippleCanvas';
import { ViewMode } from '../types';
import { 
  Activity, 
  Droplet, 
  Waves, 
  Gauge, 
  ShieldAlert, 
  TrendingUp, 
  BellRing, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight,
  Zap,
  Building2,
  Clock,
  Compass,
  Cpu,
  Sun,
  Moon,
  Smartphone
} from 'lucide-react';

interface CompanyIntroProps {
  onSelectView: (view: ViewMode) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function CompanyIntro({ onSelectView, darkMode, onToggleDarkMode }: CompanyIntroProps) {
  const functionModules = [
    {
      id: 'overview' as ViewMode,
      title: 'Bảng Điều Khiển Tổng Quan',
      titleEn: 'SCADA Telemetry Overview',
      desc: 'Bản đồ tổng thể các chỉ số đo lường trọng yếu (EC, pH, độ đục, Clo dư, mực nước sông Tiền, lưu lượng) và trạng thái 5 tổ máy bơm cấp 1.',
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      tag: 'Phân hệ Trung tâm',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800'
    },
    {
      id: 'water_quality' as ViewMode,
      title: 'Giám Sát Chất Lượng Nước',
      titleEn: 'Water Quality Telemetry',
      desc: 'Theo dõi chi tiết pH, độ đục, Clo khử trùng, độ dẫn điện tại hồ nước thô và bể chứa thành phẩm theo chuẩn QCVN 01-1:2018/BYT.',
      icon: Droplet,
      color: 'from-teal-500 to-emerald-600',
      tag: 'Chuẩn QCVN',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800'
    },
    {
      id: 'river_monitoring' as ViewMode,
      title: 'Quan Trắc Sông Tiền & Mặn',
      titleEn: 'River Level & Salinity EC',
      desc: 'Đo lường cao trình mực nước triều cường và độ mặn EC Sông Tiền. Phát hiện xung đột biến mặn để chủ động đóng/mở van cửa nhận nước.',
      icon: Waves,
      color: 'from-blue-500 to-indigo-600',
      tag: 'Phòng chống Xâm nhập mặn',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800'
    },
    {
      id: 'pump_monitoring' as ViewMode,
      title: 'Giám Sát Trạm Bơm Cấp 1',
      titleEn: 'Pump Station Telemetry & VFD',
      desc: 'Giám sát chi tiết 5 tổ máy bơm cao áp: Tần số biến tần VFD ABB ACS880, dòng điện, nhiệt độ cuộn dây, rung trục và áp lực ống góp.',
      icon: Gauge,
      color: 'from-sky-500 to-cyan-600',
      tag: '5 Tổ máy Bơm',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800'
    },
    {
      id: 'anomaly_detection' as ViewMode,
      title: 'AI Phát Hiện Bất Thường',
      titleEn: 'Machine Learning Anomaly Detection',
      desc: 'Ứng dụng thuật toán Isolation Forest và Robust Z-score để rà soát sai lệch đa biến của cảm biến, chống báo động giả và phát hiện trôi số đo.',
      icon: ShieldAlert,
      color: 'from-amber-500 to-rose-600',
      tag: 'AI / Machine Learning',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800'
    },
    {
      id: 'forecast' as ViewMode,
      title: 'Mô Hình Dự Báo Vận Hành',
      titleEn: 'Operational Forecasting (1h - 6h)',
      desc: 'Đánh giá độ chính xác MAE, RMSE, MAPE và R² của các mô hình dự báo chuỗi thời gian (Moving Average, Random Forest, Persistence).',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-600',
      tag: 'Dự báo Thủy văn',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800'
    },
    {
      id: 'alert_log' as ViewMode,
      title: 'Nhật Ký Cảnh Báo & Xử Lý',
      titleEn: 'SCADA Alert Triage & Audit Log',
      desc: 'Lưu trữ toàn bộ nhật ký cảnh báo thời gian thực, phân cấp mức độ nguy cơ, xác nhận của kíp trực vận hành và xuất báo cáo CSV.',
      icon: BellRing,
      color: 'from-rose-500 to-pink-600',
      tag: '5 Cảnh báo Mở',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800'
    }
  ];

  const highlights = [
    {
      value: '150.000 m³/ngày',
      label: 'Công suất cấp nước ổn định',
      sub: 'Phục vụ cư dân & KCN trọng điểm'
    },
    {
      value: 'QCVN 01-1:2018',
      label: 'Quy chuẩn nước sinh hoạt',
      sub: 'Kiểm soát 24/7 chỉ tiêu lý hóa'
    },
    {
      value: '100% SCADA 4.0',
      label: 'Tự động hóa viễn trắc',
      sub: 'Cập nhật trực tiếp mỗi giây'
    },
    {
      value: 'AI ML Giám sát mặn',
      label: 'Dự báo xâm nhập mặn Sông Tiền',
      sub: 'Bảo vệ nguồn nước ngọt Đồng bằng'
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-slate-800 dark:text-slate-200">
      {/* Water Ripple Animated Background Canvas (Nền nước gợn sóng) */}
      <WaterRippleCanvas className="z-0" theme={darkMode ? "dark" : "light"} />

      {/* Gentle frosted overlay for perfect legibility */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-[1.5px]" />

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Bar */}
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-white shadow-md overflow-hidden">
              <img src="/logo.png" alt="DTW Logo" className="h-full w-full object-contain p-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                  CÔNG TY CỔ PHẦN NHÀ MÁY NƯỚC ĐỒNG TÂM
                </span>
                <span className="hidden rounded-full bg-cyan-100/90 dark:bg-cyan-900/50 px-2 py-0.5 text-xs font-semibold text-cyan-800 dark:text-cyan-300 sm:inline-flex">
                  DONG TAM WATER CORP
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SCADA Telemetry & Nền tảng Giám sát Thông minh Lưu vực Sông Tiền
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onSelectView('overview')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-cyan-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-slate-800 dark:hover:bg-cyan-500 hover:shadow-lg active:scale-95"
            >
              <Activity className="h-4 w-4 text-cyan-400" />
              <span>Vào Dashboard SCADA</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-14 text-center lg:py-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 dark:border-teal-800/50 bg-teal-50/80 dark:bg-teal-900/30 px-4 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>Hệ thống Giám sát & Quản trị Nguồn nước Thông minh 4.0</span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl leading-tight">
            Đồng tâm - Hợp lực - Toả sáng, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-700 dark:from-cyan-400 dark:via-teal-400 dark:to-blue-500 bg-clip-text text-transparent">
              chúng ta cùng hành động vì một DTW phát triển & yêu thương
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            Công ty Cổ phần Nhà máy Nước Đồng Tâm quản lý và vận hành trạm cấp nước chiến lược, 
            khai thác nguồn nước mặt Sông Tiền với quy trình xử lý hiện đại, đạt quy chuẩn 
            <strong className="font-semibold text-slate-800 dark:text-slate-200"> QCVN 01-1:2018/BYT</strong>. 
            Hệ thống tích hợp giám sát tự động SCADA, AI phát hiện dị biệt và dự báo xâm nhập mặn 24/7.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => onSelectView('overview')}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/40 active:scale-95"
            >
              <Activity className="h-4 w-4" />
              <span>Khám Phá Tổng Quan SCADA</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#functions-section"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white active:scale-95"
            >
              <Compass className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Xem Từng Phân Hệ Chức Năng</span>
            </a>
            <button
              onClick={() => onSelectView('mobile_dashboard')}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-teal-500 dark:border-teal-600 bg-teal-50/50 dark:bg-teal-900/30 px-5 py-3 text-sm font-bold text-teal-700 dark:text-teal-400 shadow-sm transition-all duration-200 hover:bg-teal-100/50 dark:hover:bg-teal-800/50 active:scale-95"
            >
              <Smartphone className="h-4 w-4" />
              <span>Trải nghiệm Giao diện Điện thoại</span>
            </button>
          </div>

          {/* Key Plant Metrics Ribbon */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-4 text-left shadow-sm backdrop-blur-md transition-all hover:bg-white/90 dark:hover:bg-slate-900/90 hover:shadow-md"
              >
                <div className="text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  {item.value}
                </div>
                <div className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-300 sm:text-sm">
                  {item.label}
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Function Modules & Dashboards Section */}
        <section id="functions-section" className="mb-14 scroll-mt-24">
          <div className="mb-6 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  Truy Cập Từng Chức Năng & Dashboard Riêng Biệt
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Nhấp vào từng chức năng bên dưới để trực tiếp chuyển vào giao diện chuyên sâu tương ứng
              </p>
            </div>
            <span className="rounded-full bg-cyan-50 dark:bg-cyan-900/30 px-3 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              7 Phân hệ nghiệp vụ sẵn sàng
            </span>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {functionModules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-900/75 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-white/95 dark:hover:bg-slate-900/95 hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  {/* Decorative top border accent */}
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mod.color}`} />

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${mod.color} text-white shadow-md`}>
                        <IconComp className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${mod.badgeColor}`}>
                        {mod.tag}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                      {mod.title}
                    </h3>
                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {mod.titleEn}
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                      Mở giao diện phân hệ
                    </span>
                    <button
                      onClick={() => onSelectView(mod.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 group-hover:bg-cyan-600 dark:group-hover:bg-cyan-500 active:scale-95"
                    >
                      <span>Truy cập</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* DTW Technological Excellence & Sustainability Pillars */}
        <section className="mb-12 rounded-3xl border border-white/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 p-6 shadow-sm backdrop-blur-md sm:p-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Quy Trình Công Nghệ Xử Lý & Năng Lực Vận Hành DTW
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Đồng Tâm Water kết hợp công nghệ cơ học, hóa lý và số hóa SCADA hiện đại
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 font-bold">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Cửa Nhận Nước Sông Tiền & Bể Lắng Lamen
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Thu nước thô từ Sông Tiền qua hệ thống chắn rác tinh, lắng cặn sơ bộ bằng tấm lamen nghiêng tăng tốc độ lắng cặn lơ lửng.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 font-bold">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Cụm Lọc Nhanh Cát Thạch Anh & Than Hoạt Tính
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Lọc sạch độ đục dưới 2.0 NTU, khử màu và mùi tự nhiên, chuẩn bị cho khâu khử trùng đảm bảo an toàn tuyệt đối.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Khử Trùng Tự Động & Trạm Bơm Cao Áp VFD
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Điều tiết châm Clo dư tối ưu 0.8 - 1.2 mg/L, bơm cấp 1 với 5 tổ máy biến tần ABB tự động ổn định áp lực mạng lưới đường ống.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="rounded-2xl border border-white/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 p-6 text-center text-xs text-slate-500 dark:text-slate-400 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-left">
              <span className="font-bold text-slate-700 dark:text-slate-300">Công ty Cổ phần Nhà máy Nước Đồng Tâm (Dong Tam Water Corp)</span>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                Trụ sở: Ấp Tân Thuận, Xã Bình Đức, Huyện Châu Thành, Tỉnh Tiền Giang | MST: 1200648505
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button 
                onClick={() => onSelectView('overview')}
                className="font-semibold text-cyan-700 dark:text-cyan-400 hover:underline"
              >
                Vào Bảng điều khiển
              </button>
              <span>•</span>
              <button 
                onClick={() => onSelectView('alert_log')}
                className="font-semibold text-cyan-700 dark:text-cyan-400 hover:underline"
              >
                Nhật ký sự cố
              </button>
              <span>•</span>
              <span className="text-slate-400 dark:text-slate-500">Phiên bản SCADA v2.4</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
