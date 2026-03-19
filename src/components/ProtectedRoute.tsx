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
  const role = localStorage.getItem("role");

  if (!token || !role) {
    if (!role) localStorage.removeItem("token"); // Cleanup stale, role-less tokens

    // Redirect to the appropriate login page, replacing history
    const loginPath = requiredRole === "admin" ? "/admin/login" : "/citizen/login";
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />;
  }

  // Check if the user trying to access this route has the required role
  if (requiredRole && role !== requiredRole) {
    // E.g. An admin intentionally trying to access the citizen portal.
    // Log them out of their current role and force them to the requested login page.
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    const targetLoginPath = requiredRole === "admin" ? "/admin/login" : "/citizen/login";
    return <Navigate to={targetLoginPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
