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
      </div>
    </div>
  );
}

export default InputBox;
