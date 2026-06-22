import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { ROLE_DASHBOARD } from './utils/constants';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DriverRegisterPage from './pages/auth/DriverRegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import GoogleCallback from './pages/auth/GoogleCallback';
import TrackPage from './pages/TrackPage';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookShipment from './pages/customer/BookShipment';
import MyShipments from './pages/customer/MyShipments';
import PaymentsPage from './pages/customer/PaymentsPage';
import ChatPage from './pages/customer/ChatPage';

import DriverDashboard from './pages/driver/DriverDashboard';
import DriverDeliveries from './pages/driver/DriverDeliveries';
import DriverRoutes from './pages/driver/DriverRoutes';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShipments from './pages/admin/AdminShipments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminWarehouses from './pages/admin/AdminWarehouses';
import AdminDriverApplications from './pages/admin/AdminDriverApplications';

import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import WarehouseScan from './pages/warehouse/WarehouseScan';
import WarehouseInventory from './pages/warehouse/WarehouseInventory';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) return <Navigate to={ROLE_DASHBOARD[user.role]} replace />;
  return <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/driver" element={<DriverRegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/auth/google/callback" element={<GoogleCallback />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/track/:trackingId" element={<TrackPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="customer/book" element={<ProtectedRoute roles={['customer']}><BookShipment /></ProtectedRoute>} />
        <Route path="customer/shipments" element={<ProtectedRoute roles={['customer']}><MyShipments /></ProtectedRoute>} />
        <Route path="customer/payments" element={<ProtectedRoute roles={['customer']}><PaymentsPage /></ProtectedRoute>} />
        <Route path="customer/chat" element={<ProtectedRoute roles={['customer']}><ChatPage /></ProtectedRoute>} />

        <Route path="driver" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="driver/deliveries" element={<ProtectedRoute roles={['driver']}><DriverDeliveries /></ProtectedRoute>} />
        <Route path="driver/routes" element={<ProtectedRoute roles={['driver']}><DriverRoutes /></ProtectedRoute>} />

        <Route path="admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/shipments" element={<ProtectedRoute roles={['admin']}><AdminShipments /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="admin/analytics" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
        <Route path="admin/warehouses" element={<ProtectedRoute roles={['admin']}><AdminWarehouses /></ProtectedRoute>} />
        <Route path="admin/driver-applications" element={<ProtectedRoute roles={['admin']}><AdminDriverApplications /></ProtectedRoute>} />

        <Route path="warehouse" element={<ProtectedRoute roles={['warehouse']}><WarehouseDashboard /></ProtectedRoute>} />
        <Route path="warehouse/scan" element={<ProtectedRoute roles={['warehouse']}><WarehouseScan /></ProtectedRoute>} />
        <Route path="warehouse/inventory" element={<ProtectedRoute roles={['warehouse']}><WarehouseInventory /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
