import { Navigate } from "react-router-dom";

interface GuestRouteProps {
  children: React.ReactNode;
  /** Where to redirect authenticated users. Defaults to /citizen/dashboard */
  redirectTo?: string;
}

/**
 * Route wrapper that redirects already-authenticated users away from
 * login/signup pages. Prevents the confusing loop where a logged-in user
 * visits /citizen/login and gets stuck.
 */
const GuestRoute = ({ children, redirectTo = "/citizen/dashboard" }: GuestRouteProps) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
