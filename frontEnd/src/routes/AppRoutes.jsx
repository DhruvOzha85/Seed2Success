import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import Planning from "../pages/Planning";
import Health from "../pages/Health";
import Harvesting from "../pages/Harvesting";
import Selling from "../pages/Selling";
import Schemes from "../pages/Schemes";
import Subscription from "../pages/Subscription";

import MyHistory from "../pages/MyHistory";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import RequireLocation from "../components/RequireLocation";
import LocationOnboarding from "../pages/LocationOnboarding";
import Dashboard from "../pages/Dashboard";
import AboutUs from "../pages/AboutUs";
import ContactUs from "../pages/ContactUs";

function AppRoutes({ token, user, onLogin, onLogout, props }) {
  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<Auth onLogin={onLogin} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/onboarding" element={<LocationOnboarding user={user} onUpdateUser={props.profile?.onUpdateUser || (() => {})} />} />
      <Route path="/" element={<RequireLocation user={user}><Dashboard user={user} onLogout={onLogout} {...props.dashboard} /></RequireLocation>} />
      <Route path="/planning" element={<RequireLocation user={user}><Planning user={user} onLogout={onLogout} {...props.planning} /></RequireLocation>} />
      <Route path="/health" element={<RequireLocation user={user}><Health user={user} onLogout={onLogout} {...props.health} /></RequireLocation>} />
      <Route path="/harvesting" element={<RequireLocation user={user}><Harvesting user={user} onLogout={onLogout} {...props.harvesting} /></RequireLocation>} />
      <Route path="/selling" element={<RequireLocation user={user}><Selling user={user} onLogout={onLogout} {...props.selling} /></RequireLocation>} />
      <Route path="/schemes" element={<RequireLocation user={user}><Schemes user={user} onLogout={onLogout} {...props.schemes} /></RequireLocation>} />
      <Route path="/subscription" element={<RequireLocation user={user}><Subscription user={user} onLogout={onLogout} {...props.subscription} /></RequireLocation>} />

      <Route path="/history" element={<RequireLocation user={user}><MyHistory user={user} onLogout={onLogout} {...props.history} /></RequireLocation>} />
      <Route path="/profile" element={<RequireLocation user={user}><Profile user={user} onLogout={onLogout} {...props.profile} /></RequireLocation>} />
      <Route path="/about" element={<AboutUs {...props.about} />} />
      <Route path="/contact" element={<ContactUs {...props.contact} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
