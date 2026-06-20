import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { api } from '../utils/api.js'

function fmt(v) {
  return Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const ROLE_LABEL = { superadmin: 'Super Admin', operator: 'Operador' }

function UserModal({ user, onClose, onDone }) {
  const isNew = !user
  const [form, setForm] = useState(
    user
      ? { username: user.username, role: user.role, password: '' }
      : { username: '', role: 'operator', password: '' }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (isNew) await api.createUser(payload)
      else await api.updateUser(user.id, payload)
      onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#161210', borderRadius: 16, width: '100%', maxWidth: 440, margin: '16px', border: '1px solid #3a2820', padding: 28 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#f1f5f9', marginBottom: 20, fontWeight: 700 }}>{isNew ? 'Novo Operador' : 'Editar Operador'}</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'username', label: 'Usuário', placeholder: 'login' },
            { key: 'password', label: isNew ? 'Senha' : 'Nova senha (opcional)', placeholder: '••••••', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</label>
              <input
                type={f.type || 'text'}
                value={form[f.key] || ''}
                onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                required={f.key !== 'password' || isNew}
                style={{ width: '100%', background: '#0a0908', border: '1px solid #3a2820', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Função</label>
            <select
              value={form.role}
              onChange={e => setForm(s => ({ ...s, role: e.target.value }))}
              style={{ width: '100%', background: '#0a0908', border: '1px solid #3a2820', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
            >
              <option value="operator">Operador</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #3a2820', borderRadius: 8, padding: '10px 0', color: '#64748b', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ flex: 1, background: '#FF6B00', border: 'none', borderRadius: 8, padding: '10px 0', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function WalletModal({ user, onClose, onDone }) {
  const [tab, setTab] = useState('historico')
  const [amount, setAmount] = useState('')
  const [descricao, setDescricao] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [wallet, setWallet] = useState(null)

  function loadWallet() {
    api.getUserWallet(user.id).then(setWallet).catch(() => {})
  }

  useEffect(() => { loadWallet() }, [user.id])

  async function submit(tipo) {
    const val = parseFloat(amount.replace(',', '.'))
    if (!val || val <= 0) { setError('Valor inválido'); return }
    setError(''); setLoading(true)
    try {
      if (tipo === 'credito') await api.creditarUser(user.id, val, descricao || 'Crédito manual')
      else await api.debitarUser(user.id, val, descricao || 'Débito manual')
      setAmount(''); setDescricao('')
      loadWallet()
      onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="admin-modal-panel" style={{ background: '#161210', borderRadius: 16, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #3a2820' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #3a2820', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>@{user.username}</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{ROLE_LABEL[user.role]}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#34d399' }}>{fmt(wallet?.saldo ?? user.saldo)}</div>
            <div style={{ color: '#64748b', fontSize: 11 }}>saldo atual</div>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #3a2820', flexShrink: 0 }}>
          {['historico', 'creditar', 'debitar'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              flex: 1, background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? '#FF6B00' : 'transparent'}`,
              color: tab === t ? '#FF6B00' : '#64748b', padding: '12px 0', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
            }}>
              {t === 'historico' ? 'Histórico' : t === 'creditar' ? '+ Creditar' : '− Debitar'}
            </button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
          {tab === 'historico' && (
            !wallet
              ? <div style={{ textAlign: 'center', color: '#475569', padding: 24 }}>Carregando...</div>
              : wallet.transactions.length === 0
                ? <div style={{ textAlign: 'center', color: '#475569', padding: 24, fontSize: 14 }}>Nenhuma transação ainda</div>
                : wallet.transactions.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #221816', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: '#e2e8f0', marginBottom: 3 }}>{tx.descricao}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>{new Date(tx.created_at).toLocaleString('pt-BR')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: tx.tipo === 'credito' ? '#34d399' : '#f87171', fontSize: 14 }}>
                        {tx.tipo === 'credito' ? '+' : '−'} {fmt(tx.amount)}
                      </div>
                      <div style={{ fontSize: 10, color: '#475569' }}>saldo: {fmt(tx.saldo_depois)}</div>
                    </div>
                  </div>
                ))
          )}

          {(tab === 'creditar' || tab === 'debitar') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Valor (R$)</label>
                <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d,.]/, ''))} placeholder="0,00"
                  style={{ width: '100%', background: '#0a0908', border: '1px solid #3a2820', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 16, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Descrição (opcional)</label>
                <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder={tab === 'creditar' ? 'Recarga, Bônus...' : 'Desconto, Taxa...'}
                  style={{ width: '100%', background: '#0a0908', border: '1px solid #3a2820', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              {error && <div style={{ color: '#f87171', fontSize: 13 }}>{error}</div>}
              <button onClick={() => submit(tab)} disabled={loading} style={{
                background: tab === 'creditar' ? '#16a34a' : '#dc2626', border: 'none', borderRadius: 8, padding: '12px 0',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'Aguarde...' : tab === 'creditar' ? '+ Creditar' : '− Debitar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [editUser, setEditUser] = useState(null)
  const [walletUser, setWalletUser] = useState(null)
  const [showNew, setShowNew] = useState(false)

  function load() {
    api.getUsers().then(setUsers).catch(() => {})
  }

  useEffect(() => { load() }, [])

  async function remove(u) {
    if (!confirm(`Excluir operador "${u.username}"?`)) return
    await api.deleteUser(u.id)
    load()
  }

  const totalSaldo = users.reduce((s, u) => s + (u.saldo ?? 0), 0)

  return (
    <Layout>
      {showNew && <UserModal onClose={() => setShowNew(false)} onDone={() => { setShowNew(false); load() }} />}
      {editUser && <UserModal user={editUser} onClose={() => setEditUser(null)} onDone={() => { setEditUser(null); load() }} />}
      {walletUser && <WalletModal user={walletUser} onClose={() => { setWalletUser(null); load() }} onDone={load} />}

      <div className="admin-page-header admin-page-header--center">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Operadores</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Gerencie usuários e carteiras</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ background: '#FF6B00', border: 'none', borderRadius: 8, padding: '10px 20px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          + Novo Operador
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stat-row" style={{ marginBottom: 24 }}>
        <div style={{ background: '#161210', borderRadius: 12, padding: '18px 22px', border: '1px solid #3a2820', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Total de operadores</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#FF6B00' }}>{users.length}</div>
        </div>
        <div style={{ background: '#161210', borderRadius: 12, padding: '18px 22px', border: '1px solid #3a2820', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Saldo total em carteiras</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#34d399' }}>{fmt(totalSaldo)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-data-grid-wrap" style={{ background: '#161210', borderRadius: 12, border: '1px solid #3a2820' }}>
        <div className="admin-grid-users admin-grid-header" style={{ display: 'grid', padding: '10px 20px', fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #3a2820' }}>
          <span>Operador</span>
          <span>Função</span>
          <span style={{ textAlign: 'right' }}>Saldo</span>
          <span style={{ textAlign: 'center' }}>Carteira</span>
          <span style={{ textAlign: 'center' }}>Ações</span>
        </div>

        {users.length === 0
          ? <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569', fontSize: 14 }}>Nenhum operador cadastrado</div>
          : users.map(u => (
            <div key={u.id} className="admin-grid-users" style={{ display: 'grid', padding: '14px 20px', borderBottom: '1px solid #221816' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>@{u.username}</div>
              </div>
              <div>
                <span style={{ background: u.role === 'superadmin' ? '#FF6B0020' : '#a78bfa20', color: u.role === 'superadmin' ? '#FF6B00' : '#a78bfa', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  {ROLE_LABEL[u.role] || u.role}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: (u.saldo ?? 0) > 0 ? '#34d399' : '#64748b' }}>
                {fmt(u.saldo)}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setWalletUser(u)} style={{ background: '#34d39920', border: '1px solid #34d39940', borderRadius: 7, padding: '6px 12px', color: '#34d399', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                  💳 Carteira
                </button>
              </div>
              <div style={{ textAlign: 'center', display: 'flex', gap: 6, justifyContent: 'center' }}>
                <button onClick={() => setEditUser(u)} style={{ background: '#FF6B0020', border: '1px solid #FF6B0040', borderRadius: 7, padding: '6px 10px', color: '#FF6B00', fontSize: 12, cursor: 'pointer' }}>Editar</button>
                <button onClick={() => remove(u)} style={{ background: '#dc262620', border: '1px solid #dc262640', borderRadius: 7, padding: '6px 10px', color: '#f87171', fontSize: 12, cursor: 'pointer' }}>Excluir</button>
              </div>
            </div>
          ))
        }
      </div>
    </Layout>
  )
}
