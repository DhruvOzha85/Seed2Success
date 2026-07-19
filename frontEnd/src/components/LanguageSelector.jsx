import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", gtCode: "en" },
  { code: "hi", label: "Hindi", native: "हिन्दी", gtCode: "hi" },
  { code: "te", label: "Telugu", native: "తెలుగు", gtCode: "te" },
  { code: "mr", label: "Marathi", native: "मराठी", gtCode: "mr" },
  { code: "ta", label: "Tamil", native: "தமிழ்", gtCode: "ta" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", gtCode: "kn" },
];

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setLanguageCookie(gtCode) {
  const cookieValue = `/en/${gtCode}`;
  document.cookie = `googtrans=${cookieValue}; path=/;`;
  // Set for the domain as well to ensure it works properly
  const domain = window.location.hostname;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain};`;
}

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(LANGUAGES[0]);
  const ref = useRef(null);

  useEffect(() => {
    const cookie = getCookie('googtrans');
    if (cookie) {
      const parts = cookie.split('/');
      if (parts.length === 3) {
        const langCode = parts[2];
        const match = LANGUAGES.find(l => l.gtCode === langCode);
        if (match) setCurrentLang(match);
      }
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const changeLanguage = (lang) => {
    setLanguageCookie(lang.gtCode);
    window.location.reload();
  };

  return (
    <div ref={ref} className="relative px-2 mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-brand-800/40 transition-all duration-200 group"
      >
        <Globe size={14} className="text-brand-400 group-hover:text-brand-300 transition-colors" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-[12px] font-medium text-brand-200 leading-tight truncate">{currentLang.native}</p>
          <p className="text-[10px] text-brand-500 leading-tight">{currentLang.label}</p>
        </div>
        <ChevronDown size={13} className={`text-brand-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-1.5 bg-brand-900 border border-brand-800/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-slide-up">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                lang.code === currentLang.code
                  ? "bg-brand-600/20 text-brand-200"
                  : "text-brand-300 hover:bg-white/[0.05] hover:text-brand-100"
              }`}
            >
              <span className="text-[13px] font-medium">{lang.native}</span>
              <span className="text-[11px] text-brand-500 ml-auto">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Hidden container for google translate widget */}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
}

export default LanguageSelector;
