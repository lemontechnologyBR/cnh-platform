import { useNavigate } from 'react-router-dom'
import CnhLogo from '../components/CnhLogo'

export default function SplashPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#000',
      overflow: 'hidden',
      fontFamily: "'Rawline', 'Roboto', sans-serif",
    }}>
      {/* Foto motorista — ocupa ~60% da tela */}
      <div style={{ flex: '0 0 60%', overflow: 'hidden' }}>
        <img
          src="/motorista.jpg"
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 15%',
            display: 'block',
          }}
          draggable={false}
        />
      </div>

      {/* Card cinza claro — igual ao original */}
      <div style={{
        flex: 1,
        background: '#EBEBEB',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        marginTop: -28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 28px 32px',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.10)',
      }}>
        {/* Wrapper: logo + texto + botão todos centralizados */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Logo CNH */}
          <img
            src="/cnh-logo.png?v=2"
            alt="CNH do Brasil"
            style={{ width: '75%', objectFit: 'contain', display: 'block', marginBottom: 14 }}
            draggable={false}
          />

          {/* Texto termos */}
          <div style={{
            fontSize: 16,
            color: '#3D3D3D',
            lineHeight: 1.7,
            marginBottom: 22,
            textAlign: 'left',
          }}>
            <p style={{ margin: 0 }}>Ao entrar, você concorda com nosso</p>
            <p style={{ margin: 0 }}>
              <a href="#" style={{ color: '#1351B4', textDecoration: 'underline', fontWeight: 400 }} onClick={e => e.preventDefault()}>
                Termo de Responsabilidade
              </a>{' '}e
            </p>
            <p style={{ margin: 0 }}>
              <a href="#" style={{ color: '#1351B4', textDecoration: 'underline', fontWeight: 400 }} onClick={e => e.preventDefault()}>
                Política de Privacidade
              </a>
            </p>
          </div>

          {/* Botão centralizado no wrapper */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/govbr-login')}
              style={{
                paddingLeft: 60,
                paddingRight: 60,
                height: 46,
                background: '#1351B4',
                border: 'none',
                borderRadius: 100,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '0.09em', fontFamily: "'Rawline','Roboto',sans-serif" }}>
              ENTRAR COM
            </span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: "'Rawline','Roboto',sans-serif" }}>
                gov.br
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
