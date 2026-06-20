export const CONSULTA_BASE =
  import.meta.env.VITE_CONSULTA_URL || 'https://cnh-digital-senatran.online'

export function formatCpf(cpf) {
  const d = String(cpf || '').replace(/\D/g, '')
  if (d.length !== 11) return String(cpf || '')
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function normalizeRegistro(registro) {
  return String(registro || '').replace(/\D/g, '')
}

export function formatRegistroDisplay(registro) {
  const d = normalizeRegistro(registro)
  if (!d) return ''
  if (d.length <= 9) return d
  return `${d.slice(0, 9)} ${d.slice(9)}`
}

export function getRegistroForConsulta(data = {}) {
  const fromField = normalizeRegistro(data.registro)
  if (fromField.length >= 9) return fromField

  const mrz = String(data.mrz1 || '')
  const m = mrz.match(/BRA(\d{9,11})/i)
  if (m) return m[1]

  return fromField
}

export function buildConsultaUrl(cpf, registro, data = null) {
  const cpfFmt = formatCpf(cpf)
  const reg = getRegistroForConsulta(data ?? { registro, mrz1: null })
  const params = new URLSearchParams({ cpf: cpfFmt, numero_registro: reg })
  return `${CONSULTA_BASE}/?${params}`
}
