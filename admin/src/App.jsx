import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CnhListPage from './pages/CnhListPage.jsx'
import CnhFormPage from './pages/CnhFormPage.jsx'
import CnhPreviewPage from './pages/CnhPreviewPage.jsx'
import UsersPage from './pages/UsersPage.jsx'
import RechargePage from './pages/RechargePage.jsx'
import RechargesAdminPage from './pages/RechargesAdminPage.jsx'

function Protected({ children }) {
  const token = localStorage.getItem('cnh_admin_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/cnhs" element={<Protected><CnhListPage /></Protected>} />
      <Route path="/novo" element={<Protected><CnhFormPage /></Protected>} />
      <Route path="/cnhs/:id" element={<Protected><CnhPreviewPage /></Protected>} />
      <Route path="/cnhs/:id/editar" element={<Protected><CnhFormPage /></Protected>} />
      <Route path="/operadores" element={<Protected><UsersPage /></Protected>} />
      <Route path="/recarregar" element={<Protected><RechargePage /></Protected>} />
      <Route path="/recargas" element={<Protected><RechargesAdminPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
