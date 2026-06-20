import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSenatranTheme } from '../utils/senatranTheme.js'
import '../styles/senatran-consulta.css'

export default function SenatranInfoPage() {
  useSenatranTheme()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const cpf = searchParams.get('cpf') || ''
  const numeroRegistro = searchParams.get('numero_registro') || ''

  function goBack() {
    const params = new URLSearchParams({ cpf, numero_registro: numeroRegistro })
    navigate(`/?${params}`)
  }

  return (
    <div className="senatran-page senatran-page--scroll">
      <header className="senatran-header senatran-header--info">
        <button type="button" className="senatran-header__btn senatran-header__btn--info" onClick={goBack} aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="senatran-header__title">Informações do documento</span>
        <span className="senatran-header__spacer" aria-hidden="true" />
      </header>

      <div className="senatran-info-body">
        <div className="senatran-info-doc">
          <div className="senatran-info-doc__main">CNH</div>
          <div className="senatran-info-doc__sub">SENATRAN</div>
        </div>

        <p className="senatran-info-text">
          Todas as Carteiras Nacionais de Habilitação (CNH) emitidas desde maio de 2017 possuem o QR Code Vio.
        </p>
        <p className="senatran-info-text">
          Está disponível também a versão digital. Para usá-la instale o aplicativo Carteira Digital de Trânsito (CDT) disponível gratuitamente nas lojas.
        </p>

        <a
          className="senatran-info-link"
          href="https://www.gov.br/infraestrutura/pt-br/assuntos/transito/carteira-digital-de-transito"
          target="_blank"
          rel="noopener noreferrer"
        >
          CONHEÇA A CARTEIRA DIGITAL DE TRÂNSITO (CDT)
        </a>
      </div>
    </div>
  )
}
