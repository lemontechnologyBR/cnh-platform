import { useEffect, useRef, useState } from 'react'
import { RENDER_SCALE } from '../data/cnhFieldBoxes'
import { generateCnhPdf, mergeCnhData } from '../utils/generateCnhPdf'

const CARD_REGIONS = {
  frente: { left: 91, top: 192, width: 726, height: 525 },
  verso:  { left: 91, top: 738, width: 726, height: 525 },
  mrz:    { left: 91, top: 1277, width: 726, height: 534 },
  qr:     { left: 970, top: 245, width: 645, height: 645 },
}
import { getPdfPage, renderPdfRegion } from '../utils/renderCnhPdf'
import { paintCnhCanvas } from '../utils/cnhCanvas'

export default function CnhPdfCard({ side = 'frente', data = {} }) {
  const region = CARD_REGIONS[side] ?? CARD_REGIONS.frente
  const aspectRatio = `${region.height} / ${region.width}`
  const canvasRef = useRef(null)
  const blobUrlRef = useRef(null)
  const [erro, setErro] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const display = canvasRef.current
    if (!display) return

    const d = mergeCnhData(data)
    setErro(null)
    setReady(false)

    ;(async () => {
      try {
        const pdfBytes = await generateCnhPdf(d)
        if (cancelled) return

        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
        const blobUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }))
        blobUrlRef.current = blobUrl

        const page = await getPdfPage(blobUrl, 1)
        if (cancelled) return

        const pdfCanvas = await renderPdfRegion(page, region, RENDER_SCALE)
        if (cancelled) return

        if (!pdfCanvas.width || !pdfCanvas.height) {
          throw new Error('Recorte do PDF vazio')
        }

        paintCnhCanvas(display, pdfCanvas)
        if (!cancelled) setReady(true)
      } catch (err) {
        console.error('CnhPdfCard:', err)
        if (!cancelled) setErro('Não foi possível exibir a CNH. Tente recarregar a página.')
      }
    })()

    return () => {
      cancelled = true
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [side, JSON.stringify(data)])

  if (erro) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: 14 }}>
        <p style={{ margin: '0 0 12px' }}>{erro}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            background: '#1351B4', color: '#fff', border: 'none', borderRadius: 8,
            padding: '10px 20px', fontSize: 14, cursor: 'pointer',
          }}
        >
          Recarregar
        </button>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        clipPath: 'inset(0 round 8px)',
        aspectRatio,
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.2s',
      }}
    />
  )
}
