import {
  Sprout, Bot, LoaderCircle, Menu, X, Clock, ChevronRight, Zap, CloudSun, BarChart3, RefreshCw, Shield, LogOut
} from "lucide-react";
import { useTranslation } from "react-i18next";
import RecommendationCards from "../components/RecommendationCards";
import PhaseNavigation from "../components/PhaseNavigation";
import { useEffect, useRef } from "react";
import LanguageSelector from "../components/LanguageSelector";

function ChatInterface({
  
  formState, districts, onFieldChange, onSubmit, loading, errorMessage, result,
  sessions, onSelectSession, activeFilter, onFilterChange, sidebarOpen, onToggleSidebar,
  user, onLogout,
}) {
  const { t } = useTranslation();

  const hasAutoFetched = useRef(false);

  // Auto-fetch recommendations on mount if we haven't already
  useEffect(() => {
    if (!result && !loading && !errorMessage && onSubmit && !hasAutoFetched.current) {
      hasAutoFetched.current = true;
      onSubmit();
    }
  }, [result, loading, errorMessage, onSubmit]);

  return (
    <div className="flex min-h-screen">
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
        {/* Sidebar Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Sprout size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">{t("common.appName")}</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">{t("common.tagline")}</p>
              </div>
            </div>
            <button onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>

          <PhaseNavigation   className="mb-5" />

          {/* Features mini cards */}
          <div className="space-y-1">
            {[
              { icon: <CloudSun size={15} />, label: t("planning.sidebar.liveWeather"), desc: t("planning.sidebar.liveWeatherDesc") },
              { icon: <Zap size={15} />, label: t("planning.sidebar.smartScoring"), desc: t("planning.sidebar.smartScoringDesc") },
              { icon: <BarChart3 size={15} />, label: t("planning.sidebar.cropsDb"), desc: t("planning.sidebar.cropsDbDesc") },
              { icon: <RefreshCw size={15} />, label: t("planning.sidebar.rotation"), desc: t("planning.sidebar.rotationDesc") },
              { icon: <Shield size={15} />, label: t("planning.sidebar.risk"), desc: t("planning.sidebar.riskDesc") },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-brand-400 group-hover:text-brand-300 transition-colors">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-brand-100 leading-tight">{item.label}</p>
                  <p className="text-[11px] text-brand-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>



        {/* Sidebar Footer */}
        <div className="p-4 border-t border-brand-900/40">
          <LanguageSelector />
          {user && (
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-brand-200 truncate">{user.name}</p>
                <p className="text-[11px] text-brand-500 truncate">{user.email}</p>
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
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="w-full sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 py-3">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <h2 className="font-display font-bold text-gray-900 text-[15px] leading-tight">{t("planning.title")}</h2>
                  <p className="text-[12px] text-gray-400">{t("planning.subtitle")}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              id="btn-recommend"
              onClick={onSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full
                bg-gradient-to-r from-brand-600 to-brand-500
                text-white font-semibold text-[13px]
                shadow-lg shadow-brand-500/25
                hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5
                disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0
                transition-all duration-200"
            >
              {loading ? <LoaderCircle size={16} className="spinner" /> : <Bot size={16} />}
              <span className="hidden sm:inline">{loading ? t("planning.analyzingBtn") : "Refresh Predictions"}</span>
              <span className="sm:hidden">{loading ? "..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Loading Overlay */}
          {loading && (
            <div className="animate-fade-in bg-gradient-to-br from-brand-50 to-white border border-brand-200 rounded-2xl p-8 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="loader-dot w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                <div className="loader-dot w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                <div className="loader-dot w-2.5 h-2.5 rounded-full bg-brand-500"></div>
              </div>
              <p className="font-display font-semibold text-brand-800 text-lg">{t("planning.loadingTitle")}</p>
              <p className="text-sm text-brand-600/80 mt-2">{t("planning.loadingDesc")}</p>
            </div>
          )}



          {/* Error */}
          {errorMessage && (
            <div id="error-message" className="animate-slide-up bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700 text-sm flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {/* Results */}
          {!loading && (
            <RecommendationCards
              result={result}
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default ChatInterface;
