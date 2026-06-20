import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { getUserByUsername } from '../db.js'

const router = Router()
export const JWT_SECRET = 'cnh_admin_secret_2026'

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ error: 'Usuário e senha obrigatórios' })

  const user = getUserByUsername(username)
  if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'Usuário ou senha inválidos' })

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  )
  res.json({ token, role: user.role, nome: user.nome })
})

export default router
