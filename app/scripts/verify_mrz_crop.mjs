import puppeteer from 'puppeteer'

const regions = {
  mrz: { left: 128, top: 1413, width: 667, height: 294 },
  qr:  { left: 91, top: 1788, width: 726, height: 525 },
}

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.goto('http://localhost:5173/habilitacao', { waitUntil: 'networkidle0', timeout: 60000 })

for (const [name, region] of Object.entries(regions)) {
  const scan = await page.evaluate(async (region) => {
    const { generateCnhPdf } = await import('/src/utils/generateCnhPdf.js')
    const { getPdfPage, renderPdfRegion } = await import('/src/utils/renderCnhPdf.js')
    const pdfBytes = await generateCnhPdf({})
    const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
    const pdfPage = await getPdfPage(blobUrl, 1)
    const canvas = await renderPdfRegion(pdfPage, region, 3)
    URL.revokeObjectURL(blobUrl)
    const w = canvas.width, h = canvas.height
    const img = canvas.getContext('2d').getImageData(0, 0, w, h)
    function isWhite(r, g, b) { return r > 245 && g > 245 && b > 245 }
    let whiteRight = 0, whiteLeft = 0
    for (let x = w - 1; x >= 0; x--) {
      let whiteRows = 0
      for (let y = 0; y < h; y++) {
        const i = (y * w + x) * 4
        if (isWhite(img.data[i], img.data[i+1], img.data[i+2])) whiteRows++
      }
      if (whiteRows > h * 0.8) whiteRight++
      else break
    }
    for (let x = 0; x < w; x++) {
      let whiteRows = 0
      for (let y = 0; y < h; y++) {
        const i = (y * w + x) * 4
        if (isWhite(img.data[i], img.data[i+1], img.data[i+2])) whiteRows++
      }
      if (whiteRows > h * 0.8) whiteLeft++
      else break
    }
    return { w, h, whiteLeft, whiteRight }
  }, region)
  console.log(name, scan)
}

await browser.close()
