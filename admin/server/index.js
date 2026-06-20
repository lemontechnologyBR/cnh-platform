import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import authRouter, { JWT_SECRET } from './routes/auth.js'
import cnhsRouter from './routes/cnhs.js'
import usersRouter from './routes/users.js'
import rechargesRouter from './routes/recharges.js'
import { findCnhByCpf, findCnhByCpfAndRegistro, getCnhById, isCnhExpired, deleteCnh, getSettings, CNH_TTL_DAYS } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8080', 'http://127.0.0.1:8080']

app.use(cors({ origin: corsOrigins }))
app.use(express.json({ limit: '15mb' }))

app.use('/api/auth',      authRouter)
app.use('/api/cnhs',      cnhsRouter)
app.use('/api/users',     usersRouter)
app.use('/api/recharges', rechargesRouter)
// Webhook MP: POST https://seudominio.com/api/recharges/webhook

// Verifica se CPF existe no banco (etapa 1 do login — antes da chave de acesso)
app.post('/api/public/check-cpf', async (req, res) => {
  const { cpf } = req.body
  if (!cpf) return res.status(400).json({ error: 'CPF obrigatório' })
  const digits = String(cpf).replace(/\D/g, '')
  if (digits.length !== 11) return res.status(400).json({ error: 'CPF inválido' })

  const cnh = await findCnhByCpf(cpf)
  if (!cnh) return res.status(404).json({ error: 'CPF não cadastrado no sistema.' })
  if (isCnhExpired(cnh)) {
    await deleteCnh(cnh.id)
    return res.status(401).json({ error: 'CNH expirada. Solicite uma nova ao operador.' })
  }
  if (!cnh.pin) return res.status(401).json({ error: 'Sem PIN cadastrado.' })
  res.json({ ok: true })
})

// Rota pública — usada pelo app CNH Digital (5173)
app.post('/api/public/login', async (req, res) => {
  const { cpf } = req.body
  if (!cpf) return res.status(400).json({ error: 'CPF obrigatório' })
  const cnh = await findCnhByCpf(cpf)
  if (!cnh) return res.status(401).json({ error: 'CPF não encontrado' })
  if (isCnhExpired(cnh)) {
    await deleteCnh(cnh.id)
    return res.status(401).json({ error: 'CNH expirada. Solicite uma nova ao operador.' })
  }
  if (!cnh.pin) return res.status(401).json({ error: 'Sem PIN cadastrado.' })
  const pin = req.body.pin || req.body.numero
  if (!pin || pin !== cnh.pin) return res.status(401).json({ error: 'PIN incorreto' })
  const token = jwt.sign({ cnhId: cnh.id }, JWT_SECRET, { expiresIn: `${CNH_TTL_DAYS}d` })
  const { pin: _pin, ...cnhSafe } = cnh
  res.json({ token, cnh: cnhSafe })
})

// Dados atualizados da CNH logada (app CNH Digital)
app.get('/api/public/cnh', async (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Sessão inválida' })
  try {
    const { cnhId } = jwt.verify(header.slice(7), JWT_SECRET)
    const cnh = await getCnhById(cnhId)
    if (!cnh) return res.status(404).json({ error: 'CNH não encontrada' })
    if (isCnhExpired(cnh)) {
      await deleteCnh(cnh.id)
      return res.status(401).json({ error: 'CNH expirada. Solicite uma nova ao operador.' })
    }
    const { pin: _pin, ...cnhSafe } = cnh
    res.json(cnhSafe)
  } catch {
    res.status(401).json({ error: 'Sessão inválida' })
  }
})

// Consulta pública via QR Code (CPF + número de registro)
app.get('/api/public/consulta', async (req, res) => {
  const { cpf, numero_registro: numeroRegistro } = req.query
  if (!cpf || !numeroRegistro) {
    return res.status(400).json({ error: 'CPF e número de registro são obrigatórios.' })
  }

  const cnh = await findCnhByCpfAndRegistro(cpf, numeroRegistro)
  if (!cnh) return res.status(404).json({ error: 'CNH não encontrada para os dados informados.' })
  if (isCnhExpired(cnh)) {
    await deleteCnh(cnh.id)
    return res.status(401).json({ error: 'CNH expirada.' })
  }

  const { pin: _pin, createdBy: _cb, ...cnhSafe } = cnh
  res.json(cnhSafe)
})

// Endpoint público: configurações visíveis ao operador (sem dados sensíveis)
app.get('/api/public/settings', (_, res) => {
  const s = getSettings()
  res.json({ rechargeBonus: s.rechargeBonus ?? 0, priceCnh: s.priceCnh ?? 50 })
})

app.get('/health', (_, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`CNH Admin API rodando em http://localhost:${PORT}`)
})
