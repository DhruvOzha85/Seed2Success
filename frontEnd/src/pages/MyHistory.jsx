import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { History, X, Menu, LogOut } from "lucide-react";
import PhaseNavigation from "../components/PhaseNavigation";
import LanguageSelector from "../components/LanguageSelector";

const BASE_URL = import.meta.env.VITE_API_URL || "";

function MyHistory({ user, onLogout, sidebarOpen, onToggleSidebar }) {
  const { t } = useTranslation();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await axios.get(`${BASE_URL}/api/history`);
        setHistoryItems(Array.isArray(response.data) ? response.data : (response.data.data || []));
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_38%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      {sidebarOpen ? <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onToggleSidebar} /> : null}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-[300px]
          bg-brand-950 text-white flex flex-col
          border-r border-brand-900/50
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          sidebar-scroll overflow-y-auto
        `}
      >
        <div className="p-6 pb-4 flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <History size={20} />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">My History</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">Past Records</p>
              </div>
            </div>
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>
          <PhaseNavigation className="mb-5" />
          
          <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-2">My History</h4>
            <p className="text-[12px] text-brand-200 leading-relaxed font-medium">
              Review all your past AI predictions and analysis.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-brand-900/40">
          <LanguageSelector />
          {user && (
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-brand-200 truncate">{user.name}</p>
                <p className="text-[11px] text-brand-500 truncate">{user.email}</p>
              </div>
              <button onClick={onLogout} title={t("common.signOut")} className="p-2 rounded-lg hover:bg-red-500/15 text-brand-500 hover:text-red-400 transition-colors flex-shrink-0">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col items-center">
        <div className="w-full sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onToggleSidebar} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-800">My History</h2>
                <p className="text-[12px] text-gray-500">View your past AI analyses and predictions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {error && (
            <div className="mb-6 animate-slide-up bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700 text-sm flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading history...</div>
          ) : historyItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
              <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No history found</h3>
              <p className="mt-2 text-sm text-gray-500">Run some AI predictions to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyItems.map((item, idx) => (
                <div key={item._id || idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3 transition hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 uppercase tracking-wide">
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {item.type === 'prediction' && item.result && (
                    <div className="mt-2">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        Predicted Yield: {item.result.yieldPrediction || item.result.prediction?.predicted_yield_kg_per_ha} kg/ha
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Crop: <span className="font-medium text-brand-600">{item.input?.crop_type || item.result.prediction || 'Unknown'}</span> | 
                        Confidence: {Math.round((item.result.confidence || 0) * 100)}%
                      </p>
                      
                      {item.result.llmExplanation && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Insights</h5>
                          <div className="text-sm text-gray-700 space-y-2 whitespace-pre-wrap">
                            {item.result.llmExplanation.substring(0, 300)}...
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {item.type === 'planning' && item.result && (
                    <div className="mt-2">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {item.input?.district}, {item.input?.state}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Top Recommendation: <span className="font-medium text-brand-600">{item.result.top_crops?.[0]?.crop || 'N/A'}</span>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
                          {item.result.top_crops?.[0]?.suitability_score || 0}/100
                        </span>
                      </p>
                      {item.result.top_crops && item.result.top_crops.length > 1 && (
                        <div className="text-xs text-gray-500">
                          Also considered: {item.result.top_crops.slice(1, 3).map(c => c.crop).join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {item.type !== 'prediction' && item.type !== 'planning' && (
                    <div className="mt-2 text-sm text-gray-600">
                      <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">
                        {JSON.stringify(item.input, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MyHistory;
