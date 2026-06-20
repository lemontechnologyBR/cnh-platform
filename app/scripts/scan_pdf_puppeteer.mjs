import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pdfB64 = fs.readFileSync(path.join(__dirname, '../public/cnh_luis.pdf')).toString('base64')

const html = `<!DOCTYPE html>
<html><body><canvas id="c"></canvas>
<script type="module">
import * as pdfjsLib from '../../node_modules/pdfjs-dist/legacy/build/pdf.mjs'
pdfjsLib.GlobalWorkerOptions.workerSrc = '../../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs'
const data = atob('${pdfB64}')
const bytes = new Uint8Array(data.length)
for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i)
const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
const page = await pdf.getPage(1)
const scale = 3
const vp = page.getViewport({ scale })
const canvas = document.getElementById('c')
canvas.width = vp.width
canvas.height = vp.height
await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise
window.__done = true
window.__size = { w: vp.width, h: vp.height }
</script></body></html>`

const htmlPath = path.join(__dirname, '../public/_scan.html')
fs.writeFileSync(htmlPath, html)

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 120000 })
await page.waitForFunction('window.__done', { timeout: 120000 })

const bands = await page.evaluate(() => {
  const canvas = document.getElementById('c')
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  const img = ctx.getImageData(0, 0, w, h)
  function isGreen(r, g, b) { return g > 195 && g > r + 15 && g > b + 5 }
  function scanRow(y) {
    let left = -1, right = -1, green = 0
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (isGreen(img.data[i], img.data[i+1], img.data[i+2])) {
        green++
        if (left < 0) left = x
        right = x
      }
    }
    return { left, right, width: left >= 0 ? right - left + 1 : 0, green }
  }
  const bands = []
  let inBand = false, bandStart = 0
  for (let y = 0; y < h; y++) {
    const r = scanRow(y)
    const active = r.green > 400
    if (active && !inBand) { inBand = true; bandStart = y }
    if (!active && inBand) {
      const mid = Math.round((bandStart + y - 1) / 2)
      const row = scanRow(mid)
      bands.push({ top: bandStart, bottom: y - 1, height: y - bandStart, left: row.left, width: row.width })
      inBand = false
    }
  }
  return { size: window.__size, bands }
})

console.log(JSON.stringify(bands, null, 2))

const png = await page.$eval('#c', el => el.toDataURL('image/png'))
fs.writeFileSync(path.join(__dirname, '../public/_debug_full.png'), Buffer.from(png.split(',')[1], 'base64'))

await browser.close()
fs.unlinkSync(htmlPath)
