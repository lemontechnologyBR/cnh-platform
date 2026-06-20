import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1117' }}>
      <div style={{ background: '#1a1d27', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#4f8ef7' }}>CNH</span>
            <span style={{ color: '#e2e8f0' }}> Admin</span>
          </div>
          <div style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>Painel de controle</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Usuário</label>
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
            <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Senha</label>
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

          <button
            type="submit"
            disabled={loading}
            style={{ background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  background: '#0f1117',
  border: '1px solid #2d3748',
  borderRadius: 8,
  padding: '11px 14px',
  color: '#e2e8f0',
  fontSize: 15,
  outline: 'none',
}
