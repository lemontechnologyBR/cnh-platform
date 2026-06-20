import { useEffect, useRef } from 'react'

const CAT_ROWS = {
  ACC: 65, A: 91, A1: 117, B: 143, B1: 169, C: 195, C1: 221,
}

const FIELD_BOXES = [
  { key: 'validadeB', left: 348, right: 408, dataTop: 131, dataBottom: 152, size: 12, bold: true, center: true, color: '#D50000' },
  { key: 'local',     left: 112, right: 400, dataTop: 336, dataBottom: 356, size: 13, bold: true, color: '#363636' },
]

function drawTextInBox(ctx, text, field) {
  if (!text) return
  const innerLeft = field.left + (field.center ? 4 : 4)
  const innerRight = field.right - (field.center ? 4 : 4)
  const x = field.center ? innerLeft + (innerRight - innerLeft) / 2 : innerLeft

  ctx.fillStyle = field.color
  ctx.font = `${field.bold ? 'bold ' : ''}${field.size}px Arial, sans-serif`
  ctx.textAlign = field.center ? 'center' : 'left'

  if (field.center) {
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x, (field.dataTop + field.dataBottom) / 2)
    return
  }

  ctx.textBaseline = 'alphabetic'
  const m = ctx.measureText(text)
  const ascent = m.actualBoundingBoxAscent || field.size * 0.78
  const areaH = field.dataBottom - field.dataTop
  const textH = ascent + (m.actualBoundingBoxDescent || field.size * 0.22)
  ctx.fillText(text, innerLeft, field.dataTop + (areaH - textH) / 2 + ascent)
}

function drawCatLabel(ctx, label, y, active) {
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

export default function CnhCardBack({ data = {} }) {
  const canvasRef = useRef(null)

  const d = {
    numero:     data.numero     || '5117172437',
    catHab:     data.catHab     || 'AB',
    validade:   data.validade   || '13/11/2035',
    local:      data.local      || 'SÃO PAULO, SP',
    validadeB:  data.validade   || '13/11/2035',
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    img.src = '/cnh_template_verso.png'
    img.onload = () => {
      const S = 2
      const H = img.height

      canvas.width = H * S
      canvas.height = img.width * S

      ctx.scale(S, S)
      ctx.translate(H, 0)
      ctx.rotate(Math.PI / 2)

      ctx.drawImage(img, 0, 0)

      const cats = d.catHab.split('')
      Object.entries(CAT_ROWS).forEach(([label, y]) => {
        drawCatLabel(ctx, label, y, cats.includes(label))
      })

      FIELD_BOXES.forEach((field) => {
        drawTextInBox(ctx, d[field.key], field)
      })

      ctx.fillStyle = 'rgba(0,0,0,0.85)'
      ctx.font = 'bold 26px Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.save()
      ctx.translate(82, 540)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(d.numero, 0, 0)
      ctx.restore()
    }
  }, [JSON.stringify(d)])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4 }}
    />
  )
}
