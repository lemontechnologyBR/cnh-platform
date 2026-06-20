import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto('http://localhost:5173/habilitacao', { waitUntil: 'networkidle0', timeout: 60000 })

const bands = await page.evaluate(async () => {
  const { generateCnhPdf } = await import('/src/utils/generateCnhPdf.js')
  const { getPdfPage, renderFullPdfPage } = await import('/src/utils/renderCnhPdf.js')
  const pdfBytes = await generateCnhPdf({})
  const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
  const pdfPage = await getPdfPage(blobUrl, 1)
  const { canvas } = await renderFullPdfPage(pdfPage, 3)
  URL.revokeObjectURL(blobUrl)

  const w = canvas.width, h = canvas.height
  const img = canvas.getContext('2d').getImageData(0, 0, w, h)
  function rowHasContent(y) {
    for (let x = 80; x < 820; x++) {
      const i = (y * w + x) * 4
      const r = img.data[i], g = img.data[i+1], b = img.data[i+2]
      if (r < 240 || g < 240 || b < 240) return true
    }
    return false
  }
  const bands = []
  let inBand = false, start = 0
  for (let y = 1200; y < h; y++) {
    const active = rowHasContent(y)
    if (active && !inBand) { inBand = true; start = y }
    if (!active && inBand) { bands.push({ top: start, bottom: y - 1, height: y - start }); inBand = false }
  }
  if (inBand) bands.push({ top: start, bottom: h - 1, height: h - start })
  return { pageH: h, bands }
})

console.log(JSON.stringify(bands, null, 2))
await browser.close()
