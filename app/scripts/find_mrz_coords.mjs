import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PDFDocument } from 'pdf-lib'
import zlib from 'zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pdfPath = path.join(__dirname, '../public/cnh_luis.pdf')
const bytes = fs.readFileSync(pdfPath)
const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
const page = pdf.getPages()[0]
const { width, height } = page.getSize()
console.log('Page size pt:', width, 'x', height)

// Raw scan for text patterns in PDF
const raw = bytes.toString('latin1')
const idx = raw.indexOf('I<BRA')
console.log('I<BRA at byte', idx)

// Find all BT blocks with OCR-B or MRZ-like content
const re = /(\d+\.?\d*)\s+(\d+\.?\d*)\s+Td[\s\S]{0,200}?<([0-9A-Fa-f]+)>\s+Tj/g
let m
const hits = []
while ((m = re.exec(raw)) !== null) {
  const hex = m[3]
  if (hex.length > 20) hits.push({ x: m[1], y: m[2], hexLen: hex.length, pos: m.index })
}
console.log('Long hex Tj blocks:', hits.length)
hits.slice(0, 20).forEach(h => console.log(h))

// Search for "Nome e Sobrenome" in streams
const nomeIdx = raw.indexOf('Nome e Sobrenome')
console.log('Nome e Sobrenome at', nomeIdx)

// Decompress streams and find MRZ coordinates
function inflate(data) {
  try { return zlib.inflateRawSync(data) } catch { return zlib.inflateSync(data) }
}

const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g
let sm
let streamNum = 0
while ((sm = streamRe.exec(raw)) !== null) {
  streamNum++
  let content = sm[1]
  // try inflate
  try {
    const buf = Buffer.from(content, 'binary')
    try { content = inflate(buf).toString('latin1') } catch { /* plain */ }
  } catch { /* plain */ }

  if (content.includes('I<BRA') || content.includes('Nome e Sobrenome') || content.includes('LUCAS')) {
    console.log('\n--- Stream', streamNum, '---')
    // extract Tm/Td positions near MRZ
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (/I<BRA|LUCAS|Nome e Sobrenome|Primeira Habilit/.test(line) ||
          (line.includes('Tm') && i < lines.length)) {
        const ctx = lines.slice(Math.max(0,i-3), i+4).join(' | ')
        if (/I<BRA|LUCAS|Nome|Primeira|Observ/.test(ctx)) console.log(ctx.slice(0, 300))
      }
    }
  }
}
