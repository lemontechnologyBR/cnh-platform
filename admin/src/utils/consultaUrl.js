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

  const params = new URLSearchParams({
    cpf: cpfFmt,
    numero_registro: reg,
  })

  const extras = [
    ['numero_validacao', src.numero],
    ['codigo_validacao', src.codigoValidacao ?? src.certA],
    ['renach', src.renach ?? src.certB],
    ['validade', src.validade],
    ['emissao', src.emissao],
    ['cat_hab', src.catHab],
  ]
  for (const [key, val] of extras) {
    const s = val != null ? String(val).trim() : ''
    if (s) params.set(key, s)
  }

  return `${CONSULTA_BASE}/?${params}`
}
