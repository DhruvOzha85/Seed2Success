import { MapPin, Landmark, Tractor, IndianRupee, Users, Wheat } from "lucide-react";
import { useTranslation } from "react-i18next";
import { previousCropOptions } from "../data/options";
import GoogleMapLocationPicker from "./GoogleMapLocationPicker";

function InputBox({ formState, districts, onFieldChange }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 text-white p-6 sm:p-8 shadow-xl shadow-brand-600/15">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-brand-400/10 blur-2xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-brand-200 bg-white/10 px-3 py-1 rounded-full mb-4">
            {t("planning.heroTag")}
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-2">
            {t("planning.heroTitle")}
          </h1>
          <p className="text-brand-100/80 max-w-lg text-sm leading-relaxed">
            {t("planning.heroDesc")}
          </p>
        </div>
      </section>

      {/* Form Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Card 1: Location */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md md:col-span-2" id="section-location">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <MapPin size={16} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-gray-900">{t("input.farmLocation")}</h3>
              <p className="text-[11px] text-gray-400">{t("input.farmLocationDesc")}</p>
            </div>
          </div>
          <GoogleMapLocationPicker
            value={{
              address: formState.farmAddress,
              latitude: formState.latitude,
              longitude: formState.longitude,
            }}
            districts={districts}
            onLocationSelect={(selection) => onFieldChange("locationSelection", selection)}
          />
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{t("input.state")}</label>
              <select id="input-state" value={formState.state}
                onChange={(e) => onFieldChange("state", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300"
              >
                <option value="">{t("input.selectState")}</option>
                {Object.keys(districts).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{t("input.district")}</label>
              <select id="input-district" value={formState.district}
                onChange={(e) => onFieldChange("district", e.target.value)}
                disabled={!formState.state}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300 disabled:opacity-50"
              >
                <option value="">{t("input.selectDistrict")}</option>
                {(districts[formState.state] || []).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          {formState.farmAddress ? (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/70 px-3.5 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">Selected Address</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-brand-900">{formState.farmAddress}</p>
            </div>
          ) : null}
        </div>

        {/* Card 2: Land Area */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md" id="section-land">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Landmark size={16} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-gray-900">{t("input.landArea")}</h3>
              <p className="text-[11px] text-gray-400">{t("input.landAreaDesc")}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-gray-500">{t("input.acreage")}</label>
              <span className="text-sm font-display font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-lg">
                {formState.landArea} {t("input.acres")}
              </span>
            </div>
            <input
              id="input-land-area"
              type="range" min="1" max="100" step="1"
              value={formState.landArea}
              onChange={(e) => onFieldChange("landArea", Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
              <span>1 acre</span>
              <span>50 acres</span>
              <span>100 acres</span>
            </div>
          </div>
        </div>

        {/* Card 3: Budget */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md" id="section-budget">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IndianRupee size={16} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-gray-900">{t("input.budget")}</h3>
              <p className="text-[11px] text-gray-400">{t("input.budgetDesc")}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-gray-500">{t("input.totalBudget")}</label>
              <span className="text-sm font-display font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                ₹{Number(formState.budget).toLocaleString("en-IN")}
              </span>
            </div>
            <input
              id="input-budget"
              type="range" min="5000" max="500000" step="5000"
              value={formState.budget}
              onChange={(e) => onFieldChange("budget", Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
              <span>₹5K</span>
              <span>₹2.5L</span>
              <span>₹5L</span>
            </div>
          </div>
        </div>

        {/* Card 4: Labour & Crop History */}
        <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md" id="section-labour">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
              <Users size={16} />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-gray-900">{t("input.labourHistory")}</h3>
              <p className="text-[11px] text-gray-400">{t("input.labourHistoryDesc")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                <span className="flex items-center gap-1"><Tractor size={12} /> {t("input.labour")}</span>
              </label>
              <select id="input-labour" value={formState.labour}
                onChange={(e) => onFieldChange("labour", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300"
              >
                <option value="low">{t("input.low")}</option>
                <option value="medium">{t("input.medium")}</option>
                <option value="high">{t("input.high")}</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
                <span className="flex items-center gap-1"><Wheat size={12} /> {t("input.previousCrop")}</span>
              </label>
              <select id="input-previous-crop" value={formState.previousCrop}
                onChange={(e) => onFieldChange("previousCrop", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-surface-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all hover:border-gray-300"
              >
                <option value="">{t("input.noneSkip")}</option>
                {previousCropOptions.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputBox;
