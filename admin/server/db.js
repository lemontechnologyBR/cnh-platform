import { JSONFilePreset } from 'lowdb/node'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

import 'dotenv/config'

const DB_FILE = process.env.DB_FILE || 'server/db.json'
const defaultData = { users: [], cnhs: [], transactions: [], recharges: [], settings: { priceCnh: 50, pixKey: 'cnh@admin.com', pixName: 'CNH Admin', mpAccessToken: '', rechargeBonus: 50 } }
export const db = await JSONFilePreset(DB_FILE, defaultData)

// Migrations: ensure all tables exist
if (!db.data.users)        { db.data.users = [];        await db.write() }
if (!db.data.transactions) { db.data.transactions = []; await db.write() }
if (!db.data.recharges)    { db.data.recharges = [];    await db.write() }
if (!db.data.settings)     { db.data.settings = { priceCnh: 50, pixKey: 'cnh@admin.com', pixName: 'CNH Admin', mpAccessToken: '' }; await db.write() }
if (!db.data.settings.mpAccessToken && db.data.settings.mpAccessToken !== '') { db.data.settings.mpAccessToken = ''; await db.write() }

// Auto-seed superadmin if no users exist
if (db.data.users.length === 0) {
  const hash = await bcrypt.hash('cnh@2026', 10)
  db.data.users.push({
    id: randomUUID(),
    username: 'admin',
    passwordHash: hash,
    role: 'superadmin',
    nome: 'Administrador',
    saldo: 0,
    created_at: new Date().toISOString(),
  })
  await db.write()
  console.log('Admin padrão criado: admin / cnh@2026')
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function getAllUsers() {
  return db.data.users.map(({ passwordHash, ...u }) => u)
}

export function getUserById(id) {
  return db.data.users.find(u => u.id === id) ?? null
}

export function getUserByUsername(username) {
  return db.data.users.find(u => u.username === username) ?? null
}

export async function createUser(data) {
  const hash = await bcrypt.hash(data.password, 10)
  const user = {
    id: randomUUID(),
    username: data.username,
    passwordHash: hash,
    role: data.role || 'operator',
    nome: data.nome || data.username,
    saldo: 0,
    created_at: new Date().toISOString(),
  }
  db.data.users.push(user)
  await db.write()
  const { passwordHash, ...safe } = user
  return safe
}

export async function updateUser(id, data) {
  const idx = db.data.users.findIndex(u => u.id === id)
  if (idx === -1) return null
  if (data.password) {
    db.data.users[idx].passwordHash = await bcrypt.hash(data.password, 10)
  }
  const { password, passwordHash, ...rest } = data
  db.data.users[idx] = { ...db.data.users[idx], ...rest, id, updated_at: new Date().toISOString() }
  await db.write()
  const { passwordHash: _, ...safe } = db.data.users[idx]
  return safe
}

export async function deleteUser(id) {
  const idx = db.data.users.findIndex(u => u.id === id)
  if (idx === -1) return false
  db.data.users.splice(idx, 1)
  db.data.transactions = db.data.transactions.filter(t => t.userId !== id)
  await db.write()
  return true
}

// ── Wallet (por usuário) ───────────────────────────────────────────────────────

export function getUserWallet(userId) {
  const user = getUserById(userId)
  if (!user) return null
  const txs = db.data.transactions.filter(t => t.userId === userId)
  const { passwordHash, ...safe } = user
  return { ...safe, transactions: [...txs].reverse() }
}

export async function creditUser(userId, amount, descricao = 'Crédito') {
  const idx = db.data.users.findIndex(u => u.id === userId)
  if (idx === -1) return null
  const prev = db.data.users[idx].saldo ?? 0
  const next = +(prev + amount).toFixed(2)
  db.data.users[idx].saldo = next
  const tx = {
    id: randomUUID(), userId, tipo: 'credito', amount,
    descricao, saldo_antes: prev, saldo_depois: next,
    created_at: new Date().toISOString(),
  }
  db.data.transactions.push(tx)
  await db.write()
  return tx
}

export async function debitUser(userId, amount, descricao = 'Débito') {
  const idx = db.data.users.findIndex(u => u.id === userId)
  if (idx === -1) return null
  const prev = db.data.users[idx].saldo ?? 0
  if (prev < amount) return { error: 'Saldo insuficiente' }
  const next = +(prev - amount).toFixed(2)
  db.data.users[idx].saldo = next
  const tx = {
    id: randomUUID(), userId, tipo: 'debito', amount,
    descricao, saldo_antes: prev, saldo_depois: next,
    created_at: new Date().toISOString(),
  }
  db.data.transactions.push(tx)
  await db.write()
  return tx
}

// ── CNHs ──────────────────────────────────────────────────────────────────────

export const CNH_TTL_DAYS = 30
const CNH_TTL_MS = CNH_TTL_DAYS * 24 * 60 * 60 * 1000

export function cnhExpiresAt(cnh) {
  if (cnh?.expires_at) return new Date(cnh.expires_at)
  if (cnh?.created_at) return new Date(new Date(cnh.created_at).getTime() + CNH_TTL_MS)
  return new Date(0)
}

export function isCnhExpired(cnh) {
  return Date.now() >= cnhExpiresAt(cnh).getTime()
}

async function migrateCnhExpiry() {
  let changed = false
  for (const cnh of db.data.cnhs) {
    if (!cnh.expires_at && cnh.created_at) {
      cnh.expires_at = new Date(new Date(cnh.created_at).getTime() + CNH_TTL_MS).toISOString()
      changed = true
    }
  }
  if (changed) await db.write()
}

export async function purgeExpiredCnhs() {
  const before = db.data.cnhs.length
  db.data.cnhs = db.data.cnhs.filter(c => !isCnhExpired(c))
  const removed = before - db.data.cnhs.length
  if (removed > 0) await db.write()
  return removed
}

await migrateCnhExpiry()
await purgeExpiredCnhs()

export async function getAllCnhs(userId = null) {
  await purgeExpiredCnhs()
  if (userId) return db.data.cnhs.filter(c => c.createdBy === userId)
  return db.data.cnhs
}

export async function getCnhById(id) {
  await purgeExpiredCnhs()
  return db.data.cnhs.find(c => c.id === id) ?? null
}

export async function findCnhByCpf(cpf) {
  await purgeExpiredCnhs()
  const normalized = (s) => (s || '').replace(/\D/g, '')
  const target = normalized(cpf)
  for (const cnh of db.data.cnhs) {
    if (normalized(cnh.cpf) === target) return cnh
  }
  return null
}

export async function findCnhByCpfAndRegistro(cpf, numeroRegistro) {
  const cnh = await findCnhByCpf(cpf)
  if (!cnh) return null
  const normalized = (s) => String(s || '').replace(/\D/g, '')
  if (normalized(cnh.registro) !== normalized(numeroRegistro)) return null
  return cnh
}

export async function createCnh(data) {
  const created_at = new Date().toISOString()
  const cnh = {
    ...data,
    id: randomUUID(),
    created_at,
    expires_at: new Date(Date.now() + CNH_TTL_MS).toISOString(),
  }
  db.data.cnhs.push(cnh)
  await db.write()
  return cnh
}

export async function updateCnh(id, data) {
  const idx = db.data.cnhs.findIndex(c => c.id === id)
  if (idx === -1) return null
  const { expires_at, created_at, id: _id, ...rest } = data
  db.data.cnhs[idx] = { ...db.data.cnhs[idx], ...rest, id, updated_at: new Date().toISOString() }
  await db.write()
  return db.data.cnhs[idx]
}

export async function deleteCnh(id) {
  const idx = db.data.cnhs.findIndex(c => c.id === id)
  if (idx === -1) return false
  db.data.cnhs.splice(idx, 1)
  await db.write()
  return true
}

// ── Recharges ─────────────────────────────────────────────────────────────────

export function getAllRecharges(userId = null) {
  const list = db.data.recharges ?? []
  return userId ? list.filter(r => r.userId === userId) : list
}

export function getRechargeById(id) {
  return (db.data.recharges ?? []).find(r => r.id === id) ?? null
}

export async function createRecharge(userId, amount, mpData = null) {
  const r = {
    id: randomUUID(),
    userId,
    amount,
    status: 'pending',
    mpPaymentId: mpData?.mpPaymentId ?? null,
    qrCodeBase64: mpData?.qrCodeBase64 ?? null,
    qrCode: mpData?.qrCode ?? null,
    expiresAt: mpData?.expiresAt ?? null,
    created_at: new Date().toISOString(),
  }
  db.data.recharges.push(r)
  await db.write()
  return r
}

export async function approveRecharge(id) {
  const idx = db.data.recharges.findIndex(r => r.id === id)
  if (idx === -1) return null
  const r = db.data.recharges[idx]
  if (r.status !== 'pending') return { error: 'Recarga já processada' }

  const bonus = db.data.settings?.rechargeBonus ?? 0
  const total = +(r.amount * (1 + bonus / 100)).toFixed(2)
  const bonusAmount = +(total - r.amount).toFixed(2)

  db.data.recharges[idx] = { ...r, status: 'approved', bonusApplied: bonusAmount, totalCredited: total, updated_at: new Date().toISOString() }
  await db.write()

  const desc = bonusAmount > 0
    ? `Recarga R$ ${r.amount.toFixed(2)} + ${bonus}% bônus = R$ ${total.toFixed(2)}`
    : `Recarga PIX - R$ ${r.amount.toFixed(2)}`
  await creditUser(r.userId, total, desc)
  return db.data.recharges[idx]
}

export async function rejectRecharge(id) {
  const idx = db.data.recharges.findIndex(r => r.id === id)
  if (idx === -1) return null
  const r = db.data.recharges[idx]
  if (r.status !== 'pending') return { error: 'Recarga já processada' }
  db.data.recharges[idx] = { ...r, status: 'rejected', updated_at: new Date().toISOString() }
  await db.write()
  return db.data.recharges[idx]
}

// ── Settings ──────────────────────────────────────────────────────────────────

export function getSettings() {
  return db.data.settings ?? { priceCnh: 10, pixKey: 'cnh@admin.com', pixName: 'CNH Admin' }
}

export async function saveSettings(data) {
  db.data.settings = { ...(db.data.settings ?? {}), ...data }
  await db.write()
  return db.data.settings
}
