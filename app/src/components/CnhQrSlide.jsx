import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { mergeCnhData } from '../utils/generateCnhPdf.js'
import {
  buildConsultaUrl,
  formatRegistroDisplay,
  getRegistroForConsulta,
} from '../utils/consultaUrl.js'

export default function CnhQrSlide({ data = {} }) {
  const wrapRef = useRef(null)
  const [size, setSize] = useState(340)
  const merged = mergeCnhData(data)
  const registro = getRegistroForConsulta(merged)
  const url = buildConsultaUrl(merged.cpf, registro, merged)

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

  return (
    <div
      ref={wrapRef}
      style={{
        background: '#fff',
        padding: '20px 16px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ padding: 8, background: '#fff' }}>
        <QRCodeSVG value={url} size={size} level="H" includeMargin={true} />
      </div>
      {registro && (
        <p
          style={{
            margin: '18px 0 0',
            fontSize: 17,
            fontWeight: 700,
            color: '#D50000',
            letterSpacing: '0.06em',
            fontFamily: "'Rawline','Roboto',sans-serif",
          }}
        >
          {formatRegistroDisplay(registro)}
        </p>
      )}
    </div>
  )
}

export function getCnhQrUrl(data = {}) {
  const merged = mergeCnhData(data)
  const registro = getRegistroForConsulta(merged)
  return buildConsultaUrl(merged.cpf, registro, merged)
}
