/**
 * Geração de CNH — edição BRUTA do content stream PDF.
 *
 * Pipeline:
 *   1. Carrega cnh_luis.pdf
 *   2. Para cada content stream da página → descomprime (FlateDecode) →
 *      remove TODOS os blocos "q BT … <hex> Tj … ET Q" dos campos de dados
 *      (Asul-Regular, NimbusMono-Bold, OCR-B) → recomprime → substitui no PDF.
 *   3. Embute NotoSans-Bold e desenha os novos textos com drawText.
 *   4. Salva.
 *
 * Resultado: o texto do Luis NÃO existe mais no stream — foi apagado.
 * Nenhum retângulo de cobertura. Nenhuma "imagem por cima".
 */
import { PDFDocument, PDFRawStream, PDFName, rgb, degrees, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import QRCode from 'qrcode'
import { buildConsultaUrl, getRegistroForConsulta } from './consultaUrl.js'

export const LUIS_PDF_URL = '/cnh_luis.pdf'
export const DEFAULT_FOTO_URL = '/foto_padrao_3x4.png'

const RED   = rgb(213 / 255, 0, 0)
const DARK  = rgb(54  / 255, 54  / 255, 54  / 255)
const WHITE = rgb(1, 1, 1)

// XObjects embutidos no cnh_luis.pdf (frente)
const FOTO_IMAGE       = 'Image-7098480789'
const ASSINATURA_IMAGE = 'Image-2000805986'
const QR_IMAGE         = 'Image-7572533686'

const pdfBytesCache = new Map()
let fontBytesCache = null
let defaultFotoBytesCache = null

// ─── Font ────────────────────────────────────────────────────────────────────

async function loadFont(pdfDoc) {
  if (!fontBytesCache) {
    const res = await fetch('/fonts/NotoSans-Bold.ttf')
    if (!res.ok) throw new Error(`Fonte não encontrada (${res.status})`)
    fontBytesCache = await res.arrayBuffer()
  }
  pdfDoc.registerFontkit(fontkit)
  return pdfDoc.embedFont(fontBytesCache)
}

// ─── Inflate via Web Streams API ─────────────────────────────────────────────

async function _pumpTransform(transform, data) {
  const writer = transform.writable.getWriter()
  const reader = transform.readable.getReader()
  writer.write(data)
  writer.close()
  const chunks = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  const total = chunks.reduce((s, c) => s + c.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const c of chunks) { out.set(c, off); off += c.length }
  return out
}

// Tries deflate-raw (most PDF FlateDecode), then zlib (with header) as fallback.
async function inflate(data) {
  try {
    return await _pumpTransform(new DecompressionStream('deflate-raw'), data)
  } catch { /* try zlib format */ }
  return _pumpTransform(new DecompressionStream('deflate'), data)
}

// ─── Content-stream text removal ─────────────────────────────────────────────

// Removes ALL q…BT…<hex> Tj…ET…Q blocks that use the fonts whose names appear
// only in data fields: Asul-Regular-*, NimbusMono-Bold-*, OCR-B-*.
const DATA_FONT_RE =
  /q\s+(?:\/GS-\S+ gs\s+)?BT\s+[\d. ]+ rg\s+\/(?:Asul-Regular|NimbusMono-Bold|OCR-B)-\S+ [\d.]+ Tf[\s\S]*?ET\s+Q/g

function stripDataText(streamStr) {
  return streamStr.replace(DATA_FONT_RE, '')
}

// Remove blocos q…/Image-xxx Do…Q (foto e assinatura do template Luis)
function stripImageBlock(streamStr, imageName) {
  const escaped = imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`q\\s+(?:\\/GS-\\S+\\s+gs\\s+)?[\\s\\S]*?\\/${escaped}\\s+Do\\s+Q`, 'g')
  return streamStr.replace(re, '')
}

function stripTemplateImages(streamStr, { removeFoto, removeAssinatura, removeQr }) {
  let s = streamStr
  if (removeFoto) s = stripImageBlock(s, FOTO_IMAGE)
  if (removeAssinatura) s = stripImageBlock(s, ASSINATURA_IMAGE)
  if (removeQr) s = stripImageBlock(s, QR_IMAGE)
  return s
}

// ─── Patch every content stream in the document ──────────────────────────────

async function patchContentStreams(pdfDoc, imageOpts = { removeFoto: true, removeAssinatura: false, removeQr: true }) {
  const context = pdfDoc.context

  // Collect modifications first — avoids mutating the Map while iterating
  const mods = []

  for (const [ref, obj] of context.indirectObjects) {
    if (!(obj instanceof PDFRawStream)) continue

    // Skip image XObjects
    const subtype = obj.dict.get(PDFName.of('Subtype'))
    if (subtype && subtype.toString() === '/Image') continue

    const filter = obj.dict.get(PDFName.of('Filter'))
    const isFlate = filter && filter.toString().includes('FlateDecode')

    // Decompress if needed (raw deflate OR zlib-wrapped)
    let textBytes
    if (isFlate) {
      try { textBytes = await inflate(obj.contents) }
      catch { continue }
    } else {
      textBytes = obj.contents
    }

    // Decode latin-1 → string
    let streamStr = ''
    for (let i = 0; i < textBytes.length; i++) streamStr += String.fromCharCode(textBytes[i])

    const hasDataFonts =
      streamStr.includes('/Asul-Regular') ||
      streamStr.includes('/NimbusMono-Bold') ||
      streamStr.includes('/OCR-B')
    const hasTemplateImages =
      streamStr.includes(FOTO_IMAGE) ||
      streamStr.includes(ASSINATURA_IMAGE) ||
      streamStr.includes(QR_IMAGE)
    if (!hasDataFonts && !hasTemplateImages) continue

    let cleaned = stripDataText(streamStr)
    cleaned = stripTemplateImages(cleaned, imageOpts)
    if (cleaned === streamStr) continue

    // Encode back to bytes (uncompressed — we strip the FlateDecode filter)
    const cleanedBytes = new Uint8Array(cleaned.length)
    for (let i = 0; i < cleaned.length; i++) cleanedBytes[i] = cleaned.charCodeAt(i) & 0xff

    mods.push({ ref, obj, cleanedBytes })
  }

  // Apply modifications
  for (const { ref, obj, cleanedBytes } of mods) {
    const newDict = obj.dict.clone(context)
    // Store content UNCOMPRESSED — remove FlateDecode filter (safest approach)
    newDict.delete(PDFName.of('Filter'))
    newDict.delete(PDFName.of('DecodeParms'))
    newDict.set(PDFName.of('Length'), context.obj(cleanedBytes.length))
    context.assign(ref, PDFRawStream.of(newDict, cleanedBytes))
  }
}

// ─── Draw new text ────────────────────────────────────────────────────────────

/*
 * Coordenadas extraídas da camada de texto de cnh_luis.pdf (y = from bottom, pt).
 *
 * Frente (page y 624–727):
 *   nome           x=75.0   y=727   size=5
 *   primeiraHab    x=229.0  y=727   size=5
 *   nascimento     x=144.0  y=713   size=5   (data + ", localidade")
 *   emissao        x=144.0  y=698   size=5
 *   validade       x=187.0  y=698   size=5   (RED)
 *   catHab big     x=248.0  y=697   size=8   (RED)
 *   catHab small   x=239.0  y=669   size=5   (RED)
 *   docIdentidade  x=144.0  y=683   size=5
 *   cpf            x=144.0  y=669   size=5
 *   registro       x=193.0  y=669   size=5   (RED)
 *   nacionalidade  x=144.0  y=654   size=5
 *   filiacao1      x=144.0  y=640   size=5
 *   filiacao2      x=144.0  y=624   size=5
 *   numero lateral x=62     y=225   size=8.5 rotate=+90°
 *
 * Verso:
 *   validadeB      x=129.0  y=558.0  size=3.6
 *   certA          x=217.0  y=469.0  size=4    (código cert digital, linha 1)
 *   certB          x=217.0  y=463.0  size=4    (código cert digital, linha 2)
 *   local          x=72.0   y=459.0  size=5
 *   localShort     x=120.0  y=435.0  size=10
 *   numero lateral x=58     y=429.5  size=8.5  rotate=+90°
 *
 * MRZ (3º card):
 *   mrz1           x=70.0   y=300.0  size=6   (OCR-B)
 *   mrz2           x=70.0   y=288.0  size=6
 *   mrz3           x=70.0   y=276.0  size=6
 */
function drawFrente(page, data, font) {
  const d = (text, x, y, size, color, opts = {}) => {
    if (!text) return
    page.drawText(String(text), { x, y, size, font, color, ...opts })
  }

  const nascLine = [data.nascimento, data.localNascimento].filter(Boolean).join(', ')

  d(data.nome,          75.0,  727, 5.0, DARK)
  d(data.primeiraHab,  229.0,  727, 5.0, DARK)
  d(nascLine,          144.0,  713, 5.0, DARK)
  d(data.emissao,      144.0,  698, 5.0, DARK)
  d(data.validade,     187.0,  698, 5.0, RED)
  d(data.docIdentidade,144.0,  683, 5.0, DARK)
  d(data.cpf,          144.0,  669, 5.0, DARK)
  d(getRegistroForConsulta(data), 193.0,  669, 5.0, RED)
  d(data.catHab,       239.0,  669, 5.0, RED)   // linha pequena
  d(data.nacionalidade,144.0,  654, 5.0, DARK)
  d(data.filiacao1,    144.0,  640, 5.0, DARK)
  d(data.filiacao2,    144.0,  624, 5.0, DARK)

  if (data.numero) {
    // Número lateral rotacionado — posição exata do NimbusMono original (y=612.5, x=58.25)
    page.drawText(String(data.numero), {
      x: 58, y: 612.5, size: 8.5, font, color: DARK, rotate: degrees(90),
    })
  }
}

function drawVerso(page, data, font) {
  const d = (text, x, y, size, color, opts = {}) => {
    if (!text) return
    page.drawText(String(text), { x, y, size, font, color, ...opts })
  }

  // Validade na tabela de categorias (row B/AB, col validade)
  d(data.validade,      129.0, 558.0, 3.6, DARK)

  // Códigos do certificado digital (seção ASSINADO DIGITALMENTE)
  d(data.certA,         217.0, 469.0, 4.0, DARK)
  d(data.certB,         217.0, 463.0, 4.0, DARK)

  // Campo LOCAL — coordenadas exatas do original
  d(data.local,          72.0, 459.0, 5.0, DARK)
  if (data.local) d(data.local.split(',')[0].trim(), 120.0, 435.0, 10.0, DARK)

  if (data.numero) {
    page.drawText(String(data.numero), {
      x: 58, y: 429.5, size: 8.5, font, color: DARK, rotate: degrees(90),
    })
  }
}

function drawMrz(page, data, font) {
  const d = (text, x, y, size) => {
    if (!text) return
    page.drawText(String(text), { x, y, size, font, color: DARK })
  }

  d(data.mrz1, 70.0, 300.0, 6.0)
  d(data.mrz2, 70.0, 288.0, 6.0)
  d(data.mrz3, 70.0, 276.0, 6.0)
}

function dataUrlToBytes(dataUrl) {
  const m = String(dataUrl).match(/^data:image\/(png|jpe?g|webp);base64,(.+)$/i)
  if (!m) return null
  const raw = atob(m[2])
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return { type: m[1].toLowerCase(), bytes }
}

async function embedImageFromDataUrl(pdfDoc, dataUrl) {
  const parsed = dataUrlToBytes(dataUrl)
  if (!parsed) return null
  const { type, bytes } = parsed
  if (type === 'png' || type === 'webp') {
    try { return await pdfDoc.embedPng(bytes) } catch { /* ignore */ }
  }
  try { return await pdfDoc.embedJpg(bytes) } catch { return null }
}

async function loadDefaultFotoBytes() {
  if (!defaultFotoBytesCache) {
    defaultFotoBytesCache = await fetch(DEFAULT_FOTO_URL).then((r) => r.arrayBuffer())
  }
  return defaultFotoBytesCache
}

function maskArea(page, x, y, width, height) {
  page.drawRectangle({ x, y, width, height, color: WHITE, borderWidth: 0 })
}

async function embedImageFromSource(pdfDoc, src) {
  if (!src) return null
  const s = String(src)
  if (s.startsWith('data:')) return embedImageFromDataUrl(pdfDoc, s)
  if (s.startsWith('/') || s.startsWith('http')) {
    try {
      const res = await fetch(s)
      if (!res.ok) return null
      const buf = await res.arrayBuffer()
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('jpeg') || ct.includes('jpg')) return await pdfDoc.embedJpg(buf)
      return await pdfDoc.embedPng(buf)
    } catch {
      return null
    }
  }
  return null
}

async function drawImages(page, pdfDoc, data) {
  maskArea(page, 74, 632, 60, 80)

  let fotoImg = null
  if (data.foto) {
    fotoImg = await embedImageFromSource(pdfDoc, data.foto)
  } else {
    try {
      fotoImg = await pdfDoc.embedPng(await loadDefaultFotoBytes())
    } catch { /* fallback: foto do template original */ }
  }
  if (fotoImg) page.drawImage(fotoImg, { x: 74, y: 632, width: 60, height: 80 })

  if (data.assinatura) {
    maskArea(page, 79, 614, 45, 16)
    const img = await embedImageFromSource(pdfDoc, data.assinatura)
    if (img) page.drawImage(img, { x: 79, y: 614, width: 45, height: 16 })
  }
}

const QR_REGION = { x: 340, y: 557, w: 185, h: 185 }

async function drawQrCode(page, pdfDoc, rawData) {
  try {
    const url = buildConsultaUrl(null, null, rawData)
    if (!url) return
    const dataUrl = await QRCode.toDataURL(url, { margin: 2, width: 1024, errorCorrectionLevel: 'H' })
    const parsed = dataUrlToBytes(dataUrl)
    if (!parsed) return
    const qrImg = await pdfDoc.embedPng(parsed.bytes)
    const { x, y, w, h } = QR_REGION
    maskArea(page, x, y, w, h)
    page.drawImage(qrImg, { x, y, width: w, height: h })
  } catch (err) {
    console.error('drawQrCode:', err)
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

const DEFAULTS = {
  nome:          'DIEGO ARRIEIRA DE OLIVEIRA',
  nascimento:    '25/10/1988',
  localNascimento: 'SÃO PAULO, SP',
  primeiraHab:   '16/12/2016',
  emissao:       '13/11/2025',
  validade:      '13/11/2035',
  catHab:        'AB',
  docIdentidade: '47563970 DETRAN SP',
  cpf:           '369.065.548-08',
  registro:      '0404473756',
  nacionalidade: 'BRASILEIRO(A)',
  filiacao1:     'DIRCEU DE OLIVEIRA JUNIOR',
  filiacao2:     'DENISE ARRIEIRA DE OLIVEIRA',
  numero:        '8869505913',
  local:         'SÃO PAULO, SP',
  certA:         '36906554808',
  certB:         'SP040447375',
  mrz1:          'I<BRA0404473756<8<<<<<<<<<<<<<<',
  mrz2:          '8810254M3511135BRA<<<<<<<<<<<0',
  mrz3:          'DIEGO<<ARRIEIRA<DE<OLIVEIRA<<<',
}

export function mergeCnhData(data = {}) {
  const merged = { ...data }
  for (const [key, val] of Object.entries(DEFAULTS)) {
    if (merged[key] == null || merged[key] === '') merged[key] = val
  }
  if (!merged.nacionalidade) merged.nacionalidade = DEFAULTS.nacionalidade
  return merged
}

export async function generateCnhPdf(data) {
  const merged = mergeCnhData(data)
  const key = JSON.stringify(merged)
  if (pdfBytesCache.has(key)) return pdfBytesCache.get(key)

  const templateRes = await fetch(LUIS_PDF_URL)
  if (!templateRes.ok) throw new Error(`Template PDF não encontrado (${templateRes.status})`)
  const templateBytes = await templateRes.arrayBuffer()
  const pdfDoc = await PDFDocument.load(templateBytes, { ignoreEncryption: true })

  // ── 1. Apaga o texto do Luis do stream bruto ──────────────────────────────
  await patchContentStreams(pdfDoc, {
    removeFoto: true,
    removeAssinatura: Boolean(merged.assinatura),
    removeQr: true,
  })

  // ── 2. Escreve texto do Diego como primitivas PDF nativas ─────────────────
  const page = pdfDoc.getPages()[0]
  const font = await loadFont(pdfDoc)
  const mrzFont = await pdfDoc.embedFont(StandardFonts.CourierBold)

  drawFrente(page, merged, font)
  drawVerso(page, merged, font)
  drawMrz(page, merged, mrzFont)
  await drawImages(page, pdfDoc, merged)
  await drawQrCode(page, pdfDoc, data)

  const bytes = await pdfDoc.save()
  pdfBytesCache.set(key, bytes)
  return bytes
}

export function clearCnhPdfCache() {
  pdfBytesCache.clear()
  defaultFotoBytesCache = null
}
