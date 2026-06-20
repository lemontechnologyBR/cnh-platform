const BASE = '/api'

function token() {
  return localStorage.getItem('cnh_admin_token') || ''
}

function headers(extra = {}) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...extra }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    localStorage.removeItem('cnh_admin_token')
    window.location.href = '/login'
    return
  }
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Erro desconhecido')
  return json
}

export const api = {
  getPublicSettings: () => fetch(`${BASE}/public/settings`).then(r => r.json()),

  login: (username, password) =>
    fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(r => r.json()),

  // CNHs
  getStats:       () => request('GET', '/cnhs/stats'),
  getCnhs:        (q) => request('GET', `/cnhs${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getCnh:         (id) => request('GET', `/cnhs/${id}`),
  createCnh:      (data) => request('POST', '/cnhs', data),
  updateCnh:      (id, data) => request('PUT', `/cnhs/${id}`, data),
  deleteCnh:      (id) => request('DELETE', `/cnhs/${id}`),

  // Usuários (superadmin)
  getMe:          () => request('GET', '/users/me'),
  getUsers:       () => request('GET', '/users'),
  createUser:     (data) => request('POST', '/users', data),
  updateUser:     (id, data) => request('PUT', `/users/${id}`, data),
  deleteUser:     (id) => request('DELETE', `/users/${id}`),
  getUserWallet:  (id) => request('GET', `/users/${id}/wallet`),
  creditarUser:   (id, amount, descricao) => request('POST', `/users/${id}/creditar`, { amount, descricao }),
  debitarUser:    (id, amount, descricao) => request('POST', `/users/${id}/debitar`, { amount, descricao }),
  getSettings:    () => request('GET', '/users/settings'),
  saveSettings:   (data) => request('PUT', '/users/settings', data),

  // Recargas PIX
  getRecharges:       () => request('GET', '/recharges'),
  createRecharge:     (amount) => request('POST', '/recharges', { amount }),
  getRechargeStatus:  (id) => request('GET', `/recharges/${id}/status`),
  approveRecharge:    (id) => request('POST', `/recharges/${id}/approve`),
  rejectRecharge:     (id) => request('POST', `/recharges/${id}/reject`),
}
