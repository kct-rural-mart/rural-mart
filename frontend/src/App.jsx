import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import OwnerLayout from './components/OwnerLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterMartPage from './pages/RegisterMartPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import PendingRegistrationsPage from './pages/admin/PendingRegistrationsPage'
import RegistrationDetailPage from './pages/admin/RegistrationDetailPage'
import OwnerDailyBusiness from './components/owner/OwnerDailyBusiness'
import OwnerProductInventory from './components/owner/OwnerProductInventory'
import OwnerFarmerOutreach from './components/owner/OwnerFarmerOutreach'
import OwnerFinancialDashboard from './components/owner/OwnerFinancialDashboard'
import OwnerSettings from './components/owner/OwnerSettings'
import RuralMartsPage from './pages/admin/RuralMartsPage'
import FinancePage from './pages/admin/FinancePage'
import OutreachPage from './pages/admin/OutreachPage'
import InventoryPage from './pages/admin/InventoryPage'
import ReportsPage from './pages/admin/ReportsPage'
import SettingsPage from './pages/admin/SettingsPage'

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
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="daily-business" element={<OwnerDailyBusiness />} />
            <Route path="inventory" element={<OwnerProductInventory />} />
            <Route path="outreach" element={<OwnerFarmerOutreach />} />
            <Route path="finance" element={<OwnerFinancialDashboard />} />
            <Route path="settings" element={<OwnerSettings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="registrations" element={<PendingRegistrationsPage />} />
            <Route path="registrations/:id" element={<RegistrationDetailPage />} />
            <Route path="rural-marts" element={<RuralMartsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="outreach" element={<OutreachPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
