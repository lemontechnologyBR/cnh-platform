import { formatCpf, getRegistroForConsulta, normalizeRegistro } from './consultaUrl.js'

function parseSexo(cnh) {
  if (cnh.sexo) return String(cnh.sexo).toUpperCase()
  const m = String(cnh.mrz2 || '').match(/\d{7}([MF])\d/)
  if (m) return m[1] === 'M' ? 'MASCULINO' : 'FEMININO'
  return ''
}

function parseLocalUf(local) {
  const s = String(local || '').trim()
  if (!s) return { local: '', uf: '' }
  const idx = s.lastIndexOf(',')
  if (idx === -1) return { local: s, uf: '' }
  return {
    local: s.slice(0, idx).trim(),
    uf: s.slice(idx + 1).trim(),
  }
}

function formatNacionalidade(v) {
  return String(v || 'BRASILEIRO')
    .replace(/\(A\)/gi, '')
    .replace(/\(a\)/gi, '')
    .trim() || 'BRASILEIRO'
}

function nascimentoDateOnly(v) {
  if (!v) return ''
  return String(v).split(',')[0].trim()
}

/** Campos exibidos na consulta pública SENATRAN (ordem das telas oficiais) */
export function buildConsultaFields(cnh) {
  const { local, uf } = parseLocalUf(cnh.local)
  const registro = getRegistroForConsulta(cnh) || normalizeRegistro(cnh.registro)

  return [
    { label: 'Nome', value: cnh.nome },
    { label: 'Nome Civil', value: cnh.nome },
    { label: 'Doc. Identidade/Órg. Emissor/UF', value: cnh.docIdentidade },
    { label: 'CPF', value: formatCpf(cnh.cpf) },
    { label: 'Data de Nascimento', value: nascimentoDateOnly(cnh.nascimento) },
    { label: 'Nacionalidade', value: formatNacionalidade(cnh.nacionalidade) },
    { label: 'Sexo', value: parseSexo(cnh) },
    { label: 'Filiação Pai', value: cnh.filiacao1 },
    { label: 'Filiação Mãe', value: cnh.filiacao2 },
    { label: 'Permissão', value: cnh.permissao ?? '' },
    { label: 'ACC', value: cnh.acc ?? 'NAO' },
    { label: 'Cat. Hab.', value: cnh.catHab },
    { label: 'Nº Registro', value: registro },
    { label: 'Validade', value: cnh.validade },
    { label: '1ª Habilitação', value: cnh.primeiraHab },
    { label: 'Observações', value: cnh.observacoes ?? cnh.catHab?.charAt(0) ?? 'A' },
    { label: 'Local', value: local },
    { label: 'UF', value: cnh.uf ?? uf },
    { label: 'Data de Emissão', value: cnh.emissao },
    { label: 'Número Validação CNH', value: cnh.numero },
    { label: 'Código Validação', value: cnh.codigoValidacao ?? cnh.certA },
    { label: 'Número Formulário RENACH', value: cnh.renach ?? cnh.certB },
    { label: 'Selo Bom Condutor', value: cnh.seloBomCondutor ?? 'NAO' },
  ]
}
