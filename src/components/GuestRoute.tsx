import { Navigate, useLocation } from "react-router-dom";

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that redirects already-authenticated users away from
 * login/signup pages. Prevents the confusing loop where a logged-in user
 * visits /citizen/login and gets stuck.
 */
const GuestRoute = ({ children }: GuestRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && !role) {
    localStorage.removeItem("token");
  }

  if (token && role) {
    const isCitizenLogin = location.pathname.includes("citizen");
    const isAdminLogin = location.pathname.includes("admin");

    // If an Admin navigates to the Citizen Login page (or vice versa), log them out of their old role.
    if ((role === "admin" && isCitizenLogin) || (role === "user" && isAdminLogin)) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      return <>{children}</>;
    }

    // Otherwise they are on their OWN login page, bounce them safely to their dashboard.
    const path = role === "admin" ? "/admin/dashboard" : "/citizen/dashboard";
    return <Navigate to={path} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
