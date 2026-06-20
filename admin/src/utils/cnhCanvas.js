/** @param {CanvasRenderingContext2D} ctx */
export function drawTextInBox(ctx, text, field) {
  if (!text) return

  if (field.cover) {
    ctx.fillStyle = field.coverColor || '#eef2ea'
    ctx.fillRect(field.left, field.dataTop - 2, field.right - field.left, field.dataBottom - field.dataTop + 4)
  }

  const pad = field.pad ?? 4
  const innerLeft = field.left + (field.center ? pad : 4)
  const innerRight = field.right - (field.center ? pad : 4)
  const x = field.center ? innerLeft + (innerRight - innerLeft) / 2 : innerLeft
  const maxW = innerRight - innerLeft

  ctx.fillStyle = field.color
  ctx.font = `${field.bold ? 'bold ' : ''}${field.size}px Arial, sans-serif`
  ctx.textAlign = field.center ? 'center' : 'left'

  if (field.center) {
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x, (field.dataTop + field.dataBottom) / 2, maxW)
    return
  }

  ctx.textBaseline = 'alphabetic'
  const m = ctx.measureText(text)
  const ascent = m.actualBoundingBoxAscent || field.size * 0.78
  const descent = m.actualBoundingBoxDescent || field.size * 0.22
  const textH = ascent + descent
  const areaH = field.dataBottom - field.dataTop
  const y = field.dataTop + (areaH - textH) / 2 + ascent
  ctx.fillText(text, innerLeft, y, maxW)
}

/** @param {CanvasRenderingContext2D} ctx */
export function drawCatLabel(ctx, label, y, active) {
  if (active) {
    ctx.fillStyle = '#FFE8E8'
    ctx.fillRect(99, y - 11, 34, 22)
  }
  ctx.fillStyle = active ? '#D50000' : '#363636'
  ctx.font = 'bold 12px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 116, y)
}

/** @param {CanvasRenderingContext2D} ctx */
export function drawSideNumber(ctx, numero) {
  ctx.fillStyle = '#eef2ea'
  ctx.fillRect(68, 495, 36, 90)
  ctx.fillStyle = 'rgba(0,0,0,0.85)'
  ctx.font = 'bold 26px Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.save()
  ctx.translate(82, 540)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(numero, 0, 0)
  ctx.restore()
}

/** Desenha região do PDF rotacionada +90° (portrait) */
export function paintCnhCanvas(displayCanvas, pdfCanvas, drawOverlays) {
  const S = 2
  const H = pdfCanvas.height
  const W = pdfCanvas.width

  displayCanvas.width = H * S
  displayCanvas.height = W * S

  const ctx = displayCanvas.getContext('2d')
  ctx.scale(S, S)
  ctx.translate(H, 0)
  ctx.rotate(Math.PI / 2)
  ctx.drawImage(pdfCanvas, 0, 0)
  if (drawOverlays) drawOverlays(ctx)
}
