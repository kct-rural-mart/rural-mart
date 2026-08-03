import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterMartPage from './pages/RegisterMartPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PendingRegistrationsPage from './pages/admin/PendingRegistrationsPage'
import RegistrationDetailPage from './pages/admin/RegistrationDetailPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterMartPage />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['owner']}>
                <DashboardLayout title="Owner Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<OwnerDashboard />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout title="Admin Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="registrations" element={<PendingRegistrationsPage />} />
            <Route path="registrations/:id" element={<RegistrationDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
