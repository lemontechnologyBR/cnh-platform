import { useEffect, useRef, useState } from 'react'
import { generateCnhPdf } from '../utils/generateCnhPdf.js'
import { getPdfPage, renderPdfRegion } from '../utils/renderCnhPdf.js'
import { paintCnhCanvas } from '../utils/cnhCanvas.js'

const RENDER_SCALE = 3

const REGIONS = {
  frente: { left: 91, top: 192, width: 726, height: 525 },
  verso:  { left: 91, top: 738, width: 726, height: 525 },
}

const SIDES = ['frente', 'verso']

function CardCanvas({ side, data }) {
  const canvasRef = useRef(null)
  const blobRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setErro(null)
    ;(async () => {
      try {
        const pdfBytes = await generateCnhPdf(data)
        if (cancelled) return
        if (blobRef.current) URL.revokeObjectURL(blobRef.current)
        const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
        blobRef.current = blobUrl
        const page = await getPdfPage(blobUrl, 1)
        if (cancelled) return
        const pdfCanvas = await renderPdfRegion(page, REGIONS[side], RENDER_SCALE)
        if (cancelled) return
        paintCnhCanvas(canvasRef.current, pdfCanvas)
        if (!cancelled) setReady(true)
      } catch (e) {
        if (!cancelled) setErro(e.message)
      }
    })()
    return () => { cancelled = true }
  }, [side, JSON.stringify(data)])

  if (erro) return <div style={{ color: '#ef4444', fontSize: 12, padding: 8 }}>{erro}</div>
  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8, opacity: ready ? 1 : 0, transition: 'opacity 0.25s', aspectRatio: '525 / 726' }}
    />
  )
}

export default function CnhPdfPreview({ data }) {
  const [side, setSide] = useState('frente')

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {SIDES.map(s => (
          <button
            key={s}
            onClick={() => setSide(s)}
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: side === s ? '#4f8ef7' : '#1a1d27', color: side === s ? '#fff' : '#94a3b8' }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 340, background: '#1a1d27', borderRadius: 10, padding: 12, border: '1px solid #2d3748' }}>
        <CardCanvas side={side} data={data} />
      </div>
    </div>
  )
}
