import { useTranslation } from "react-i18next";
import { Info, Menu, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function AboutUs({ sidebarOpen, onToggleSidebar }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggleSidebar} />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 min-w-0 flex flex-col items-center">
        {/* Top Bar */}
        <div className="w-full sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h2 className="text-lg font-display font-bold text-gray-800">About Us</h2>
              <p className="text-[12px] text-gray-500">Learn more about Seed2Success</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl mx-auto flex items-center justify-center text-brand-600 mb-6">
            <Info size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">Empowering Indian Farmers</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Seed2Success is a next-generation AI-powered platform designed to provide Indian farmers with precise, data-driven crop recommendations, health monitoring, and market insights.
          </p>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              We aim to reduce the risks associated with farming by providing predictive intelligence. By analyzing soil, weather, and market trends, we help farmers make informed decisions that increase yield and profitability while reducing input costs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AboutUs;
