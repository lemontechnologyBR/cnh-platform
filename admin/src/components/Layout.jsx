import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { api } from '../utils/api.js'

function usePendingRecharges(isSuperadmin) {
  const [pending, setPending] = useState(0)
  useEffect(() => {
    if (!isSuperadmin) return
    const load = () => api.getRecharges().then(d => setPending(d.pending)).catch(() => {})
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [isSuperadmin])
  return pending
}

function fmt(v) {
  return Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [me, setMe] = useState(null)

  useEffect(() => {
    api.getMe().then(setMe).catch(() => {})
  }, [])

  const isSuperadmin = me?.role === 'superadmin'
  const pendingRecharges = usePendingRecharges(isSuperadmin)

  const NAV = [
    { to: '/',            label: 'Dashboard',   icon: '⬛' },
    { to: '/cnhs',        label: "CNH's",        icon: '🪪' },
    ...(isSuperadmin
      ? [
          { to: '/operadores', label: 'Operadores', icon: '👥' },
          { to: '/recargas',   label: 'Recargas PIX', icon: '💸', badge: pendingRecharges },
        ]
      : [
          { to: '/recarregar', label: 'Recarregar', icon: '💳' },
        ]
    ),
    { to: '/novo',        label: 'Nova CNH',     icon: '➕' },
  ]

  function logout() {
    localStorage.removeItem('cnh_admin_token')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#1a1d27', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid #2d3748' }}>
        <div style={{ padding: '24px 20px 20px' }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            <span style={{ color: '#4f8ef7' }}>CNH</span>
            <span style={{ color: '#e2e8f0' }}> Admin</span>
          </div>
          <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>Painel de controle</div>
        </div>

        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? '#4f8ef720' : 'transparent',
                borderLeft: isActive ? '3px solid #4f8ef7' : '3px solid transparent',
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ background: '#f59e0b', color: '#000', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Saldo card — somente operadores */}
        {me && me.role !== 'superadmin' && (
          <div style={{ margin: '0 12px 12px', background: '#0f1117', borderRadius: 10, padding: '12px 14px', border: '1px solid #2d3748' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{me.nome || me.username}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>Operador</div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saldo</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: (me.saldo ?? 0) > 0 ? '#34d399' : '#f87171' }}>
              {fmt(me.saldo)}
            </div>
          </div>
        )}

        <div style={{ padding: '0 12px 16px' }}>
          <button
            onClick={logout}
            style={{ width: '100%', background: 'transparent', border: '1px solid #2d3748', borderRadius: 8, padding: '9px 12px', color: '#64748b', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px', background: '#0f1117' }}>
        {children}
      </main>
    </div>
  )
}
