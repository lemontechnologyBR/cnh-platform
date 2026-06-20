import { QRCodeSVG } from 'qrcode.react'
import { buildConsultaUrl } from '../utils/consultaUrl.js'

export default function CnhQrSlide({ data = {} }) {
  const url = buildConsultaUrl(data.cpf, data.registro)

  return (
    <div
      style={{
        background: '#fff',
        padding: '32px 24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 340,
      }}
    >
      <QRCodeSVG value={url} size={280} level="M" includeMargin={false} />
    </div>
  )
}

export function getCnhQrUrl(data = {}) {
  return buildConsultaUrl(data.cpf, data.registro)
}
