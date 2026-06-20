import { useEffect, useState } from 'react'
import Layout from '../components/Layout.jsx'
import { api } from '../utils/api.js'

function fmt(v) {
  return Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const STATUS_COLOR = { pending: '#f59e0b', approved: '#34d399', rejected: '#f87171' }
const STATUS_LABEL = { pending: 'Aguardando', approved: 'Aprovado', rejected: 'Rejeitado' }

export default function RechargesAdminPage() {
  const [data, setData] = useState({ recharges: [], pending: 0 })
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState({})
  const [settings, setSettings] = useState(null)
  const [editSettings, setEditSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState({})
  const [savingSettings, setSavingSettings] = useState(false)

  function load() {
    api.getRecharges().then(setData).catch(() => {})
    api.getSettings().then(s => { setSettings(s); setSettingsForm(s) }).catch(() => {})
  }

  useEffect(() => { load() }, [])

  async function act(id, action) {
    setLoading(l => ({ ...l, [id]: action }))
    try {
      if (action === 'approve') await api.approveRecharge(id)
      else await api.rejectRecharge(id)
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(l => ({ ...l, [id]: null }))
    }
  }

  async function saveSettingsHandler() {
    setSavingSettings(true)
    try {
      await api.saveSettings(settingsForm)
      setSettings(settingsForm)
      setEditSettings(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSavingSettings(false)
    }
  }

  const list = data.recharges.filter(r => filter === 'all' || r.status === filter)
  const totalPending = data.recharges.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0)

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Recargas PIX</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Aprove ou rejeite solicitações de recarga</p>
        </div>
        <button
          onClick={() => setEditSettings(v => !v)}
          style={{ background: '#1a1d27', border: '1px solid #2d3748', borderRadius: 8, padding: '9px 18px', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
        >
          ⚙ Configurar PIX
        </button>
      </div>

      {/* Settings panel */}
      {editSettings && settings && (
        <div style={{ background: '#1a1d27', border: '1px solid #4f8ef740', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>Configurações PIX</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 14, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chave PIX</label>
              <input
                value={settingsForm.pixKey || ''}
                onChange={e => setSettingsForm(s => ({ ...s, pixKey: e.target.value }))}
                placeholder="email@exemplo.com ou CPF"
                style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nome no PIX</label>
              <input
                value={settingsForm.pixName || ''}
                onChange={e => setSettingsForm(s => ({ ...s, pixName: e.target.value }))}
                placeholder="Nome do recebedor"
                style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preço CNH (R$)</label>
            <input
              type="number"
              value={settingsForm.priceCnh ?? 50}
              onChange={e => setSettingsForm(s => ({ ...s, priceCnh: +e.target.value }))}
              style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bônus de recarga (%)</label>
            <input
              type="number"
              min="0"
              max="1000"
              value={settingsForm.rechargeBonus ?? 50}
              onChange={e => setSettingsForm(s => ({ ...s, rechargeBonus: +e.target.value }))}
              style={{ width: '100%', background: '#0f1117', border: `1px solid ${(settingsForm.rechargeBonus ?? 0) > 0 ? '#34d39840' : '#2d3748'}`, borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
              {(settingsForm.rechargeBonus ?? 0) > 0
                ? `✓ Recarga de R$ 50 → credita R$ ${(50 * (1 + (settingsForm.rechargeBonus ?? 0) / 100)).toFixed(2)}`
                : 'Sem bônus (0%)'}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Access Token Mercado Pago</label>
            <input
              value={settingsForm.mpAccessToken || ''}
              onChange={e => setSettingsForm(s => ({ ...s, mpAccessToken: e.target.value }))}
              placeholder="APP_USR-... (produção) ou TEST-... (testes)"
              type="password"
              style={{ width: '100%', background: '#0f1117', border: `1px solid ${settingsForm.mpAccessToken ? '#34d39840' : '#2d3748'}`, borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }}
            />
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
              Obtenha em: <a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noreferrer" style={{ color: '#4f8ef7' }}>mercadopago.com.br/developers</a> · Webhook URL: <code style={{ color: '#94a3b8' }}>{window.location.origin.replace('5174', '3001')}/api/recharges/webhook</code>
            </div>
            </div>
          </div>
          <button
            onClick={saveSettingsHandler}
            disabled={savingSettings}
            style={{ marginTop: 14, background: '#4f8ef7', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: savingSettings ? 0.6 : 1 }}
          >
            {savingSettings ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#1a1d27', borderRadius: 12, padding: '18px 22px', border: '1px solid #f59e0b40', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Pendentes</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#f59e0b' }}>{data.pending}</div>
        </div>
        <div style={{ background: '#1a1d27', borderRadius: 12, padding: '18px 22px', border: '1px solid #2d3748', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Valor pendente</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#f59e0b' }}>{fmt(totalPending)}</div>
        </div>
        <div style={{ background: '#1a1d27', borderRadius: 12, padding: '18px 22px', border: '1px solid #2d3748', flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Total de recargas</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#4f8ef7' }}>{data.recharges.length}</div>
        </div>
        {settings && (
          <div style={{ background: '#1a1d27', borderRadius: 12, padding: '18px 22px', border: '1px solid #2d3748', flex: 1 }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Preço por CNH</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#a78bfa' }}>{fmt(settings.priceCnh)}</div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, background: '#1a1d27', borderRadius: '10px 10px 0 0', border: '1px solid #2d3748', borderBottom: 'none' }}>
        {[['pending', 'Pendentes'], ['approved', 'Aprovadas'], ['rejected', 'Rejeitadas'], ['all', 'Todas']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            flex: 1, background: 'none', border: 'none',
            borderBottom: `2px solid ${filter === v ? '#4f8ef7' : 'transparent'}`,
            color: filter === v ? '#4f8ef7' : '#64748b', padding: '12px 0',
            cursor: 'pointer', fontSize: 13, fontWeight: filter === v ? 600 : 400,
          }}>
            {l}
            {v === 'pending' && data.pending > 0 && (
              <span style={{ background: '#f59e0b', color: '#000', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>
                {data.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#1a1d27', borderRadius: '0 0 12px 12px', border: '1px solid #2d3748' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 130px 120px 180px', padding: '10px 20px', fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #2d3748' }}>
          <span>Operador</span>
          <span>Valor</span>
          <span>Status</span>
          <span>Pagamento MP</span>
          <span>Data</span>
          <span style={{ textAlign: 'center' }}>Ações</span>
        </div>

        {list.length === 0
          ? <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569', fontSize: 14 }}>Nenhuma recarga {filter !== 'all' ? STATUS_LABEL[filter]?.toLowerCase() : ''}</div>
          : list.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 130px 120px 180px', padding: '14px 20px', borderBottom: '1px solid #1e2536', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{r.userName}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>{fmt(r.amount)}</div>
              <div>
                <span style={{ background: `${STATUS_COLOR[r.status]}20`, color: STATUS_COLOR[r.status], borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                  {STATUS_LABEL[r.status]}
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace' }}>
                {r.mpPaymentId
                  ? <a href={`https://www.mercadopago.com.br/activities/detail?id=${r.mpPaymentId}`} target="_blank" rel="noreferrer" style={{ color: '#4f8ef7' }}>#{r.mpPaymentId}</a>
                  : <span style={{ color: '#2d3748' }}>manual</span>}
              </div>
              <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(r.created_at).toLocaleString('pt-BR')}</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {r.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => act(r.id, 'approve')}
                      disabled={!!loading[r.id]}
                      style={{ background: '#16a34a20', border: '1px solid #16a34a40', borderRadius: 7, padding: '6px 12px', color: '#34d399', fontSize: 12, cursor: 'pointer', fontWeight: 600, opacity: loading[r.id] ? 0.5 : 1 }}
                    >
                      {loading[r.id] === 'approve' ? '...' : '✓ Aprovar'}
                    </button>
                    <button
                      onClick={() => act(r.id, 'reject')}
                      disabled={!!loading[r.id]}
                      style={{ background: '#dc262620', border: '1px solid #dc262640', borderRadius: 7, padding: '6px 12px', color: '#f87171', fontSize: 12, cursor: 'pointer', fontWeight: 600, opacity: loading[r.id] ? 0.5 : 1 }}
                    >
                      {loading[r.id] === 'reject' ? '...' : '✗ Rejeitar'}
                    </button>
                  </>
                ) : (
                  <span style={{ color: '#475569', fontSize: 12 }}>—</span>
                )}
              </div>
            </div>
          ))
        }
      </div>
    </Layout>
  )
}
