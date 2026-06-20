import { useEffect, useRef } from 'react'

// Caixas medidas em cnh_template_branco.png (745×580, landscape)
// dataTop/dataBottom = área de dados abaixo do rótulo dentro da caixa
const FIELD_BOXES = [
  { key: 'nome',          left: 144, right: 598, dataTop: 171, dataBottom: 196, size: 15, bold: true,  color: '#363636' },
  { key: 'primeiraHab',   left: 610, right: 728, dataTop: 171, dataBottom: 196, size: 15, bold: true, color: '#363636' },
  { key: 'nascimento',    left: 348, right: 738, dataTop: 215, dataBottom: 239, size: 15, bold: true, color: '#363636' },
  { key: 'emissao',       left: 348, right: 453, dataTop: 259, dataBottom: 283, size: 15, bold: true, color: '#363636' },
  { key: 'validade',      left: 473, right: 578, dataTop: 259, dataBottom: 281, size: 15, bold: true, center: true, pad: 6, color: '#D50000' },
  { key: 'docIdentidade', left: 348, right: 738, dataTop: 303, dataBottom: 326, size: 15, bold: true, color: '#363636' },
  { key: 'cpf',           left: 348, right: 453, dataTop: 346, dataBottom: 370, size: 15, bold: true, color: '#363636' },
  { key: 'registro',      left: 495, right: 603, dataTop: 346, dataBottom: 368, size: 15, bold: true, center: true, pad: 6, color: '#D50000' },
  { key: 'catHab',        left: 626, right: 733, dataTop: 346, dataBottom: 368, size: 15, bold: true, center: true, pad: 6, color: '#D50000' },
  { key: 'nacionalidade', left: 348, right: 738, dataTop: 389, dataBottom: 413, size: 15, bold: true, color: '#363636' },
  { key: 'filiacao1',     left: 348, right: 738, dataTop: 431, dataBottom: 457, size: 15, bold: true, color: '#363636' },
  { key: 'filiacao2',     left: 348, right: 738, dataTop: 461, dataBottom: 487, size: 15, bold: true, color: '#363636' },
]

function drawTextInBox(ctx, text, field) {
  if (!text) return
  const pad = field.pad ?? 4
  const padX = field.center ? pad : 4
  const innerLeft = field.left + padX
  const innerRight = field.right - padX
  const boxW = innerRight - innerLeft
  const x = field.center ? innerLeft + boxW / 2 : innerLeft
  const maxW = boxW

  ctx.fillStyle = field.color
  ctx.font = `${field.bold ? 'bold ' : ''}${field.size}px Arial, sans-serif`
  ctx.textAlign = field.center ? 'center' : 'left'

  if (field.center) {
    ctx.textBaseline = 'middle'
    const y = (field.dataTop + field.dataBottom) / 2 + (field.yOffset || 0)
    ctx.fillText(text, x, y, maxW)
    return
  }

  ctx.textBaseline = 'alphabetic'
  const m = ctx.measureText(text)
  const ascent = m.actualBoundingBoxAscent || field.size * 0.78
  const descent = m.actualBoundingBoxDescent || field.size * 0.22
  const textH = ascent + descent
  const areaH = field.dataBottom - field.dataTop
  const y = field.dataTop + (areaH - textH) / 2 + ascent + (field.yOffset || 0)

  ctx.fillText(text, x, y, maxW)
}

export default function CnhMockCard({ data = {} }) {
  const canvasRef = useRef(null)

  const d = {
    nome:           data.nome          || 'DIEGO ARRIEIRA DE OLIVEIRA',
    primeiraHab:    data.primeiraHab   || '26/02/2007',
    nascimento:     data.nascimento    || '25/10/1988, SÃO PAULO, SP',
    emissao:        data.emissao       || '16/12/2025',
    validade:       data.validade      || '13/11/2035',
    docIdentidade:  data.docIdentidade || '47526376 DETRAN SP',
    cpf:            data.cpf           || '369.065.548-08',
    registro:       data.registro      || '0404473756',
    catHab:         data.catHab        || 'AB',
    nacionalidade:  data.nacionalidade || 'BRASILEIRO(A)',
    filiacao1:      data.filiacao1     || 'DIRCEU DE OLIVEIRA JUNIOR',
    filiacao2:      data.filiacao2     || 'DENISE ARRIEIRA DE OLIVEIRA',
    numero:         data.numero        || '5117172437',
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = new window.Image()
    img.src = '/cnh_template_branco.png'
    img.onload = () => {
      const S = 2
      const H = img.height

      canvas.width = H * S
      canvas.height = img.width * S

      ctx.scale(S, S)
      ctx.translate(H, 0)
      ctx.rotate(Math.PI / 2)

      ctx.drawImage(img, 0, 0)

      // Número abaixo de "VÁLIDA..." — x controla posição vertical no portrait
      ctx.fillStyle = 'rgba(0,0,0,0.85)'
      ctx.font = 'bold 26px Arial, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.save()
      ctx.translate(82, 540)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(d.numero, 0, 0)
      ctx.restore()

      FIELD_BOXES.forEach((field) => {
        drawTextInBox(ctx, d[field.key], field)
      })
    }
  }, [JSON.stringify(d)])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4 }}
    />
  )
}
