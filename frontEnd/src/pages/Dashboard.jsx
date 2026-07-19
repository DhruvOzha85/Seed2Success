import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  Sprout, Activity, Wheat, BadgeIndianRupee, Brain, Landmark, 
  Menu, X, LogOut, User as UserIcon, Info, Phone, ChevronRight
} from "lucide-react";
import PhaseNavigation from "../components/PhaseNavigation";
import LanguageSelector from "../components/LanguageSelector";

const DASHBOARD_CARDS = [
  { path: "/planning", title: "Crop Planning", desc: "AI crop recommendations based on soil & weather.", icon: Sprout, color: "from-green-500 to-green-600" },
  { path: "/health", title: "Crop Health", desc: "Detect diseases and get instant treatment plans.", icon: Activity, color: "from-emerald-500 to-emerald-600" },
  { path: "/harvesting", title: "Harvesting", desc: "Predict optimal harvest readiness and labour.", icon: Wheat, color: "from-amber-500 to-amber-600" },
  { path: "/selling", title: "Selling", desc: "Market insights, pricing, and buyer connections.", icon: BadgeIndianRupee, color: "from-blue-500 to-blue-600" },

  { path: "/schemes", title: "Govt Schemes", desc: "Discover subsidies and agricultural schemes.", icon: Landmark, color: "from-indigo-500 to-indigo-600" },
];

const SECONDARY_LINKS = [
  { path: "/profile", title: "My Profile", icon: UserIcon },
  { path: "/about", title: "About Us", icon: Info },
  { path: "/contact", title: "Contact Us", icon: Phone },
];

function Dashboard({ user, onLogout, sidebarOpen, onToggleSidebar }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggleSidebar} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-[300px]
        bg-brand-950 text-white flex flex-col
        border-r border-brand-900/50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        sidebar-scroll overflow-y-auto
      `}>
        <div className="p-6 pb-4 flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 overflow-hidden">
                <Sprout size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">{t("common.appName")}</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">Dashboard</p>
              </div>
            </div>
            <button onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>

          <PhaseNavigation className="mb-5" />
          
          <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-2">Welcome Back</h4>
            <p className="text-[12px] text-brand-200 leading-relaxed font-medium">
              Access all crop intelligence tools directly from this hub.
            </p>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-brand-900/40">
          <LanguageSelector />
          {user && (
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="min-w-0 flex items-center gap-2">
                {user.profilePicture && (
                  <img src={user.profilePicture} alt="User" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-brand-500/30" />
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-brand-200 truncate">{user.name}</p>
                  <p className="text-[11px] text-brand-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title={t("common.signOut")}
                className="p-2 rounded-lg hover:bg-red-500/15 text-brand-500 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
          <div className="text-center">
            <p className="text-[11px] text-brand-500 font-medium">{t("common.builtFor")}</p>
            <p className="text-[10px] text-brand-700 mt-0.5">{t("common.poweredBy")}</p>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-w-0 flex flex-col items-center">
        {/* Top Bar */}
        <div className="w-full sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <h2 className="text-lg font-display font-bold text-gray-800">Hello, {user?.name?.split(" ")[0]} 👋</h2>
                <p className="text-[12px] text-gray-500">
                  {user?.district ? `${user.district}, ${user.state}` : "Welcome to Seed2Success"}
                </p>
              </div>
              <Link to="/profile" title="My Profile" className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shadow-sm">
                    <UserIcon size={18} />
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
          
          <div className="mb-8">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Crop Intelligence Suite</h3>
            <p className="text-sm text-gray-500">Select a tool below to analyze your farm's data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {DASHBOARD_CARDS.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link key={idx} to={card.path} className="group block bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-brand-500/5 hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-2xl mb-5 flex items-center justify-center bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                    <Icon size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">{card.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {card.desc}
                  </p>
                  <div className="flex items-center text-sm font-medium text-brand-600 gap-1 opacity-80 group-hover:opacity-100">
                    Launch Tool <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">Quick Links</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SECONDARY_LINKS.map((link, idx) => {
              const Icon = link.icon;
              return (
                <Link key={idx} to={link.path} className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:text-brand-600 group-hover:bg-brand-100 transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="font-medium text-gray-700 group-hover:text-gray-900">{link.title}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
