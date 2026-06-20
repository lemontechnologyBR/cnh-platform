export const CONSULTA_BASE =
  import.meta.env.VITE_CONSULTA_URL || 'https://cnh-digital-senatran.online'

export function formatCpf(cpf) {
  const d = String(cpf || '').replace(/\D/g, '')
  if (d.length !== 11) return String(cpf || '')
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

/** Apenas dígitos — formato CNH original (ex: 05645719819) */
export function normalizeRegistro(registro) {
  return String(registro || '').replace(/\D/g, '')
}

/** Registro para PDF e URL — só dados reais, nunca defaults */
export function getRegistroForConsulta(data = {}) {
  const fromField = normalizeRegistro(data.registro)
  if (fromField.length >= 9) return fromField

  const mrz = String(data.mrz1 || '')
  const m = mrz.match(/BRA(\d{9,11})/i)
  if (m) return m[1]

  return fromField
}

export function buildConsultaUrl(cpf, _registro, data = null) {
  const src = data ?? {}
  const cpfFmt = formatCpf(src.cpf ?? cpf)
  const reg = getRegistroForConsulta(src)
  if (!cpfFmt || !reg) return ''
  const params = new URLSearchParams({ cpf: cpfFmt, numero_registro: reg })
  return `${CONSULTA_BASE}/?${params}`
}

export async function fetchConsultaCnh(cpf, numeroRegistro) {
  const params = new URLSearchParams({
    cpf: formatCpf(cpf),
    numero_registro: normalizeRegistro(numeroRegistro),
  })
  const res = await fetch(`/api/public/consulta?${params}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Não foi possível consultar a CNH.')
  return data
}
