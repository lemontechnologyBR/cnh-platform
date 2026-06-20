import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './auth.js'
import { getAllCnhs, getCnhById, createCnh, updateCnh, deleteCnh, getUserById, debitUser, getSettings } from '../db.js'

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

router.get('/', auth, async (req, res) => {
  const { q } = req.query
  // superadmin vê todas; operator vê só as suas
  const userId = req.user.role === 'superadmin' ? null : req.user.id
  let list = await getAllCnhs(userId)
  if (q) {
    const term = q.toLowerCase()
    list = list.filter(c =>
      (c.nome || '').toLowerCase().includes(term) ||
      (c.cpf || '').toLowerCase().includes(term) ||
      (c.registro || '').toLowerCase().includes(term)
    )
  }
  res.json(list)
})

router.get('/stats', auth, async (req, res) => {
  const userId = req.user.role === 'superadmin' ? null : req.user.id
  const all = await getAllCnhs(userId)
  const today = new Date().toISOString().slice(0, 10)
  const createdToday = all.filter(c => c.created_at?.startsWith(today)).length
  const user = getUserById(req.user.id)
  res.json({ total: all.length, createdToday, saldo: user?.saldo ?? 0 })
})

router.get('/:id', auth, async (req, res) => {
  const cnh = await getCnhById(req.params.id)
  if (!cnh) return res.status(404).json({ error: 'Não encontrado' })
  res.json(cnh)
})

function randDigits(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')
}

router.post('/', auth, async (req, res) => {
  // Verifica saldo (operadores pagam por CNH; superadmin é gratuito)
  if (req.user.role !== 'superadmin') {
    const settings = getSettings()
    const price = settings.priceCnh ?? 10
    const user = getUserById(req.user.id)
    if (!user || (user.saldo ?? 0) < price) {
      return res.status(402).json({ error: `Saldo insuficiente. Criação custa R$ ${price.toFixed(2)}.` })
    }
    await debitUser(req.user.id, price, 'Criação de CNH')
  }

  const body = { ...req.body, createdBy: req.user.id }
  if (!body.numero) body.numero = randDigits(10)
  if (!body.certA)  body.certA  = randDigits(11)
  if (!body.certB)  body.certB  = 'SP' + randDigits(9)
  if (!body.nacionalidade) body.nacionalidade = 'BRASILEIRO(A)'
  const cnh = await createCnh(body)
  res.status(201).json(cnh)
})

router.put('/:id', auth, async (req, res) => {
  const cnh = await updateCnh(req.params.id, req.body)
  if (!cnh) return res.status(404).json({ error: 'Não encontrado' })
  res.json(cnh)
})

router.delete('/:id', auth, async (req, res) => {
  const ok = await deleteCnh(req.params.id)
  if (!ok) return res.status(404).json({ error: 'Não encontrado' })
  res.json({ ok: true })
})

export default router
