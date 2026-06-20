import { useNavigate } from 'react-router-dom'

const servicos = [
  { label: 'HABILITAÇÃO',              img: '/habilitacao.png', route: '/habilitacao' },
  { label: 'CADASTRO POSITIVO',        img: '/condutor.png',    route: null },
  { label: 'EXAMES TOXICOLÓGICOS',     img: '/exametoxico.png', route: null },
  { label: 'CURSOS ESPECIALIZADOS',    img: '/cursos.png',      route: null },
  { label: 'CREDENCIAL DE\nESTACIONAMENTO', img: '/credencial.png', route: null },
]

export default function CnhPage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#EBEBEB', fontFamily: "'Rawline','Roboto',sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#071D41', display: 'flex', alignItems: 'center', padding: '0 16px', height: 56, flexShrink: 0 }}>
        <button onClick={() => navigate('/home')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '0.06em' }}>CONDUTOR</span>
      </div>

      <div style={{ flex: 1, padding: '16px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Card Informações */}
        <div style={{ background: '#fff', borderRadius: 10, padding: '18px 18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: '#1C1C1E', margin: '0 0 10px' }}>Informações do Condutor</p>
          <div style={{ height: 1, background: '#E0E0E0', marginBottom: 14 }} />

          <Row label="Nome" value="D**** A******* D* O*******" full />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: 12 }}>
            <Col label="CPF" value="***.065.548-**" />
            <Col label="Sexo" value="MASCULINO" />
            <Col label="Categoria" value="AB" />
            <Col label="UF de Emissão" value="SP" />
            <Col label="Data de Validade" value="13/11/2035" />
            <Col label="Data de Emissão" value="16/12/2025" />
          </div>
        </div>

        {/* Grid de serviços */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {servicos.map((s, i) => (
            <button key={i} onClick={() => s.route && navigate(s.route)} style={{
              background: '#fff', border: 'none', borderRadius: 10,
              padding: '20px 10px 16px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              gridColumn: i === 4 ? '1' : 'auto',
            }}>
              <img src={s.img} alt={s.label} style={{ width: 36, height: 36, objectFit: 'contain' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1A237E', textAlign: 'center', letterSpacing: '0.03em', whiteSpace: 'pre-line' }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1C1C1E', fontWeight: 400 }}>{value}</div>
    </div>
  )
}

function Col({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1C1C1E', fontWeight: 400 }}>{value}</div>
    </div>
  )
}
