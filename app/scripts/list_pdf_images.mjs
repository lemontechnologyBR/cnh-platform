import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { PDFDocument, PDFName } from 'pdf-lib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const bytes = fs.readFileSync(path.join(__dirname, '../public/cnh_luis.pdf'))
const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
const page = pdf.getPages()[0]
const { width, height } = page.getSize()
console.log('Page:', width, 'x', height)

// List XObjects from page resources
const resources = page.node.Resources()
const xobj = resources?.lookup(PDFName.of('XObject'))
if (xobj) {
  const entries = xobj.entries()
  for (const [name, ref] of entries) {
    const obj = pdf.context.lookup(ref)
    const subtype = obj?.dict?.get(PDFName.of('Subtype'))?.toString()
    const w = obj?.dict?.get(PDFName.of('Width'))
    const h = obj?.dict?.get(PDFName.of('Height'))
    console.log(name.toString(), subtype, w ? ` ${w} x ${h}` : '')
  }
}

// Search raw for Do operators with images
const raw = bytes.toString('latin1')
const doRe = /\/(Image-\d+|Im\d+)\s+Do/g
const dos = [...raw.matchAll(doRe)].map(m => m[1])
console.log('\nImage draws:', [...new Set(dos)])

// Find cm matrix before image draws (position)
for (const name of [...new Set(dos)]) {
  const re = new RegExp(`([\\d.]+)\\s+0\\s+0\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+cm\\s+\\/${name}\\s+Do`, 'g')
  let m
  while ((m = re.exec(raw)) !== null) {
    console.log(name, 'at x=', m[3], 'y=', m[4], 'scale', m[1], m[2])
  }
}
