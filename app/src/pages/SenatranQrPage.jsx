import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { buildConsultaUrl, fetchConsultaCnh } from '../utils/consultaUrl.js'
import '../styles/senatran-consulta.css'

export default function SenatranQrPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const cpf = searchParams.get('cpf') || ''
  const numeroRegistro = searchParams.get('numero_registro') || ''
  const [qrUrl, setQrUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const agora = new Date().toLocaleString('pt-BR')

  useEffect(() => {
    if (!cpf || !numeroRegistro) {
      setError('Parâmetros inválidos.')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const cnh = await fetchConsultaCnh(cpf, numeroRegistro)
        if (!cancelled) setQrUrl(buildConsultaUrl(cnh.cpf, cnh.registro))
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erro ao carregar.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [cpf, numeroRegistro])

  function goDetalhamento() {
    navigate(`/?cpf=${encodeURIComponent(cpf)}&numero_registro=${encodeURIComponent(numeroRegistro)}`)
  }

  return (
    <div className="senatran-page senatran-page--qr">
      <header className="senatran-header senatran-header--blue">
        <button type="button" className="senatran-header__btn" onClick={goDetalhamento} aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div>
          <div className="senatran-header__title senatran-header__title--left">HABILITAÇÃO</div>
          <div className="senatran-header__sub">Atualizado em {agora}</div>
        </div>
      </header>

      <div className="senatran-vio-banner">
        <span>Verifique autenticidade do QR Code com o app </span>
        <strong>Vio</strong>
      </div>

      {loading && <div className="senatran-loading">Carregando...</div>}
      {error && <div className="senatran-error">{error}</div>}

      {!loading && !error && qrUrl && (
        <div className="senatran-qr-wrap">
          <div className="senatran-qr-box">
            <QRCodeSVG value={qrUrl} size={280} level="M" includeMargin={false} />
          </div>
        </div>
      )}
    </div>
  )
}
