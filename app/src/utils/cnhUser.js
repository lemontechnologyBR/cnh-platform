/** Normaliza registro vindo do painel para o gerador de PDF. */
export function normalizeCnhData(raw) {
  if (!raw) return null
  const d = { ...raw }
  delete d.pin
  delete d.createdBy
  delete d.updated_at
  delete d.expires_at
  if (d.nascimento?.includes(',') && !d.localNascimento) {
    const [date, ...rest] = d.nascimento.split(',')
    d.nascimento = date.trim()
    d.localNascimento = rest.join(',').trim()
  }
  return d
}

export function loadCnhUserFromStorage() {
  try {
    const stored = localStorage.getItem('cnh_user')
    if (!stored) return null
    return normalizeCnhData(JSON.parse(stored))
  } catch {
    return null
  }
}

export function getCnhToken() {
  return localStorage.getItem('cnh_token') || ''
}

export async function fetchCnhUser() {
  const token = getCnhToken()
  if (!token) return loadCnhUserFromStorage()

  const res = await fetch('/api/public/cnh', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('fetch failed')
  const cnh = normalizeCnhData(await res.json())
  try { localStorage.setItem('cnh_user', JSON.stringify(cnh)) } catch { /* quota */ }
  return cnh
}
