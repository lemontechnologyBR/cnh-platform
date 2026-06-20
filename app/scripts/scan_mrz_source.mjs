import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto('http://localhost:5173/habilitacao', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 2000))

const scan = await page.evaluate(async () => {
  const { generateCnhPdf } = await import('/src/utils/generateCnhPdf.js')
  const { getPdfPage, renderPdfRegion } = await import('/src/utils/renderCnhPdf.js')

  const region = { left: 91, top: 1263, width: 726, height: 525 }
  const pdfBytes = await generateCnhPdf({})
  const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
  const pdfPage = await getPdfPage(blobUrl, 1)
  const canvas = await renderPdfRegion(pdfPage, region, 3)
  URL.revokeObjectURL(blobUrl)

  const w = canvas.width, h = canvas.height
  const ctx = canvas.getContext('2d')
  const img = ctx.getImageData(0, 0, w, h)
  function isGreen(r, g, b) { return g > 195 && g > r + 15 && g > b + 5 }

  let top = h, bottom = 0, left = w, right = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (isGreen(img.data[i], img.data[i+1], img.data[i+2])) {
        if (y < top) top = y
        if (y > bottom) bottom = y
        if (x < left) left = x
        if (x > right) right = x
      }
    }
  }

  return { w, h, top, bottom, left, right, greenW: right - left + 1, greenH: bottom - top + 1 }
})

console.log(JSON.stringify(scan, null, 2))
await browser.close()
