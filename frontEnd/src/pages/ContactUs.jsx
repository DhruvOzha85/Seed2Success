import { useTranslation } from "react-i18next";
import { Phone, ArrowLeft, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function ContactUs({ sidebarOpen, onToggleSidebar }) {
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
              <h2 className="text-lg font-display font-bold text-gray-800">Contact Us</h2>
              <p className="text-[12px] text-gray-500">Get in touch with our support team</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="w-20 h-20 bg-brand-50 rounded-3xl mx-auto flex items-center justify-center text-brand-600 mb-6">
            <Phone size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">We're Here to Help</h1>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Have questions about the platform, your subscription, or need agronomy support? Reach out to us.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Email Support</h3>
                <p className="text-gray-500 text-sm mb-2">For technical issues and account queries.</p>
                <a href="mailto:support@seed2success.com" className="text-brand-600 font-medium hover:underline">support@seed2success.com</a>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Office Location</h3>
                <p className="text-gray-500 text-sm mb-2">Visit our headquarters.</p>
                <p className="text-gray-800 font-medium">Innovation Hub, New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ContactUs;
