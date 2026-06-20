import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

const pdfDocCache = new Map()

export function loadCnhPdf(url) {
  if (!pdfDocCache.has(url)) {
    const promise = pdfjsLib
      .getDocument({ url, useSystemFonts: true })
      .promise
      .catch((err) => {
        pdfDocCache.delete(url)
        throw err
      })
    pdfDocCache.set(url, promise)
  }
  return pdfDocCache.get(url)
}

/** Renderiza página inteira do PDF; retorna canvas + dimensões em pontos PDF */
export async function renderFullPdfPage(page, scale = 3) {
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
  const widthPt = viewport.width / scale
  const heightPt = viewport.height / scale
  return { canvas, widthPt, heightPt, viewport }
}

/** Renderiza região do card (coords medidos em scale=3) */
export async function renderPdfRegion(page, region, scale = 3) {
  const viewport = page.getViewport({ scale })
  const full = document.createElement('canvas')
  full.width = viewport.width
  full.height = viewport.height
  await page.render({ canvasContext: full.getContext('2d'), viewport }).promise

  const ratio = scale / 3
  const sx = Math.round(region.left * ratio)
  const sy = Math.round(region.top * ratio)
  const sw = Math.round(region.width * ratio)
  const sh = Math.round(region.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = region.width
  canvas.height = region.height
  canvas.getContext('2d').drawImage(full, sx, sy, sw, sh, 0, 0, region.width, region.height)
  return canvas
}

export async function getPdfPage(url, pageNum = 1) {
  const pdf = await loadCnhPdf(url)
  return pdf.getPage(pageNum)
}

/** Recorta região do card a partir de canvas já renderizado (scale=3) */
export function cropCanvasRegion(sourceCanvas, region, scale = 3) {
  const ratio = scale / 3
  const sx = Math.round(region.left * ratio)
  const sy = Math.round(region.top * ratio)
  const sw = Math.round(region.width * ratio)
  const sh = Math.round(region.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = region.width
  canvas.height = region.height
  canvas.getContext('2d').drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, region.width, region.height)
  return canvas
}
