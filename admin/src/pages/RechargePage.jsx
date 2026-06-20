import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import Layout from '../components/Layout.jsx'
import { api } from '../utils/api.js'

function fmt(v) {
  return Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Fallback: gera QR estático com a chave PIX manual
function buildStaticPixPayload(pixKey, pixName, amount, txid) {
  function field(id, value) {
    return `${id}${String(value.length).padStart(2, '0')}${value}`
  }
  const merchantInfo = field('00', 'BR.GOV.BCB.PIX') + field('01', pixKey.slice(0, 77))
  const payload =
    field('00', '01') +
    field('26', merchantInfo) +
    field('52', '0000') +
    field('53', '986') +
    field('54', amount.toFixed(2)) +
    field('58', 'BR') +
    field('59', pixName.slice(0, 25)) +
    field('60', 'SAO PAULO') +
    field('62', field('05', txid.slice(0, 25))) +
    '6304'
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
    crc &= 0xffff
  }
  return payload + crc.toString(16).toUpperCase().padStart(4, '0')
}

const PRESETS = [10, 20, 50, 100, 200, 500]

export default function RechargePage() {
  const [me, setMe] = useState(null)
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState('form')
  const [recharge, setRecharge] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [payStatus, setPayStatus] = useState('pending')
  const [bonus, setBonus] = useState(0)
  const pollRef = useRef(null)

  function loadMe() { api.getMe().then(setMe).catch(() => {}) }
  function loadHistory() { api.getRecharges().then(d => setHistory(d.recharges)).catch(() => {}) }

  useEffect(() => {
    loadMe()
    loadHistory()
    api.getPublicSettings().then(s => setBonus(s.rechargeBonus ?? 0)).catch(() => {})
  }, [])

  // Polling de status automático
  function startPolling(rechargeId) {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.getRechargeStatus(rechargeId)
        if (r.status === 'approved') {
          setPayStatus('approved')
          clearInterval(pollRef.current)
          loadMe()
          loadHistory()
        } else if (r.status === 'rejected' || r.status === 'cancelled') {
          setPayStatus('rejected')
          clearInterval(pollRef.current)
        }
      } catch (_) {}
    }, 4000)
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  async function requestRecharge() {
    const val = parseFloat(String(amount).replace(',', '.'))
    if (!val || val < 10) { setError('Valor mínimo é R$ 10,00'); return }
    setError(''); setLoading(true)
    try {
      const r = await api.createRecharge(val)
      let qrUrl = ''

      if (r.mpEnabled && r.qrCodeBase64) {
        // QR real do Mercado Pago
        qrUrl = `data:image/png;base64,${r.qrCodeBase64}`
      } else {
        // Fallback: gera QR estático com chave PIX manual
        const payload = buildStaticPixPayload(
          r.pixKey || 'cnh@admin.com',
          r.pixName || 'CNH Admin',
          val,
          r.id.replace(/-/g, '').slice(0, 25)
        )
        qrUrl = await QRCode.toDataURL(payload, { width: 240, margin: 2 })
        r.qrCode = payload
      }

      setRecharge(r)
      setQrDataUrl(qrUrl)
      setPayStatus('pending')
      setStep('qr')
      loadHistory()
      startPolling(r.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function copyPix() {
    const code = recharge?.qrCode
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const statusColor = { pending: '#f59e0b', approved: '#34d399', rejected: '#f87171' }
  const statusLabel = { pending: 'Aguardando pagamento', approved: 'Pago e aprovado!', rejected: 'Cancelado' }

  return (
    <Layout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Recarregar Saldo</h1>
          <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>Adicione créditos via PIX para criar CNHs</p>
        </div>

        {/* Saldo atual */}
        {me && (
          <div style={{ background: 'linear-gradient(135deg, #1a2e1a, #162216)', border: '1px solid #34d39940', borderRadius: 14, padding: '20px 24px', marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Seu saldo atual</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#34d399', marginTop: 4 }}>{fmt(me.saldo)}</div>
            </div>
            <div style={{ fontSize: 40 }}>💳</div>
          </div>
        )}

        {step === 'form' && (
          <div style={{ background: '#1a1d27', borderRadius: 14, border: '1px solid #2d3748', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Escolha o valor</h2>
              {bonus > 0 && (
                <span style={{ background: '#16a34a20', border: '1px solid #16a34a40', color: '#34d399', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                  🎁 +{bonus}% de bônus em toda recarga!
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {PRESETS.map(p => {
                const total = bonus > 0 ? +(p * (1 + bonus / 100)).toFixed(2) : null
                return (
                  <button key={p} onClick={() => setAmount(String(p))} style={{
                    background: String(amount) === String(p) ? '#4f8ef7' : '#0f1117',
                    border: `1px solid ${String(amount) === String(p) ? '#4f8ef7' : '#2d3748'}`,
                    borderRadius: 10, padding: '12px 8px',
                    color: String(amount) === String(p) ? '#fff' : '#94a3b8',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', lineHeight: 1.4,
                  }}>
                    <div>{fmt(p)}</div>
                    {total && <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>→ {fmt(total)} no saldo</div>}
                  </button>
                )
              })}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ou digite outro valor (mín. R$ 10)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 14 }}>R$</span>
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^\d,.]/, ''))}
                  placeholder="0,00"
                  style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 8, padding: '12px 14px 12px 38px', color: '#e2e8f0', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <button
              onClick={requestRecharge}
              disabled={loading || !amount}
              style={{ width: '100%', background: '#4f8ef7', border: 'none', borderRadius: 10, padding: '14px 0', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: (loading || !amount) ? 0.5 : 1 }}
            >
              {loading ? 'Gerando PIX...' : '⚡ Gerar QR Code PIX'}
            </button>
          </div>
        )}

        {step === 'qr' && recharge && (
          <div style={{ background: '#1a1d27', borderRadius: 14, border: '1px solid #2d3748', padding: 28, textAlign: 'center' }}>

            {/* Status badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${statusColor[payStatus]}15`, border: `1px solid ${statusColor[payStatus]}40`, borderRadius: 99, padding: '6px 16px', marginBottom: 20 }}>
              {payStatus === 'pending' && <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} />}
              {payStatus === 'approved' && '✓ '}
              {payStatus === 'rejected' && '✗ '}
              <span style={{ color: statusColor[payStatus], fontSize: 13, fontWeight: 600 }}>{statusLabel[payStatus]}</span>
            </div>

            {payStatus === 'approved' ? (
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>Pagamento confirmado!</div>
                <div style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>{fmt(recharge.amount)} foram adicionados ao seu saldo automaticamente.</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginTop: 16 }}>{me && fmt(me.saldo)}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>saldo atual</div>
                <button onClick={() => { setStep('form'); setAmount('') }} style={{ marginTop: 20, background: '#4f8ef7', border: 'none', borderRadius: 8, padding: '10px 28px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Nova recarga
                </button>
              </div>
            ) : payStatus === 'rejected' ? (
              <div style={{ padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f87171', marginBottom: 8 }}>Pagamento cancelado ou expirado</div>
                <button onClick={() => { setStep('form'); setAmount('') }} style={{ background: '#2d3748', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#94a3b8', fontSize: 14, cursor: 'pointer' }}>
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 2 }}>Escaneie ou copie o código PIX</div>
                <div style={{ color: '#64748b', fontSize: 12, marginBottom: 20 }}>O saldo será creditado automaticamente após a confirmação</div>

                <div style={{ display: 'inline-block', background: '#fff', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                  {qrDataUrl && <img src={qrDataUrl} alt="PIX QR Code" style={{ display: 'block', width: 220, height: 220 }} />}
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, color: '#4f8ef7', marginBottom: 2 }}>{fmt(recharge.amount)}</div>
                {bonus > 0 && (
                  <div style={{ fontSize: 13, color: '#34d399', fontWeight: 600, marginBottom: 6 }}>
                    🎁 +{bonus}% bônus → <strong>{fmt(+(recharge.amount * (1 + bonus / 100)).toFixed(2))}</strong> no saldo
                  </div>
                )}

                {recharge.qrCode && (
                  <div style={{ background: '#0f1117', border: '1px solid #2d3748', borderRadius: 8, padding: '10px 14px', margin: '0 auto 16px', maxWidth: 420, wordBreak: 'break-all', fontSize: 11, color: '#64748b', textAlign: 'left', lineHeight: 1.6 }}>
                    {recharge.qrCode.slice(0, 60)}...
                  </div>
                )}

                <button onClick={copyPix} style={{ background: copied ? '#16a34a' : '#2d3748', border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontSize: 13, cursor: 'pointer', marginBottom: 16, fontWeight: 600, display: 'block', margin: '0 auto 16px' }}>
                  {copied ? '✓ Copiado!' : '📋 Copiar código PIX'}
                </button>

                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 16 }}>
                  {recharge.expiresAt && `Expira em: ${new Date(recharge.expiresAt).toLocaleString('pt-BR')}`}
                </div>

                <button onClick={() => { setStep('form'); setAmount(''); clearInterval(pollRef.current) }} style={{ background: 'transparent', border: '1px solid #2d3748', borderRadius: 8, padding: '8px 20px', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
                  ← Voltar
                </button>
              </>
            )}
          </div>
        )}

        {/* Histórico */}
        {history.length > 0 && (
          <div style={{ marginTop: 28, background: '#1a1d27', borderRadius: 14, border: '1px solid #2d3748' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d3748', fontWeight: 600, color: '#f1f5f9', fontSize: 15 }}>
              Histórico de recargas
            </div>
            {history.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #1e2536' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{fmt(r.amount)}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{new Date(r.created_at).toLocaleString('pt-BR')}</div>
                </div>
                <span style={{ background: `${statusColor[r.status] ?? '#94a3b8'}20`, color: statusColor[r.status] ?? '#94a3b8', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                  {({ pending: 'Aguardando', approved: 'Aprovado', rejected: 'Cancelado' })[r.status] ?? r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </Layout>
  )
}
