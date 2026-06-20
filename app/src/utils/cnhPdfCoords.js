/** Converte coordenadas do card (745×580) para pontos PDF (origem inferior esquerda). */
export const PDF_RENDER_SCALE = 3

export function cardToPdf(pageHeight, region, cardX, cardYTop) {
  return {
    x: (region.left + cardX) / PDF_RENDER_SCALE,
    y: pageHeight - (region.top + cardYTop) / PDF_RENDER_SCALE,
  }
}

export function cardBoxToPdf(pageHeight, region, left, top, right, bottom) {
  const x = (region.left + left) / PDF_RENDER_SCALE
  const y = pageHeight - (region.top + bottom) / PDF_RENDER_SCALE
  const w = (right - left) / PDF_RENDER_SCALE
  const h = (bottom - top) / PDF_RENDER_SCALE
  return { x, y, w, h }
}

export function pxToPt(px) {
  return px / PDF_RENDER_SCALE
}
