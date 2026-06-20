import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 420, height: 900 })
await page.goto('http://localhost:5173/habilitacao', { waitUntil: 'networkidle0', timeout: 60000 })

// slide 3 = MRZ (index 2)
await page.evaluate(() => {
  const dots = document.querySelectorAll('button[style*="border-radius"]')
  dots[2]?.click()
})
await new Promise(r => setTimeout(r, 2500))

const scan = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  if (!canvas) return { error: 'no canvas' }
  const ctx = canvas.getContext('2d')
  const w = canvas.width, h = canvas.height
  const img = ctx.getImageData(0, 0, w, h)
  function isGreen(r, g, b) { return g > 195 && g > r + 15 && g > b + 5 }
  function isWhite(r, g, b) { return r > 240 && g > 240 && b > 240 }

  // scan columns for green content
  let left = w, right = 0, top = h, bottom = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const r = img.data[i], g = img.data[i+1], b = img.data[i+2]
      if (isGreen(r, g, b) || (!isWhite(r, g, b) && g > 180)) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        if (y > bottom) bottom = y
      }
    }
  }

  // find white strip on right: last green column vs canvas width
  let lastGreenCol = 0
  for (let x = 0; x < w; x++) {
    let greenRows = 0
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4
      if (isGreen(img.data[i], img.data[i+1], img.data[i+2])) greenRows++
    }
    if (greenRows > h * 0.3) lastGreenCol = x
  }

  return { w, h, left, right, top, bottom, lastGreenCol, trimRight: w - 1 - lastGreenCol }
})

console.log(JSON.stringify(scan, null, 2))
await browser.close()
