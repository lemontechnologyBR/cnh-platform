import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { buildConsultaUrl, fetchConsultaCnh, formatCpf, getRegistroForConsulta } from '../utils/consultaUrl.js'
import '../styles/senatran-consulta.css'

export default function SenatranConsultaPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const cpf = searchParams.get('cpf') || ''
  const numeroRegistro = searchParams.get('numero_registro') || ''
  const [cnh, setCnh] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!cpf || !numeroRegistro) {
      setError('Link de consulta inválido. Verifique o QR Code da CNH.')
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await fetchConsultaCnh(cpf, numeroRegistro)
        if (!cancelled) setCnh(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Erro ao carregar dados.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [cpf, numeroRegistro])

  function goQr() {
    navigate(`/consulta/qrcode?cpf=${encodeURIComponent(cpf)}&numero_registro=${encodeURIComponent(numeroRegistro)}`)
  }

  if (loading) {
    return (
      <div className="senatran-page">
        <div className="senatran-loading">Carregando...</div>
      </div>
    )
  }

  if (error || !cnh) {
    return (
      <div className="senatran-page">
        <header className="senatran-header senatran-header--olive">
          <span className="senatran-header__title">Detalhamento</span>
        </header>
        <div className="senatran-error">{error || 'CNH não encontrada.'}</div>
      </div>
    )
  }

  const fotoSrc = cnh.foto || '/foto_padrao_3x4.png'
  const qrcodeUrl = buildConsultaUrl(null, null, cnh)

  return (
    <div className="senatran-page">
      <header className="senatran-header senatran-header--olive">
        <button type="button" className="senatran-header__btn" onClick={() => window.history.length > 1 ? navigate(-1) : null} aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="senatran-header__title">Detalhamento</span>
        <button type="button" className="senatran-header__btn" onClick={goQr} aria-label="QR Code">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8"/>
            <path d="M12 11v5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="12" cy="8" r="1" fill="white"/>
          </svg>
        </button>
      </header>

      <div className="senatran-doc-title">
        <div className="senatran-doc-title__main">CNH</div>
        <div className="senatran-doc-title__sub">SENATRAN</div>
      </div>

      <div className="senatran-photo-wrap">
        <img src={fotoSrc} alt="" className="senatran-photo" />
      </div>

      <div className="senatran-fields">
        <Field label="Nome" value={cnh.nome} />
        <Field label="Nome Civil" value={cnh.nome} />
        <Field label="Doc. Identidade/Órg. Emissor/UF" value={cnh.docIdentidade} />
        <Field label="CPF" value={formatCpf(cnh.cpf)} />
        <Field label="Data de Nascimento" value={cnh.nascimento} />
        <Field label="Nº Registro" value={getRegistroForConsulta(cnh) || cnh.registro} />
        <Field label="Categoria" value={cnh.catHab} />
        <Field label="Validade" value={cnh.validade} />
        <Field label="Data de Emissão" value={cnh.emissao} />
      </div>

      <p className="senatran-footnote">
        Consulta pública · {qrcodeUrl.replace(/^https?:\/\//, '')}
      </p>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="senatran-field">
      <div className="senatran-field__label">{label}</div>
      <div className="senatran-field__value">{value || '—'}</div>
    </div>
  )
}
