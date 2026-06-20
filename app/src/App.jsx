import { Routes, Route, Navigate } from 'react-router-dom'
import ConsultaEntry from './pages/ConsultaEntry'
import SenatranConsultaPage from './pages/SenatranConsultaPage'
import SenatranInfoPage from './pages/SenatranInfoPage'
import SenatranQrPage from './pages/SenatranQrPage'
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
      <Route path="/" element={<ConsultaEntry />} />
      <Route path="/consulta" element={<SenatranConsultaPage />} />
      <Route path="/consulta/info" element={<SenatranInfoPage />} />
      <Route path="/consulta/qrcode" element={<SenatranQrPage />} />
      <Route path="/splash" element={<SplashPage />} />
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
