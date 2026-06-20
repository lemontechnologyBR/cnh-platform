import { useSearchParams } from 'react-router-dom'
import SplashPage from './SplashPage.jsx'
import SenatranConsultaPage from './SenatranConsultaPage.jsx'

export default function ConsultaEntry() {
  const [searchParams] = useSearchParams()
  const cpf = searchParams.get('cpf')
  const registro = searchParams.get('numero_registro')
  const isConsultaDomain = typeof window !== 'undefined'
    && window.location.hostname.includes('cnh-digital-senatran')

  if ((cpf && registro) || isConsultaDomain) {
    return <SenatranConsultaPage />
  }

  return <SplashPage />
}
