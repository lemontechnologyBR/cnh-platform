import { Routes, Route, Navigate } from 'react-router-dom'
import SplashPage from './pages/SplashPage'
import GovBrLoginPage from './pages/GovBrLoginPage'
import GovBrPasswordPage from './pages/GovBrPasswordPage'
import HomePage from './pages/HomePage'
import CnhPage from './pages/CnhPage'
import HabilitacaoPage from './pages/HabilitacaoPage'
import VeiculosPage from './pages/VeiculosPage'
import MultasPage from './pages/MultasPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/govbr-login" element={<GovBrLoginPage />} />
      <Route path="/govbr-senha" element={<GovBrPasswordPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/cnh" element={<CnhPage />} />
      <Route path="/habilitacao" element={<HabilitacaoPage />} />
      <Route path="/veiculos" element={<VeiculosPage />} />
      <Route path="/multas" element={<MultasPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
