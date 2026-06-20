import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { api } from '../utils/api.js'

function randDigits(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')
}
function randEspelho() { return randDigits(10) }
function randCertA()   { return randDigits(11) }
function randCertB()   { return 'SP' + randDigits(9) }

// ── Máscaras de input ─────────────────────────────────────────────────────────

function maskCpf(v) {
  const d = String(v).replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function maskDate(v) {
  const d = String(v).replace(/\D/g, '').slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

function maskLocalNasc(v) {
  return String(v).toUpperCase().replace(/[^A-ZÀ-Ú0-9,.\s-]/g, '').slice(0, 40)
}

function maskRegistro(v) {
  const d = String(v).replace(/\D/g, '').slice(0, 11)
  if (d.length <= 9) return d
  return `${d.slice(0, 9)} ${d.slice(9)}`
}

function maskCertB(v) {
  const s = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '')
  const uf = s.replace(/\d/g, '').slice(0, 2)
  const num = s.replace(/\D/g, '').slice(0, 9)
  return uf + num
}

function maskCatHab(v) {
  return String(v).toUpperCase().replace(/[^A-E]/g, '').slice(0, 4)
}

function maskDigits(v, max) {
  return String(v).replace(/\D/g, '').slice(0, max)
}

function maskUpper(v) {
  return String(v).toUpperCase()
}

const MASK_FN = {
  cpf: maskCpf,
  date: maskDate,
  localNasc: maskLocalNasc,
  registro: maskRegistro,
  certB: maskCertB,
  catHab: maskCatHab,
  upper: maskUpper,
  digits10: (v) => maskDigits(v, 10),
  digits11: (v) => maskDigits(v, 11),
  pin: (v) => maskDigits(v, 4),
}

function applyMask(type, value) {
  if (!type || value == null) return value ?? ''
  return MASK_FN[type]?.(value) ?? value
}

// MRZ check digit (weights 7,3,1 cycled)
function mrzCheck(str) {
  const MAP = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const W = [7, 3, 1]
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    const v = c === '<' ? 0 : MAP.indexOf(c)
    sum += (v < 0 ? 0 : v) * W[i % 3]
  }
  return String(sum % 10)
}

function pad(s, n) { return String(s).toUpperCase().replace(/[^A-Z0-9]/g, '<').slice(0, n).padEnd(n, '<') }

function dateToDDMMYYYY(s) {
  // aceita DD/MM/YYYY
  const m = (s || '').match(/(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? { d: m[1], mo: m[2], y: m[3] } : null
}

function generateMrz(form) {
  const registro = (form.registro || randDigits(10)).replace(/\D/g, '').padEnd(9, '0').slice(0, 9)
  const checkReg = mrzCheck(registro)

  // nascimento: "25/10/1988, SÃO PAULO, SP" → pega a data
  const dobParsed = dateToDDMMYYYY(form.nascimento || '')
  const dob = dobParsed ? `${dobParsed.y.slice(2)}${dobParsed.mo}${dobParsed.d}` : randDigits(6)
  const checkDob = mrzCheck(dob)

  // validade: "13/11/2035"
  const valParsed = dateToDDMMYYYY(form.validade || '')
  const exp = valParsed ? `${valParsed.y.slice(2)}${valParsed.mo}${valParsed.d}` : randDigits(6)
  const checkExp = mrzCheck(exp)

  // nome: "DIEGO ARRIEIRA DE OLIVEIRA" → sobrenome<<nome
  const parts = (form.nome || 'NOME SOBRENOME').toUpperCase().replace(/[^A-Z ]/g, '').trim().split(' ')
  const firstName = parts[0]
  const lastName = parts.slice(1).join('<')
  const mrzName = pad(`${lastName}<<${firstName}`, 30)

  const line1Raw = `I<BRA${registro}${checkReg}`
  const line1 = pad(line1Raw, 30)

  const line2Body = `${dob}${checkDob}M${exp}${checkExp}BRA`
  const filler = '<<<<<<<<<<'.slice(0, 30 - line2Body.length - 1)
  const line2Check = mrzCheck(`${dob}${checkDob}M${exp}${checkExp}BRA${filler}`)
  const line2 = `${line2Body}${filler}${line2Check}`

  return { mrz1: line1, mrz2: line2, mrz3: mrzName }
}

const FIELDS = [
  { key: 'pin',           label: 'PIN de acesso (4 dígitos)', placeholder: '0000', mask: 'pin' },
  { key: 'nome',          label: 'Nome completo',             placeholder: 'DIEGO ARRIEIRA DE OLIVEIRA', mask: 'upper' },
  { key: 'nascimento',    label: 'Data de nascimento',        placeholder: '25/10/1988', mask: 'date', inputMode: 'numeric' },
  { key: 'localNascimento', label: 'Local de nascimento (UF)', placeholder: 'SALINAS, MG', mask: 'localNasc' },
  { key: 'cpf',           label: 'CPF',                       placeholder: '369.065.548-08', mask: 'cpf', inputMode: 'numeric' },
  { key: 'docIdentidade', label: 'Documento de identidade',   placeholder: '47526376 DETRAN SP', mask: 'upper' },
  { key: 'registro',      label: 'Nº Registro CNH',           placeholder: '040447375 6', mask: 'registro', inputMode: 'numeric' },
  { key: 'catHab',        label: 'Categoria',                 placeholder: 'AB', mask: 'catHab' },
  { key: 'nacionalidade', label: 'Nacionalidade',             placeholder: 'BRASILEIRO(A)', mask: 'upper', default: 'BRASILEIRO(A)' },
  { key: 'primeiraHab',   label: '1ª Habilitação',            placeholder: '26/02/2007', mask: 'date', inputMode: 'numeric' },
  { key: 'emissao',       label: 'Data de emissão',           placeholder: '16/12/2025', mask: 'date', inputMode: 'numeric' },
  { key: 'validade',      label: 'Validade',                  placeholder: '13/11/2035', mask: 'date', inputMode: 'numeric' },
  { key: 'filiacao1',     label: 'Filiação 1 (Pai)',          placeholder: 'DIRCEU DE OLIVEIRA JUNIOR', mask: 'upper' },
  { key: 'filiacao2',     label: 'Filiação 2 (Mãe)',          placeholder: 'DENISE ARRIEIRA DE OLIVEIRA', mask: 'upper' },
  { key: 'numero',        label: 'Espelho (Nº lateral)',      placeholder: '5117172437', mask: 'digits10', autoGen: randEspelho, inputMode: 'numeric' },
  { key: 'local',         label: 'Local de emissão',          placeholder: 'SÃO PAULO, SP', mask: 'upper' },
  { key: 'certA',         label: 'Cert. A',                   placeholder: '36906554808', mask: 'digits11', autoGen: randCertA, inputMode: 'numeric' },
  { key: 'certB',         label: 'Cert. B',                   placeholder: 'SP040447375', mask: 'certB' },
  { key: 'mrz1',          label: 'MRZ linha 1',               placeholder: 'I<BRA0404473756<8<<<<<<<<<<<<' },
  { key: 'mrz2',          label: 'MRZ linha 2',               placeholder: '8810254M3511135BRA<<<<<<<<<0' },
  { key: 'mrz3',          label: 'MRZ linha 3',               placeholder: 'DIEGO<<ARRIEIRA<DE<OLIVEIRA<<<' },
]

const EMPTY = Object.fromEntries(FIELDS.map(f => [f.key, f.default ?? '']))

function splitLegacyNascimento(data) {
  const out = { ...data }
  if (out.nascimento?.includes(',') && !out.localNascimento) {
    const [date, ...rest] = out.nascimento.split(',')
    out.nascimento = date.trim()
    out.localNascimento = rest.join(',').trim()
  }
  return out
}

function normalizeForm(data) {
  const out = { ...EMPTY, ...splitLegacyNascimento(data) }
  for (const f of FIELDS) {
    if (f.mask && out[f.key]) out[f.key] = applyMask(f.mask, out[f.key])
    else if (f.default && !out[f.key]) out[f.key] = f.default
  }
  return out
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

function ImageUpload({ label, hint, value, onChange, previewStyle, isDefault }) {
  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 2 MB.')
      return
    }
    onChange(await fileToDataUrl(file))
    e.target.value = ''
  }

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
      {hint && <div style={{ fontSize: 11, color: '#475569', marginBottom: 8 }}>{hint}</div>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: previewStyle?.width ?? 100,
          height: previewStyle?.height ?? 130,
          background: '#0a0908',
          border: '1px dashed #3a2820',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {value
            ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: previewStyle?.height <= 60 ? 'contain' : 'cover', background: '#fff' }} />
            : <span style={{ color: '#475569', fontSize: 11, textAlign: 'center', padding: 8 }}>Sem imagem</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{
            background: '#FF6B0020', border: '1px solid #FF6B0040', borderRadius: 8,
            padding: '8px 14px', color: '#FF6B00', fontSize: 12, cursor: 'pointer', fontWeight: 600, textAlign: 'center',
          }}>
            📷 Escolher imagem
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFile} style={{ display: 'none' }} />
          </label>
          {value && !isDefault && (
            <button type="button" onClick={() => onChange('')} style={{
              background: 'transparent', border: '1px solid #3a2820', borderRadius: 8,
              padding: '6px 12px', color: '#64748b', fontSize: 12, cursor: 'pointer',
            }}>
              Remover
            </button>
          )}
          {isDefault && (
            <div style={{ fontSize: 10, color: '#475569' }}>Foto padrão do sistema</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CnhFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    api.getCnh(id).then(c => { setForm(normalizeForm(c)); setLoading(false) }).catch(() => setLoading(false))
  }, [id, isEdit])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await api.updateCnh(id, form)
        navigate(`/cnhs/${id}`)
      } else {
        const cnh = await api.createCnh(form)
        navigate(`/cnhs/${cnh.id}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Layout><div style={{ color: '#64748b', padding: 40 }}>Carregando...</div></Layout>

  return (
    <Layout>
      <div style={{ maxWidth: 760, width: '100%' }}>
        <div className="admin-form-header">
          <button onClick={() => navigate(-1)} style={{ background: '#161210', border: '1px solid #3a2820', borderRadius: 8, padding: '8px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>← Voltar</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{isEdit ? 'Editar CNH' : 'Nova CNH'}</h1>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
              {isEdit ? 'Atualize os dados do documento' : 'Preencha os dados — a CNH expira automaticamente em 30 dias'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Foto e assinatura */}
          <div className="admin-grid-2" style={{ background: '#161210', borderRadius: 12, border: '1px solid #3a2820', padding: '24px 28px', marginBottom: 20 }}>
            <ImageUpload
              label="Foto 3x4"
              hint="Retrato vertical — padrão até enviar outra"
              value={form.foto || '/foto_padrao_3x4.png'}
              onChange={v => set('foto', v)}
              previewStyle={{ width: 90, height: 120 }}
              isDefault={!form.foto}
            />
            <ImageUpload
              label="Assinatura"
              hint="PNG com fundo transparente ou branco"
              value={form.assinatura || ''}
              onChange={v => set('assinatura', v)}
              previewStyle={{ width: 160, height: 50 }}
            />
          </div>

          <div className="admin-grid-2" style={{ background: '#161210', borderRadius: 12, border: '1px solid #3a2820', padding: '28px 28px' }}>
            {FIELDS.map((f, idx) => (
              <div key={f.key} style={f.key.startsWith('mrz') ? { gridColumn: '1 / -1' } : f.key === 'pin' ? { gridColumn: '1 / -1', background: '#221816', borderRadius: 10, padding: '16px 20px', border: '1px solid #FF6B0040' } : {}}>
                {f.key === 'mrz1' && (
                  <div className="admin-mrz-header">
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>MRZ — Machine Readable Zone</span>
                    <button
                      type="button"
                      onClick={() => {
                        const mrz = generateMrz(form)
                        setForm(f => ({ ...f, ...mrz }))
                      }}
                      style={{ background: '#FF6B0020', border: '1px solid #FF6B0040', borderRadius: 8, padding: '7px 16px', color: '#FF6B00', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                    >
                      ⟳ Gerar MRZ automático
                    </button>
                  </div>
                )}
                <label style={{ display: 'block', fontSize: 11, color: f.key === 'pin' ? '#FF6B00' : '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: f.key === 'pin' ? 700 : 400 }}>{f.label}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={form[f.key] || ''}
                    onChange={e => set(f.key, applyMask(f.mask, e.target.value))}
                    placeholder={f.placeholder}
                    inputMode={f.inputMode || (f.key === 'pin' ? 'numeric' : 'text')}
                    style={{ flex: 1, width: f.key === 'pin' ? 120 : '100%', background: '#0a0908', border: `1px solid ${f.key === 'pin' ? '#FF6B00' : '#3a2820'}`, borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: f.key === 'pin' ? 22 : 14, outline: 'none', fontFamily: f.key.startsWith('mrz') || f.key === 'pin' || f.mask === 'cpf' || f.mask === 'date' ? 'monospace' : 'inherit', letterSpacing: f.key === 'pin' ? '0.3em' : 'normal' }}
                  />
                  {f.autoGen && (
                    <button
                      type="button"
                      onClick={() => set(f.key, applyMask(f.mask, f.autoGen()))}
                      title="Gerar aleatório"
                      style={{ flexShrink: 0, background: '#3a2820', border: 'none', borderRadius: 8, padding: '10px 14px', color: '#94a3b8', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 500 }}
                    >
                      ⟳ Gerar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: '#2d1515', border: '1px solid #7f1d1d', borderRadius: 8, padding: '10px 16px', color: '#fca5a5', fontSize: 13, marginTop: 16 }}>{error}</div>
          )}

          <div className="admin-actions-row">
            <button
              type="submit"
              disabled={saving}
              style={{ background: '#FF6B00', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar CNH'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ background: 'transparent', border: '1px solid #3a2820', color: '#94a3b8', borderRadius: 10, padding: '12px 24px', fontSize: 14, cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
