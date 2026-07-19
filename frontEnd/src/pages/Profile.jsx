import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { User as UserIcon, X, Menu, LogOut, Camera, Save, MapPin } from "lucide-react";
import PhaseNavigation from "../components/PhaseNavigation";
import LanguageSelector from "../components/LanguageSelector";
import { regionOptions } from "../data/options";

const BASE_URL = import.meta.env.VITE_API_URL || "";

function Profile({ user, onLogout, sidebarOpen, onToggleSidebar, onUpdateUser }) {
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState({ 
    name: "", 
    email: "", 
    profilePicture: "",
    state: "",
    district: "",
    locationName: "",
    latitude: null,
    longitude: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef(null);

  // We need regionOptions to populate dropdowns
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await axios.get(`${BASE_URL}/api/profile`);
        setProfileData({
          name: response.data.name || "",
          email: response.data.email || "",
          profilePicture: response.data.profilePicture || "",
          state: response.data.state || "",
          district: response.data.district || "",
          locationName: response.data.locationName || "",
          latitude: response.data.latitude || null,
          longitude: response.data.longitude || null,
        });
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleStateChange = async (e) => {
    const newState = e.target.value;
    // Assuming regionOptions is available. We need to import it.
    // For now, emit it in profileData
    setProfileData(prev => ({ ...prev, state: newState, district: "" }));
  };

  // Auto-geocode location whenever state/district/locationName changes
  useEffect(() => {
    let active = true;
    const fetchCoords = async () => {
      const query = profileData.locationName || profileData.district || profileData.state;
      if (!query || profileData.latitude !== null) return; // Only fetch if we don't have it or it changed? Actually let's just fetch if we want.
      // Better to only geocode just before submit to save API calls, or let user click "Update Map".
      // But we will geocode silently.
      try {
        const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&format=json`);
        if (active && res.data.results && res.data.results.length > 0) {
          setProfileData(prev => ({ 
            ...prev, 
            latitude: res.data.results[0].latitude, 
            longitude: res.data.results[0].longitude 
          }));
        }
      } catch (err) {
        console.warn("Geocoding failed for:", query);
      }
    };
    // Only run if they actively changed location and cleared old lat/lon, or just run it when query changes
    const delayDebounceFn = setTimeout(() => {
      if (profileData.state) fetchCoords();
    }, 1000);
    return () => { active = false; clearTimeout(delayDebounceFn); };
  }, [profileData.state, profileData.district, profileData.locationName]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axios.put(`${BASE_URL}/api/profile`, profileData);
      setSuccessMsg("Profile updated successfully!");
      if (onUpdateUser && response.data.user) {
        onUpdateUser(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} />
                )}
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">My Profile</h1>
                <p className="text-[11px] text-brand-300/70 tracking-wide uppercase">Settings</p>
              </div>
            </div>
            <button type="button" onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-brand-300">
              <X size={18} />
            </button>
          </div>
          <PhaseNavigation className="mb-5" />
          
          <div className="mt-8 bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-2">Profile Settings</h4>
            <p className="text-[12px] text-brand-200 leading-relaxed font-medium">
              Manage your personal information and account settings.
            </p>
          </div>
        </div>

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
                <h2 className="text-lg font-display font-bold text-gray-800">Profile Settings</h2>
                <p className="text-[12px] text-gray-500">Update your personal details</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
          {error && (
            <div className="mb-6 animate-slide-up bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-700 text-sm flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 animate-slide-up bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-green-700 text-sm flex items-start gap-3">
              <span className="text-green-500 text-lg mt-0.5">✓</span>
              <p>{successMsg}</p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading profile...</div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-8 pb-8 border-b border-gray-100">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg relative flex items-center justify-center">
                      {profileData.profilePicture ? (
                        <img src={profileData.profilePicture} alt="Profile Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-12 h-12 text-gray-300" />
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    <div className="text-center mt-3">
                      <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700 transition-colors">Change Photo</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-5 w-full">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location Settings */}
                <div className="mb-8 pb-8 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-5">
                    <MapPin className="text-brand-500" size={18} />
                    Farm Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                      <select
                        name="state"
                        value={profileData.state}
                        onChange={(e) => {
                          const newState = e.target.value;
                          setProfileData(prev => ({ ...prev, state: newState, district: (regionOptions[newState] || [])[0] || "" }));
                        }}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all bg-white"
                      >
                        <option value="">Select State</option>
                        {Object.keys(regionOptions).map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                      <select
                        name="district"
                        value={profileData.district}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all bg-white"
                      >
                        <option value="">Select District</option>
                        {(regionOptions[profileData.state] || []).map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Village / Tehsil <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="locationName"
                        value={profileData.locationName}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                        placeholder="e.g. Madhapar"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
