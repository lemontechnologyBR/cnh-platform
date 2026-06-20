import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CnhPdfCard from '../components/CnhPdfCard'
import CnhQrSlide, { getCnhQrUrl } from '../components/CnhQrSlide'
import { fetchCnhUser, loadCnhUserFromStorage } from '../utils/cnhUser.js'
import { clearCnhPdfCache } from '../utils/generateCnhPdf.js'

const SLIDES = [
  { id: 'frente', label: 'Frente' },
  { id: 'verso',  label: 'Verso' },
  { id: 'mrz',    label: 'MRZ' },
  { id: 'qr',     label: 'QR Code' },
]

export default function HabilitacaoPage() {
  const navigate = useNavigate()
  const [cnhData, setCnhData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [slide, setSlide] = useState(0)
  const touchStartX = useRef(null)
  const agora = new Date().toLocaleString('pt-BR')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        clearCnhPdfCache()
        const cnh = await fetchCnhUser()
        if (cancelled) return
        if (!cnh) {
          navigate('/govbr-login', { replace: true })
          return
        }
        setCnhData(cnh)
      } catch {
        const cached = loadCnhUserFromStorage()
        if (!cancelled) {
          if (cached) setCnhData(cached)
          else navigate('/govbr-login', { replace: true })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [navigate])

  const acoes = [
    { img: '/habilitacao.png', label: 'Histórico de emissões da CNH' },
    { img: '/export.png',      label: 'Exportar' },
    { img: '/remove.png',      label: 'Remover' },
    { img: '/copyqrcode.png',  label: 'Copiar QR Code' },
  ]

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) setSlide(s => Math.min(s + 1, SLIDES.length - 1))
      else setSlide(s => Math.max(s - 1, 0))
    }
    touchStartX.current = null
  }

  function renderSlide() {
    if (!cnhData) return null
    const id = SLIDES[slide].id
    if (id === 'frente') return <CnhPdfCard side="frente" data={cnhData} />
    if (id === 'verso')  return <CnhPdfCard side="verso"  data={cnhData} />
    if (id === 'mrz')    return <CnhPdfCard side="mrz"    data={cnhData} />
    if (id === 'qr')     return null
    return null
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#EBEBEB', color: '#64748b', fontFamily: "'Rawline','Roboto',sans-serif" }}>
        Carregando CNH...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#EBEBEB', fontFamily: "'Rawline','Roboto',sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#071D41', padding: '10px 16px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/cnh')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '0.04em' }}>HABILITAÇÃO</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 }}>Atualizado em {agora}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>

        {/* Banner autenticidade */}
        <div style={{ background: '#fff', padding: '10px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#555' }}>Verifique autenticidade do QR Code com o app </span>
          <span style={{ fontSize: 13, color: '#1351B4', fontWeight: 600 }}>Vio</span>
        </div>

        {/* Slider do card CNH / QR */}
        {SLIDES[slide].id === 'qr' ? (
          <div
            style={{ margin: '14px 8px 0', borderRadius: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.14)', overflow: 'hidden' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <CnhQrSlide data={cnhData} />
          </div>
        ) : (
        <div
          style={{ margin: '14px 6px 0', borderRadius: 10, boxShadow: '0 1px 8px rgba(0,0,0,0.14)', userSelect: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {renderSlide()}
        </div>
        )}

        {/* Dots de paginação */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 10 : 8,
                height: i === slide ? 10 : 8,
                borderRadius: '50%',
                background: i === slide ? '#1351B4' : '#C0C0C0',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* Botões de ação */}
        <div style={{ margin: '14px 14px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {acoes.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (item.label === 'Copiar QR Code' && cnhData) {
                  navigator.clipboard?.writeText(getCnhQrUrl(cnhData))
                }
              }}
              style={{
              background: '#fff', border: 'none', borderRadius: 10,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', width: '100%',
            }}>
              <img src={item.img} alt="" style={{ width: 24, height: 24, objectFit: 'contain', flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: '#1351B4', fontWeight: 500 }}>{item.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
