import crypto from 'crypto'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './routes/auth.js'

const TTL_MS = 5 * 60 * 1000
const store = new Map()

function cleanup() {
  const now = Date.now()
  for (const [id, entry] of store) {
    if (entry.expires < now) store.delete(id)
  }
}

function safeFilename(raw) {
  try {
    raw = decodeURIComponent(String(raw || ''))
  } catch { /* keep raw */ }
  const name = raw.replace(/[^\w\s.-]/g, '').trim().slice(0, 80)
  return name.endsWith('.pdf') ? name : `${name || 'CNH'}.pdf`
}

const router = Router()

/** Recebe PDF gerado no app e devolve URL HTTPS para download real (mobile) */
router.post('/pdf-store', (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sessão inválida' })
  }
  try {
    jwt.verify(header.slice(7), JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Sessão inválida' })
  }

  if (!req.body?.length) {
    return res.status(400).json({ error: 'PDF vazio' })
  }

  const id = crypto.randomUUID()
  const filename = safeFilename(req.headers['x-filename'])
  store.set(id, {
    buffer: Buffer.from(req.body),
    filename,
    expires: Date.now() + TTL_MS,
  })
  cleanup()

  res.json({ url: `/api/public/cnh/pdf-file/${id}`, filename })
})

router.get('/pdf-file/:id', (req, res) => {
  const entry = store.get(req.params.id)
  if (!entry || entry.expires < Date.now()) {
    store.delete(req.params.id)
    return res.status(404).json({ error: 'Link expirado. Exporte novamente.' })
  }

  const encoded = encodeURIComponent(entry.filename)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${entry.filename}"; filename*=UTF-8''${encoded}`)
  res.setHeader('Content-Length', entry.buffer.length)
  res.setHeader('Cache-Control', 'no-store')
  res.send(entry.buffer)
  store.delete(req.params.id)
})

export default router
