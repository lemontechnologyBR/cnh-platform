import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { api } from '../utils/api.js'

function StatCard({ label, value, color = '#FF6B00' }) {
  return (
    <div style={{ background: '#161210', borderRadius: 12, padding: '24px 28px', border: '1px solid #3a2820', flex: 1 }}>
      <div style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 40, fontWeight: 800, color }}>{value ?? '—'}</div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {})
    api.getCnhs().then(list => setRecent([...list].reverse().slice(0, 5))).catch(() => {})
  }, [])

  return (
    <Layout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Dashboard</h1>
        <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Visão geral do sistema CNH</p>
      </div>

      {/* Stat cards */}
      <div className="admin-stat-row">
        <StatCard label="Total de CNH's" value={stats?.total} color="#FF6B00" />
        <StatCard label="Criadas hoje" value={stats?.createdToday} color="#34d399" />
        <StatCard
          label={stats?.role === 'superadmin' ? 'Faturamento' : 'Seu saldo'}
          value={
            stats?.role === 'superadmin'
              ? (stats?.faturamento != null ? Number(stats.faturamento).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—')
              : (stats?.saldo != null ? Number(stats.saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—')
          }
          color="#FFB800"
        />
      </div>

      {/* Recent */}
      <div style={{ background: '#161210', borderRadius: 12, border: '1px solid #3a2820' }}>
        <div className="admin-recent-header">
          <span style={{ fontWeight: 600, color: '#f1f5f9' }}>Criadas recentemente</span>
          <button onClick={() => navigate('/cnhs')} style={{ background: 'none', border: 'none', color: '#FF6B00', cursor: 'pointer', fontSize: 13 }}>Ver todas →</button>
        </div>
        {recent.length === 0
          ? <div style={{ padding: '32px 24px', textAlign: 'center', color: '#475569', fontSize: 14 }}>Nenhuma CNH cadastrada ainda</div>
          : recent.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/cnhs/${c.id}`)}
              className="admin-recent-item"
              style={{ borderBottom: '1px solid #221816' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF6B0020', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🪪</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{c.nome || '—'}</div>
                <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>CPF: {c.cpf || '—'} · Registro: {c.registro || '—'}</div>
              </div>
              <div style={{ color: '#475569', fontSize: 12 }}>{c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}</div>
            </div>
          ))
        }
      </div>
    </Layout>
  )
}
