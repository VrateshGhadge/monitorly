import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
// import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import MonitorsPage from "./pages/dashboard/MonitorsPage";
import MonitorDetailsPage from "./pages/dashboard/MonitorDetailsPage";
import AlertsPage from "./pages/dashboard/AlertsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import ProtectedRoute from "./components/app/ProtectedRoute";
import SessionExpiredModal from "./components/app/SessionExpiredModal";
import SeoManager from "./components/app/SeoManager";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <>
      <SeoManager />
      <SessionExpiredModal />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OverviewPage />} />

          <Route path="monitors" element={<MonitorsPage />} />
          {/* <Route
            path="monitors/:id"
            element={<MonitorDetailsPage />}
          /> */}
          <Route path="monitors/:slug" element={<MonitorDetailsPage />} />

          <Route path="alerts" element={<AlertsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all: unknown paths get a real 404 page instead of a blank
            screen. SPA fallback (wrangler.jsonc) stays enabled so hard
            refreshes on /dashboard still work. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
