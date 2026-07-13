import { useState } from "react";
import {
  Thermometer, CloudRain, Droplets, TrendingUp, ShieldCheck, Sprout, Leaf, Timer,
  IndianRupee, BarChart3, ChevronDown, ChevronUp, Zap, DollarSign, Droplet, ShieldAlert,
} from "lucide-react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(value || 0);
}

/* ===== WEATHER SUMMARY CARD ===== */
function WeatherCard({ weather }) {
  if (!weather) return null;
  const metrics = [
    { icon: <Thermometer size={20} />, value: `${weather.temperature}°C`, label: "Temperature", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: <CloudRain size={20} />, value: `${weather.precipitation} mm`, label: "Rainfall (24h)", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: <Droplets size={20} />, value: `${weather.humidity}%`, label: "Humidity", color: "text-cyan-500", bg: "bg-cyan-50" },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/50 rounded-2xl border border-blue-100/60 p-5 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <CloudRain size={16} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-gray-900">Live Weather Data</h3>
            <p className="text-[11px] text-gray-400">From Open-Meteo API</p>
          </div>
        </div>
        <span className="text-[11px] bg-blue-100 text-blue-600 font-medium px-3 py-1 rounded-full">
          📍 {weather.location?.district}, {weather.location?.state}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-full ${m.bg} flex items-center justify-center ${m.color} mx-auto mb-2.5`}>
              {m.icon}
            </div>
            <p className="font-display font-bold text-xl text-gray-900">{m.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== SCORE BREAKDOWN BAR CHART ===== */
function ScoreBreakdown({ details, isOpen }) {
  if (!details || !isOpen) return null;

  const factors = [
    { label: "Weather Fit", value: details.weather_score, weight: "30%", color: "from-emerald-400 to-emerald-500" },
    { label: "Budget Match", value: details.budget_score, weight: "20%", color: "from-amber-400 to-amber-500" },
    { label: "Labour Match", value: details.labour_score, weight: "15%", color: "from-violet-400 to-violet-500" },
    { label: "Water Match", value: details.water_score, weight: "15%", color: "from-blue-400 to-blue-500" },
    { label: "Crop Rotation", value: details.rotation_score, weight: "10%", color: "from-pink-400 to-pink-500" },
    { label: "Profitability", value: details.profitability_score, weight: "10%", color: "from-purple-400 to-purple-500" },
  ];

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fade-in">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
        <BarChart3 size={12} /> Score Breakdown
      </p>
      {factors.map((f) => (
        <div key={f.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] text-gray-500">{f.label} <span className="text-gray-300">({f.weight})</span></span>
            <span className="text-[12px] font-semibold text-gray-700">{f.value}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${f.color} score-bar-animated`} style={{ width: `${f.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== SINGLE CROP CARD ===== */
function CropCard({ crop, rank }) {
  const [expanded, setExpanded] = useState(rank === 1);

  const riskColors = {
    Low: "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    High: "bg-red-50 text-red-700 border-red-200",
  };
  const riskClass = riskColors[crop.risk_level] || riskColors.Medium;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  const ringColor = rank === 1 ? "ring-brand-400/30" : "ring-transparent";

  // Score color based on value
  const scoreColor = crop.suitability_score >= 75
    ? "text-brand-600"
    : crop.suitability_score >= 50
      ? "text-amber-600"
      : "text-red-500";

  return (
    <article
      id={`crop-card-${rank}`}
      className={`
        bg-white rounded-2xl border border-gray-200/70 shadow-sm
        hover:shadow-lg hover:border-brand-200
        ring-2 ${ringColor}
        transition-all duration-300 animate-slide-up overflow-hidden
      `}
      style={{ animationDelay: `${rank * 100}ms` }}
    >
      {/* Rank 1 top accent */}
      {rank === 1 && (
        <div className="h-1 w-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600" />
      )}

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl leading-none mt-0.5">{medal}</span>
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-gray-900">{crop.crop}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[12px] text-gray-400">
                  <Timer size={12} /> {crop.crop_info?.season} · {crop.crop_info?.growing_days} days
                </span>
              </div>
            </div>
          </div>
          <div className="text-center flex-shrink-0">
            {/* Circular score display */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none"
                  stroke={crop.suitability_score >= 75 ? "#22c55e" : crop.suitability_score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(crop.suitability_score / 100) * 175.93} 175.93`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display font-bold text-lg leading-none ${scoreColor}`}>{crop.suitability_score}</span>
                <span className="text-[9px] text-gray-400">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {[
            { icon: <IndianRupee size={14} />, label: "Est. Cost", value: crop.estimated_cost, color: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: <TrendingUp size={14} />, label: "Exp. Yield", value: crop.expected_yield, color: "text-blue-600", bg: "bg-blue-50" },
            { icon: <ShieldCheck size={14} />, label: "Risk", value: crop.risk_level, color: "", bg: "", isRisk: true },
            { icon: <BarChart3 size={14} />, label: "Market Price", value: `${formatCurrency(crop.crop_info?.market_price)}/t`, color: "text-purple-600", bg: "bg-purple-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-100 rounded-xl border border-gray-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`${stat.color || "text-gray-400"}`}>{stat.icon}</span>
                <span className="text-[10px] uppercase tracking-wider font-medium text-gray-400">{stat.label}</span>
              </div>
              {stat.isRisk ? (
                <span className={`inline-block text-[12px] font-semibold px-2 py-0.5 rounded-full border ${riskClass}`}>
                  {stat.value}
                </span>
              ) : (
                <p className="text-[13px] font-semibold text-gray-800 truncate">{stat.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Info Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {[
            { icon: <Thermometer size={11} />, text: crop.crop_info?.ideal_temp },
            { icon: <CloudRain size={11} />, text: crop.crop_info?.rainfall_range },
            { icon: <Droplets size={11} />, text: `Water: ${crop.crop_info?.water_requirement}` },
            { icon: <Sprout size={11} />, text: `Labour: ${crop.crop_info?.labour_need}` },
          ].map((pill, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
              {pill.icon} {pill.text}
            </span>
          ))}
        </div>

        {/* Expand / Collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 text-[12px] font-medium text-brand-600 hover:text-brand-700 py-2 rounded-xl hover:bg-brand-50/50 transition-colors"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Hide Score Details" : "Show Score Breakdown"}
        </button>

        <ScoreBreakdown details={crop.details} isOpen={expanded} />
      </div>
    </article>
  );
}

/* ===== QUICK FILTERS ===== */
function QuickFilters({ activeFilter, onFilterChange }) {
  const filters = [
    { key: "profit", label: "High Profit", icon: <DollarSign size={13} /> },
    { key: "water", label: "Low Water", icon: <Droplet size={13} /> },
    { key: "risk", label: "Low Risk", icon: <ShieldAlert size={13} /> },
    { key: "cheap", label: "Cheaper Options", icon: <IndianRupee size={13} /> },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const active = activeFilter === f.key;
        return (
          <button
            key={f.key}
            onClick={() => onFilterChange(active ? null : f.key)}
            className={`
              inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium
              border transition-all duration-200
              ${active
                ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20 filter-active"
                : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/50"
              }
            `}
          >
            {f.icon} {f.label}
          </button>
        );
      })}
    </div>
  );
}

/* ===== APPLY FILTER LOGIC ===== */
function applyFilter(crops, filter) {
  if (!filter || !crops) return crops;
  const sorted = [...crops];

  switch (filter) {
    case "profit": {
      // Sort by market_price * yield descending
      sorted.sort((a, b) => {
        const revA = (a.crop_info?.market_price || 0) * (a.crop_info?.yield_per_acre || 0);
        const revB = (b.crop_info?.market_price || 0) * (b.crop_info?.yield_per_acre || 0);
        return (b.details?.profitability_score || 0) - (a.details?.profitability_score || 0);
      });
      return sorted;
    }
    case "water":
      sorted.sort((a, b) => {
        const map = { low: 0, medium: 1, high: 2 };
        return (map[a.crop_info?.water_requirement] || 1) - (map[b.crop_info?.water_requirement] || 1);
      });
      return sorted;
    case "risk":
      sorted.sort((a, b) => {
        const map = { Low: 0, Medium: 1, High: 2 };
        return (map[a.risk_level] || 1) - (map[b.risk_level] || 1);
      });
      return sorted;
    case "cheap":
      sorted.sort((a, b) => (a.crop_info?.cost_per_acre || 0) - (b.crop_info?.cost_per_acre || 0));
      return sorted;
    default:
      return sorted;
  }
}

/* ===== MAIN COMPONENT ===== */
function RecommendationCards({ result, activeFilter, onFilterChange }) {
  if (!result) {
    return (
      <section id="results-placeholder" className="bg-white rounded-2xl border border-gray-200/70 shadow-sm p-10 sm:p-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
          <Leaf size={28} className="text-brand-400" />
        </div>
        <h2 className="font-display font-bold text-xl text-gray-800 mb-2">Your recommendations will appear here</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          Fill in your farm details above and click <strong className="text-brand-600">"Generate Crop Recommendations"</strong> to
          get AI-powered crop suggestions based on live weather, budget analysis, and market trends.
        </p>
      </section>
    );
  }

  const { top_crops, weather_data, farmer_profile } = result;
  const filteredCrops = applyFilter(top_crops, activeFilter);

  return (
    <section id="results-section" className="space-y-5 animate-fade-in">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-2">
            <Zap size={11} className="inline -mt-0.5 mr-1" />
            AI Recommendation
          </span>
          <h2 className="font-display font-bold text-2xl text-gray-900">Top 3 Crops for Your Farm</h2>
          <p className="text-sm text-gray-400 mt-1">
            Based on live weather in <strong className="text-gray-600">{farmer_profile?.district}, {farmer_profile?.state}</strong> · 
            ₹{Number(farmer_profile?.budget || 0).toLocaleString("en-IN")} budget · {farmer_profile?.land_area} acres
          </p>
        </div>
        <QuickFilters activeFilter={activeFilter} onFilterChange={onFilterChange} />
      </div>

      {/* Weather Card */}
      <WeatherCard weather={weather_data} />

      {/* Crop Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {filteredCrops?.map((crop, index) => (
          <CropCard key={crop.crop} crop={crop} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

export default RecommendationCards;
