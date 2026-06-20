import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { buildConsultaUrl } from '../utils/consultaUrl.js'

export default function CnhQrSlide({ data = {} }) {
  const wrapRef = useRef(null)
  const [size, setSize] = useState(340)
  const url = buildConsultaUrl(null, null, data)

  useEffect(() => {
    function updateSize() {
      const el = wrapRef.current
      if (!el) return
      const w = el.clientWidth - 32
      setSize(Math.min(Math.max(w, 300), 380))
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  if (!url) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 14 }}>
        Registro CNH não encontrado. Atualize os dados no painel.
      </div>
    )
  }

  return (
    <div
      ref={wrapRef}
      style={{
        background: '#fff',
        padding: '24px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <QRCodeSVG value={url} size={size} level="H" includeMargin={true} />
    </div>
  )
}

export function getCnhQrUrl(data = {}) {
  return buildConsultaUrl(null, null, data)
}
