import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import zlib from 'zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const raw = fs.readFileSync(path.join(__dirname, '../public/cnh_luis.pdf'))

function tryInflate(buf) {
  try { return zlib.inflateRawSync(buf) } catch { try { return zlib.inflateSync(buf) } catch { return null } }
}

const str = raw.toString('latin1')
const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g
let sm, n = 0
while ((sm = streamRe.exec(str)) !== null) {
  n++
  let content = sm[1]
  const buf = Buffer.from(content, 'binary')
  const inflated = tryInflate(buf)
  if (inflated) content = inflated.toString('latin1')

  if (!content.includes('OCR-B') && !content.includes('QR') && !content.includes('/Image') && !content.includes('BRA0')) continue

  const markers = ['OCR-B', 'BRA0', 'LUIS', 'LUCAS', 'DIEGO', 'Nome e', 'Primeira Hab']
  if (!markers.some(m => content.includes(m))) continue

  console.log('\n=== Stream', n, 'len', content.length, '===')
  // show Tm lines with OCR-B nearby
  const parts = content.split(/(?=q\s)/)
  for (const p of parts) {
    if (/OCR-B|BRA0|LUIS|LUCAS|Nome e|Primeira Hab/.test(p)) {
      console.log(p.slice(0, 500).replace(/\s+/g, ' '))
    }
  }
}

// Count images
const imgCount = (str.match(/\/Subtype\s*\/Image/g) || []).length
console.log('\nImage XObjects:', imgCount)

// Page mediabox
const mb = str.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/)
console.log('MediaBox:', mb?.slice(1))
