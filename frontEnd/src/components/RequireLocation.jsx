import { Navigate, useLocation } from "react-router-dom";

/**
 * A wrapper component that forces users to complete their location profile
 * if they haven't already. It redirects them to /onboarding if `user.state` is missing.
 */
function RequireLocation({ user, children }) {
  const location = useLocation();

  // If there's no user, let AppRoutes handle the auth redirect
  if (!user) return children;

  // If the user doesn't have a state saved, they need to onboard
  if (!user.state) {
    // Save the current location they were trying to access so we can send them back later
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User has location data, allow access
  return children;
}

export default RequireLocation;
