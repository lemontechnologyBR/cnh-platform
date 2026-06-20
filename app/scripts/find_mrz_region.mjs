import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createCanvas } from 'canvas'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(__dirname, '../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs')
).href

class NodeCanvasFactory {
  create(w, h) {
    const canvas = createCanvas(w, h)
    return { canvas, context: canvas.getContext('2d') }
  }
  reset({ canvas }, w, h) {
    canvas.width = w
    canvas.height = h
  }
  destroy() {}
}

const pdfPath = path.join(__dirname, '../public/cnh_luis.pdf')
const data = new Uint8Array(fs.readFileSync(pdfPath))
const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise
const page = await pdf.getPage(1)
const scale = 3
const vp = page.getViewport({ scale })
const factory = new NodeCanvasFactory()
const { canvas, context } = factory.create(vp.width, vp.height)
await page.render({ canvasContext: context, viewport: vp, canvasFactory: factory }).promise

console.log('Page px:', vp.width, 'x', vp.height)

const w = vp.width, h = vp.height
const img = context.getImageData(0, 0, w, h)

function isGreen(r, g, b) {
  return g > 195 && g > r + 15 && g > b + 5
}

function scanRow(y) {
  let left = -1, right = -1, green = 0
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4
    const r = img.data[i], g = img.data[i+1], b = img.data[i+2]
    if (isGreen(r, g, b)) {
      green++
      if (left < 0) left = x
      right = x
    }
  }
  return { left, right, width: left >= 0 ? right - left + 1 : 0, green }
}

// Find green bands (card regions)
let bands = []
let inBand = false, bandStart = 0
for (let y = 0; y < h; y++) {
  const r = scanRow(y)
  const active = r.green > 400
  if (active && !inBand) { inBand = true; bandStart = y }
  if (!active && inBand) {
    bands.push({ top: bandStart, bottom: y - 1, height: y - bandStart })
    inBand = false
  }
}
if (inBand) bands.push({ top: bandStart, bottom: h - 1, height: h - bandStart })

console.log('\nGreen bands (scale 3 px):')
bands.forEach((b, i) => {
  const mid = Math.round((b.top + b.bottom) / 2)
  const row = scanRow(mid)
  console.log(`Band ${i}: top=${b.top} (${(b.top/scale).toFixed(1)}pt) h=${b.height} left=${row.left} width=${row.width}`)
})

// Save full render for debug
const out = path.join(__dirname, '../public/_debug_full.png')
fs.writeFileSync(out, canvas.toBuffer('image/png'))
console.log('\nSaved', out)

// Crop candidate MRZ band (3rd green band after frente/verso?)
if (bands.length >= 3) {
  const b = bands[2]
  const row = scanRow(Math.round((b.top + b.bottom) / 2))
  const region = {
    left: row.left,
    top: b.top,
    width: row.width,
    height: b.height,
  }
  console.log('\nMRZ candidate region:', region)
  const crop = createCanvas(region.width, region.height)
  crop.getContext('2d').drawImage(canvas, region.left, region.top, region.width, region.height, 0, 0, region.width, region.height)
  fs.writeFileSync(path.join(__dirname, '../public/_debug_mrz.png'), crop.toBuffer('image/png'))
}

// QR band (4th?)
if (bands.length >= 4) {
  const b = bands[3]
  const row = scanRow(Math.round((b.top + b.bottom) / 2))
  console.log('\nQR candidate band:', { top: b.top, height: b.height, left: row.left, width: row.width })
}
