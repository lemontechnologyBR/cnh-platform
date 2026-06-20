import 'dotenv/config'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { JWT_SECRET } from './auth.js'
import {
  getAllRecharges, getRechargeById,
  createRecharge, approveRecharge, rejectRecharge,
  getUserById, getSettings, db,
} from '../db.js'

const router = Router()

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Token ausente' })
  try {
    req.user = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

function getMpClient() {
  const settings = getSettings()
  const token = process.env.MP_ACCESS_TOKEN || settings.mpAccessToken
  if (!token || token === 'SEU_ACCESS_TOKEN_AQUI') return null
  return new MercadoPagoConfig({ accessToken: token })
}

// Cria pagamento PIX no Mercado Pago
async function createMpPayment(user, amount) {
  const client = getMpClient()
  if (!client) return null

  const payment = new Payment(client)
  const result = await payment.create({
    body: {
      transaction_amount: amount,
      description: `Recarga de saldo - ${user.nome || user.username}`,
      payment_method_id: 'pix',
      payer: {
        email: user.email || `${user.username}@cnh.admin`,
        first_name: (user.nome || user.username).split(' ')[0],
        last_name: (user.nome || user.username).split(' ').slice(1).join(' ') || 'Operador',
      },
    },
  })

  return {
    mpPaymentId: String(result.id),
    qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
    qrCode: result.point_of_interaction?.transaction_data?.qr_code ?? null,
    status: result.status,
    expiresAt: result.date_of_expiration,
  }
}

// GET /api/recharges
router.get('/', auth, (req, res) => {
  const userId = req.user.role === 'superadmin' ? null : req.user.id
  const list = getAllRecharges(userId).slice().reverse()
  const enriched = list.map(r => {
    const user = getUserById(r.userId)
    return { ...r, userName: user?.nome || user?.username || '—' }
  })
  const pending = enriched.filter(r => r.status === 'pending').length
  res.json({ recharges: enriched, pending })
})

// GET /api/recharges/:id/status  — polling de status do pagamento
router.get('/:id/status', auth, async (req, res) => {
  const r = getRechargeById(req.params.id)
  if (!r) return res.status(404).json({ error: 'Não encontrado' })

  // Se já foi processado, retorna direto
  if (r.status === 'approved' || r.status === 'rejected') return res.json(r)

  // Se tem mpPaymentId, consulta o MP
  if (r.mpPaymentId) {
    const client = getMpClient()
    if (client) {
      try {
        const payment = new Payment(client)
        const mp = await payment.get({ id: r.mpPaymentId })
        if (mp.status === 'approved' && r.status !== 'approved') {
          const updated = await approveRecharge(r.id)
          return res.json(updated)
        }
        if (mp.status === 'cancelled' && r.status === 'pending') {
          const updated = await rejectRecharge(r.id)
          return res.json(updated)
        }
      } catch (_) {}
    }
  }

  res.json(r)
})

// POST /api/recharges  — operador solicita recarga
router.post('/', auth, async (req, res) => {
  const { amount } = req.body
  const val = parseFloat(amount)
  if (!val || val < 10) return res.status(400).json({ error: 'Valor mínimo é R$ 10,00' })

  const user = getUserById(req.user.id)
  const settings = getSettings()

  // Tenta criar pagamento no MP
  let mpData = null
  try {
    mpData = await createMpPayment(user, val)
  } catch (e) {
    console.error('Erro MP:', e?.message)
  }

  const r = await createRecharge(req.user.id, val, mpData)

  res.status(201).json({
    ...r,
    pixKey: settings.pixKey,
    pixName: settings.pixName,
    mpEnabled: !!mpData,
  })
})

// POST /api/recharges/:id/approve  — aprovação manual (fallback)
router.post('/:id/approve', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Restrito ao admin' })
  const result = await approveRecharge(req.params.id)
  if (!result) return res.status(404).json({ error: 'Não encontrado' })
  if (result.error) return res.status(400).json(result)
  res.json(result)
})

// POST /api/recharges/:id/reject  — rejeição manual (fallback)
router.post('/:id/reject', auth, async (req, res) => {
  if (req.user.role !== 'superadmin') return res.status(403).json({ error: 'Restrito ao admin' })
  const result = await rejectRecharge(req.params.id)
  if (!result) return res.status(404).json({ error: 'Não encontrado' })
  if (result.error) return res.status(400).json(result)
  res.json(result)
})

// POST /api/webhooks/mp  — webhook automático do Mercado Pago
router.post('/webhook', async (req, res) => {
  res.sendStatus(200) // responde 200 imediatamente para o MP

  try {
    const { type, data } = req.body
    if (type !== 'payment' || !data?.id) return

    const client = getMpClient()
    if (!client) return

    const payment = new Payment(client)
    const mp = await payment.get({ id: data.id })

    if (mp.status === 'approved') {
      const recharge = getAllRecharges().find(r => r.mpPaymentId === String(data.id))
      if (recharge && recharge.status === 'pending') {
        await approveRecharge(recharge.id)
        console.log(`✓ Recarga ${recharge.id} aprovada automaticamente via webhook MP`)
      }
    }
  } catch (e) {
    console.error('Webhook MP erro:', e?.message)
  }
})

export default router
