import { useEffect, useRef, useState } from 'react'
import { generateCnhPdf, mergeCnhData } from '../utils/generateCnhPdf.js'
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
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    let cancelled = false
    const display = canvasRef.current
    if (!display) return

    setReady(false)
    setLoading(true)
    setErro(null)

    const merged = mergeCnhData(data)

    ;(async () => {
      try {
        const pdfBytes = await generateCnhPdf(merged)
        if (cancelled) return

        if (blobRef.current) URL.revokeObjectURL(blobRef.current)
        const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
        blobRef.current = blobUrl

        const page = await getPdfPage(blobUrl, 1)
        if (cancelled) return

        const pdfCanvas = await renderPdfRegion(page, REGIONS[side], RENDER_SCALE)
        if (cancelled) return

        if (!pdfCanvas.width || !pdfCanvas.height) {
          throw new Error('Recorte do PDF vazio')
        }

        if (!canvasRef.current) throw new Error('Canvas indisponível')
        paintCnhCanvas(canvasRef.current, pdfCanvas)
        if (!cancelled) {
          setReady(true)
          setLoading(false)
        }
      } catch (e) {
        console.error('CnhPdfPreview:', e)
        if (!cancelled) {
          setErro(e?.message || 'Erro ao gerar preview')
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current)
        blobRef.current = null
      }
    }
  }, [side, JSON.stringify(data)])

  if (erro) {
    return (
      <div style={{ color: '#ef4444', fontSize: 12, padding: 12, lineHeight: 1.5 }}>
        Erro ao gerar CNH: {erro}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: 120 }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
          Gerando preview...
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: 8,
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.25s',
          aspectRatio: '525 / 726',
        }}
      />
    </div>
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
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: side === s ? '#FF6B00' : '#161210', color: side === s ? '#fff' : '#94a3b8' }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ maxWidth: 340, background: '#161210', borderRadius: 10, padding: 12, border: '1px solid #3a2820' }}>
        <CardCanvas side={side} data={data} />
      </div>
    </div>
  )
}
