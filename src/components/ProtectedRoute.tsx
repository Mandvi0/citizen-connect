import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, only users with this role can access the route */
  requiredRole?: "admin" | "user";
}

/**
 * Route wrapper that redirects unauthenticated users to the login page.
 * Uses `replace` so the protected URL doesn't stay in browser history,
 * preventing the back-button loop.
 */
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to the appropriate login page, replacing history
    const loginPath = requiredRole === "admin" ? "/admin/login" : "/citizen/login";
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
