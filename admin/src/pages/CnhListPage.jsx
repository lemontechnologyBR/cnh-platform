import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { api } from '../utils/api.js'

function formatExpiresAt(expiresAt) {
  if (!expiresAt) return '—'
  return new Date(expiresAt).toLocaleDateString('pt-BR')
}

function daysUntil(expiresAt) {
  if (!expiresAt) return null
  return Math.ceil((new Date(expiresAt) - Date.now()) / (24 * 60 * 60 * 1000))
}

function expiryColor(days) {
  if (days == null) return '#64748b'
  if (days <= 3) return '#ef4444'
  if (days <= 7) return '#f59e0b'
  return '#64748b'
}

export default function CnhListPage() {
  const navigate = useNavigate()
  const [cnhs, setCnhs] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const load = useCallback(async (search = '') => {
    setLoading(true)
    try { setCnhs(await api.getCnhs(search)) } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(q), 300)
    return () => clearTimeout(t)
  }, [q, load])

  async function handleDelete(id, nome) {
    if (!window.confirm(`Excluir CNH de "${nome}"?`)) return
    setDeletingId(id)
    await api.deleteCnh(id)
    await load(q)
    setDeletingId(null)
  }

  return (
    <Layout>
      <div className="admin-page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>CNH's</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
            {cnhs.length} documento{cnhs.length !== 1 ? 's' : ''} encontrado{cnhs.length !== 1 ? 's' : ''}
            {' · '}expiração automática em 30 dias
          </p>
        </div>
        <button
          onClick={() => navigate('/novo')}
          style={{ background: '#4f8ef7', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          + Nova CNH
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar por nome, CPF ou registro..."
          style={{ width: '100%', maxWidth: 440, background: '#1a1d27', border: '1px solid #2d3748', borderRadius: 8, padding: '11px 16px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
        />
      </div>

      {/* Table */}
      <div className="admin-table-scroll" style={{ background: '#1a1d27', borderRadius: 12, border: '1px solid #2d3748', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2d3748' }}>
              {['Nome', 'CPF', 'Registro', 'Cat.', 'Validade', 'Expira em', 'Ações'].map(h => (
                <th key={h} style={{ padding: '14px 18px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>Carregando...</td></tr>
            )}
            {!loading && cnhs.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>Nenhuma CNH encontrada</td></tr>
            )}
            {cnhs.map((c, i) => (
              <tr
                key={c.id}
                style={{ borderBottom: i < cnhs.length - 1 ? '1px solid #1e2536' : 'none', background: 'transparent' }}
              >
                <td style={{ padding: '14px 18px', color: '#f1f5f9', fontWeight: 500 }}>{c.nome || '—'}</td>
                <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{c.cpf || '—'}</td>
                <td style={{ padding: '14px 18px', color: '#94a3b8', fontFamily: 'monospace' }}>{c.registro || '—'}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ background: '#4f8ef720', color: '#4f8ef7', borderRadius: 6, padding: '3px 10px', fontWeight: 600, fontSize: 12 }}>{c.catHab || '—'}</span>
                </td>
                <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{c.validade || '—'}</td>
                <td style={{ padding: '14px 18px', color: expiryColor(daysUntil(c.expires_at)), fontSize: 12 }}>
                  {formatExpiresAt(c.expires_at)}
                  {daysUntil(c.expires_at) != null && (
                    <span style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                      {daysUntil(c.expires_at) <= 0 ? 'Expirada' : `${daysUntil(c.expires_at)} dia(s)`}
                    </span>
                  )}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/cnhs/${c.id}`)}
                      style={{ background: '#4f8ef720', color: '#4f8ef7', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => navigate(`/cnhs/${c.id}/editar`)}
                      style={{ background: '#f59e0b20', color: '#f59e0b', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.nome)}
                      disabled={deletingId === c.id}
                      style={{ background: '#ef444420', color: '#ef4444', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500, opacity: deletingId === c.id ? 0.5 : 1 }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
