import { useState, useEffect } from "react";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { MapPin, LoaderCircle, ChevronRight } from "lucide-react";
import axios from "axios";
import { regionOptions } from "../data/options";

const BASE_URL = import.meta.env.VITE_API_URL || "";

function LocationOnboarding({ user, onUpdateUser }) {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stateVal, setStateVal] = useState("Andhra Pradesh");
  const [districtVal, setDistrictVal] = useState(regionOptions["Andhra Pradesh"][0]);
  const [locationName, setLocationName] = useState("");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);



  // Handle auto-geocoding when state/district changes
  useEffect(() => {
    let active = true;
    const fetchCoords = async () => {
      const query = locationName || districtVal || stateVal;
      if (!query) return;
      try {
        const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&format=json`);
        if (active && res.data.results && res.data.results.length > 0) {
          setLatitude(res.data.results[0].latitude);
          setLongitude(res.data.results[0].longitude);
        }
      } catch (err) {
        console.warn("Geocoding failed for:", query);
      }
    };
    fetchCoords();
    return () => { active = false; };
  }, [stateVal, districtVal, locationName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stateVal || !districtVal) {
      setError("Please select both a State and a District.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        state: stateVal,
        district: districtVal,
        locationName,
        latitude,
        longitude
      };

      const res = await axios.put(`${BASE_URL}/api/profile`, payload);
      
      // Update global user state
      onUpdateUser(res.data.user);
      
      // Force a hard redirect to the dashboard to avoid any router race conditions
      const origin = routerLocation.state?.from?.pathname || "/";
      window.location.href = origin;
    } catch (err) {
      console.error(err);
      setError("Failed to save location profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-100 overflow-hidden">
        {/* Header Area */}
        <div className="bg-brand-50/50 p-8 text-center border-b border-brand-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-brand-100">
            <MapPin size={28} className="text-brand-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-brand-950">Where is your farm?</h2>
          <p className="text-brand-600/80 mt-2 text-sm">
            We need your location to personalize weather, crop intelligence, and market data.
          </p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-900 mb-1.5">State</label>
              <select
                value={stateVal}
                onChange={(e) => {
                  const newState = e.target.value;
                  setStateVal(newState);
                  setDistrictVal((regionOptions[newState] || [])[0]);
                }}
                className="w-full h-12 bg-gray-50/50 border border-gray-200 rounded-xl px-4 text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
              >
                {Object.keys(regionOptions).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-900 mb-1.5">District</label>
              <select
                value={districtVal}
                onChange={(e) => setDistrictVal(e.target.value)}
                className="w-full h-12 bg-gray-50/50 border border-gray-200 rounded-xl px-4 text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
              >
                {(regionOptions[stateVal] || []).map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-900 mb-1.5">
                Village / Tehsil <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Madhapar"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full h-12 bg-gray-50/50 border border-gray-200 rounded-xl px-4 text-brand-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Save Location</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LocationOnboarding;
