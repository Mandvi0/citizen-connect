import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CitizenLogin from "./pages/citizen/Login";
import CitizenSignup from "./pages/citizen/Signup";
import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import CitizenProfile from "./pages/citizen/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />

          {/* Auth pages — redirect away if already logged in */}
          <Route
            path="/citizen/login"
            element={
              <GuestRoute>
                <CitizenLogin />
              </GuestRoute>
            }
          />
          <Route
            path="/citizen/signup"
            element={
              <GuestRoute>
                <CitizenSignup />
              </GuestRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <GuestRoute redirectTo="/admin/dashboard">
                <AdminLogin />
              </GuestRoute>
            }
          />

          {/* Protected citizen pages */}
          <Route
            path="/citizen/dashboard"
            element={
              <ProtectedRoute>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/report"
            element={
              <ProtectedRoute>
                <ReportIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/citizen/profile"
            element={
              <ProtectedRoute>
                <CitizenProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected admin pages */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
