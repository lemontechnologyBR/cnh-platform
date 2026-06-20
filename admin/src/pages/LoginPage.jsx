import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'
import theme from '../styles/theme.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.login(username, password)
      if (res.error) { setError(res.error); return }
      localStorage.setItem('cnh_admin_token', res.token)
      navigate('/')
    } catch {
      setError('Falha na conexão com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bgMain }}>
      <div
        className="admin-login-card"
        style={{
          background: theme.bgCard,
          borderRadius: 16,
          width: '100%',
          maxWidth: 400,
          border: `1px solid ${theme.border}`,
          boxShadow: '0 12px 48px rgba(229, 57, 53, 0.12)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, textAlign: 'center' }}>
          <img src="/logo-phoenix.png" alt="Cupula Fenix" style={{ height: 80, objectFit: 'contain', marginBottom: 16 }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: theme.text }}>
            Cupula <span style={{ color: theme.accentGold }}>Fenix</span>
          </div>
          <div style={{ color: theme.textDim, fontSize: 14, marginTop: 6 }}>Painel de controle</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Usuário</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 14px', color: '#fca5a5', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: theme.textMuted,
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle = {
  width: '100%',
  background: theme.bgMain,
  border: `1px solid ${theme.border}`,
  borderRadius: 8,
  padding: '11px 14px',
  color: theme.text,
  fontSize: 15,
  outline: 'none',
}

function btnStyle(loading) {
  return {
    background: theme.gradient,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '13px 0',
    fontWeight: 700,
    fontSize: 15,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    marginTop: 4,
  }
}
