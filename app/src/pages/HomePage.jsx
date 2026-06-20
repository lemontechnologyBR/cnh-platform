import { useNavigate } from 'react-router-dom'

const cards = [
  {
    id: 'condutor',
    label: 'CONDUTOR',
    desc: <>Gerencie sua <strong>habilitação</strong></>,
    bg: '#2E9E4F',
    image: '/bg_condutor.jpg',
    route: '/cnh',
  },
  {
    id: 'veiculos',
    label: 'VEÍCULOS',
    desc: <>Acesso ao <strong>CRLV-e</strong>,<br />venda digital</>,
    bg: '#E8B800',
    image: '/bg_veiculos.jpg',
    route: '/veiculos',
  },
  {
    id: 'infracoes',
    label: 'INFRAÇÕES',
    desc: <>Visualize e pague infrações<br />com até <strong>40% de desconto</strong></>,
    bg: '#1A3C8F',
    image: '/bg_infracoes.jpg',
    route: '/multas',
  },
  {
    id: 'educacao',
    label: 'EDUCAÇÃO',
    desc: <>Conheça nossas<br /><strong>campanhas</strong> e <strong>projetos</strong></>,
    bg: '#2196C9',
    image: '/bg_educacao.jpg',
    route: '/home',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#EBEBEB', fontFamily: "'Rawline','Roboto',sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#071D41', display: 'flex', alignItems: 'center', padding: '0 16px', height: 56, flexShrink: 0 }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 17 }}>
          CNH do Brasil
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#071D41', fontWeight: 700, fontSize: 15 }}>D</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => navigate(card.route)}
            style={{
              width: '100%', height: 110,
              border: 'none', borderRadius: 10,
              cursor: 'pointer', overflow: 'hidden',
              padding: 0,
            }}
          >
            <img
              src={card.image} alt={card.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {/* Footer logos */}
      <div style={{ background: '#EBEBEB', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
        <img src="/serpro.png" alt="Serpro" style={{ height: 40, objectFit: 'contain', flex: 1 }} />
        <img src="/cnhdobrasil.png" alt="CNH" style={{ height: 40, objectFit: 'contain', flex: 1 }} />
        <img src="/ministerioTransp.png" alt="Ministério" style={{ height: 56, objectFit: 'contain', flex: 2 }} />
      </div>
    </div>
  )
}
