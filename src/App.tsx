import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFoundPage from "@/pages/pageNotFound"; // ✅ New: Add this page (create a simple 404 component if it doesn't exist)
import AdminDashboard from "@/pages/dashboards/AdminDashboard";
import DriverDashboard from "@/pages/dashboards/DriverDashboard";
import WelderDashboard from "@/pages/dashboards/WelderDashboard";
import StudentDashboard from "@/pages/dashboards/StudentDashboard";
import { useAuth } from "@/contexts/AuthContext";
import PassportUploadPage from "@/pages/passport/PassportUploadPage";
// ✅ Add imports for missing pages (create placeholders if they don't exist yet)
// import UsersPage from "@/pages/UsersPage"; // e.g., <div>Users Management</div>
// import ReportsPage from "@/pages/ReportsPage"; // e.g., <div>Reports</div>
import QuizzManagementPage from "@/pages/Quizz/quizzAdminPage"; // Dedicated for quizz (or keep using AdminDashboard)
// import SettingsPage from "@/pages/SettingsPage"; // e.g., <div>Settings</div>
import QuestionSetBuilder from "./pages/Quizz/questionSetBuilder";
function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/dashboard/admin" replace />;
    case "driver":
      return <Navigate to="/dashboard/driver" replace />;
    case "welder":
      return <Navigate to="/dashboard/welder" replace />;
    case "student":
      return <Navigate to="/dashboard/student" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected routes under /dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />

        {/* Role dashboards */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="driver"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="welder"
          element={
            <ProtectedRoute allowedRoles={["welder"]}>
              <WelderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Added: Missing routes for sidebar links (with role protection) */}
        {/* <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "driver", "welder"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={["admin", "driver", "welder", "student"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="quizz"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <QuizzManagementPage />{" "}
              {/* ✅ Swapped to dedicated component for clarity */}
            </ProtectedRoute>
          }
        />

        <Route
          path="quizz/builder"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <QuestionSetBuilder questionSetId={0} />
            </ProtectedRoute>
          }
        />

        {/* Passport Upload route (unchanged) */}
        <Route
          path="passport-upload"
          element={
            <ProtectedRoute allowedRoles={["driver", "student", "welder"]}>
              <PassportUploadPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ✅ New: 404 Page */}
      <Route path="/not-found" element={<NotFoundPage />} />
      {/* Fallback: Redirect unknown paths to 404 (instead of home) */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
