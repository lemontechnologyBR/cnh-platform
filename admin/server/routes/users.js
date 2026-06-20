import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './auth.js'
import {
  getAllUsers, getUserById, createUser, updateUser, deleteUser,
  getUserWallet, creditUser, debitUser, getSettings, saveSettings,
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

function superadmin(req, res, next) {
  if (req.user.role !== 'superadmin')
    return res.status(403).json({ error: 'Acesso restrito ao administrador' })
  next()
}

// GET /api/users  — lista operadores (superadmin)
router.get('/', auth, superadmin, (req, res) => {
  res.json(getAllUsers())
})

// GET /api/users/me  — dados do usuário logado
router.get('/me', auth, (req, res) => {
  const user = getUserById(req.user.id)
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' })
  const { passwordHash, ...safe } = user
  res.json(safe)
})

// POST /api/users  — criar operador (superadmin)
router.post('/', auth, superadmin, async (req, res) => {
  const { username, password, nome, role } = req.body
  if (!username || !password)
    return res.status(400).json({ error: 'username e password obrigatórios' })
  const user = await createUser({ username, password, nome, role })
  res.status(201).json(user)
})

// PUT /api/users/:id  — atualizar operador (superadmin)
router.put('/:id', auth, superadmin, async (req, res) => {
  const user = await updateUser(req.params.id, req.body)
  if (!user) return res.status(404).json({ error: 'Não encontrado' })
  res.json(user)
})

// DELETE /api/users/:id  — remover operador (superadmin)
router.delete('/:id', auth, superadmin, async (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ error: 'Não é possível excluir a própria conta' })
  const ok = await deleteUser(req.params.id)
  if (!ok) return res.status(404).json({ error: 'Não encontrado' })
  res.json({ ok: true })
})

// GET /api/users/:id/wallet  — carteira + histórico (superadmin)
router.get('/:id/wallet', auth, superadmin, (req, res) => {
  const w = getUserWallet(req.params.id)
  if (!w) return res.status(404).json({ error: 'Não encontrado' })
  res.json(w)
})

// POST /api/users/:id/creditar  (superadmin)
router.post('/:id/creditar', auth, superadmin, async (req, res) => {
  const { amount, descricao } = req.body
  if (!amount || isNaN(amount) || +amount <= 0)
    return res.status(400).json({ error: 'Valor inválido' })
  const tx = await creditUser(req.params.id, +amount, descricao)
  if (!tx) return res.status(404).json({ error: 'Usuário não encontrado' })
  res.json(tx)
})

// POST /api/users/:id/debitar  (superadmin)
router.post('/:id/debitar', auth, superadmin, async (req, res) => {
  const { amount, descricao } = req.body
  if (!amount || isNaN(amount) || +amount <= 0)
    return res.status(400).json({ error: 'Valor inválido' })
  const result = await debitUser(req.params.id, +amount, descricao)
  if (!result) return res.status(404).json({ error: 'Usuário não encontrado' })
  if (result.error) return res.status(400).json(result)
  res.json(result)
})

// GET /api/users/settings  — configurações (superadmin)
router.get('/settings', auth, superadmin, (req, res) => {
  res.json(getSettings())
})

// PUT /api/users/settings  — salvar configurações (superadmin)
router.put('/settings', auth, superadmin, async (req, res) => {
  const s = await saveSettings(req.body)
  res.json(s)
})

export default router
