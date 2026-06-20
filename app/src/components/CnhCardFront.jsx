// Frente da CNH-e — baseado no layout oficial do PDF CNH-e
export default function CnhCardFront({ data }) {
  const {
    nome        = 'DIEGO ARRIEIRA DE OLIVEIRA',
    primeiraHab = '26/02/2007',
    nascimento  = '25/10/1988, SÃO PAULO, SP',
    emissao     = '16/12/2025',
    validade    = '13/11/2035',
    acc         = 'ACC',
    docIdentidade = '47526376 DETRAN SP',
    cpf         = '369.065.548-08',
    registro    = '0404473756',
    catHab      = 'AB',
    nacionalidade = 'BRASILEIRO(A)',
    filiacao1   = 'DIRCEU DE OLIVEIRA JUNIOR',
    filiacao2   = 'DENISE ARRIEIRA DE OLIVEIRA',
    numero      = '5117172437',
    foto        = null,
    assinatura  = null,
  } = data || {}

  const bg = '#eef2ea'
  const borderColor = '#b0b8a8'
  const headerBg = '#0a1628'
  const gold = '#c8a84b'
  const labelStyle = { fontSize: 6.5, color: '#555', fontWeight: 400, letterSpacing: '0.03em', marginBottom: 1, textTransform: 'uppercase' }
  const valueStyle = { fontSize: 10, color: '#111', fontWeight: 500, lineHeight: 1.3 }
  const fieldBox = { border: `0.5px solid ${borderColor}`, padding: '3px 5px', background: bg }

  return (
    <div style={{
      background: bg,
      fontFamily: "'Arial','Helvetica',sans-serif",
      width: '100%',
      aspectRatio: '1.585',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 4,
    }}>
      {/* Faixa lateral esquerda rotacionada */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 22,
        background: bg,
        borderRight: `0.5px solid ${borderColor}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        zIndex: 2,
      }}>
        <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: 5.5, fontWeight: 700, letterSpacing: '0.12em', color: '#333', marginBottom: 8 }}>
          VÁLIDA EM TODO O TERRITÓRIO NACIONAL
        </div>
        <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', color: '#222' }}>
          {numero}
        </div>
      </div>

      {/* Conteúdo principal (tudo à direita da faixa) */}
      <div style={{ position: 'absolute', left: 22, right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Header negro */}
        <div style={{ background: headerBg, display: 'flex', alignItems: 'center', padding: '4px 6px', gap: 6, flexShrink: 0 }}>
          {/* Brasão */}
          <img src="/pdf_img_0.jpg" alt="brasão" style={{ height: 28, width: 28, objectFit: 'contain', filter: 'invert(1) sepia(1) saturate(2) hue-rotate(10deg)', flexShrink: 0 }} />
          {/* Texto central */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 7, fontWeight: 700, letterSpacing: '0.18em' }}>REPÚBLICA FEDERATIVA DO BRASIL</div>
            <div style={{ color: '#ccc', fontSize: 5.5, letterSpacing: '0.12em' }}>MINISTÉRIO DOS TRANSPORTES</div>
            <div style={{ color: '#ccc', fontSize: 5.5, letterSpacing: '0.12em' }}>SECRETARIA NACIONAL DE TRÂNSITO</div>
          </div>
          {/* BR emblem */}
          <div style={{ width: 28, height: 28, border: `2px solid ${gold}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: gold, fontWeight: 900, fontSize: 10, letterSpacing: '-1px' }}>BR</span>
          </div>
        </div>

        {/* Título */}
        <div style={{ background: bg, borderBottom: `0.5px solid ${borderColor}`, padding: '2px 6px', textAlign: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: '0.08em', color: '#111' }}>
            CARTEIRA NACIONAL DE HABILITAÇÃO / DRIVER LICENSE / PERMISO DE CONDUCCIÓN
          </span>
        </div>

        {/* Corpo */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Mapa do Brasil + foto + assinatura */}
          <div style={{ width: 80, borderRight: `0.5px solid ${borderColor}`, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px', gap: 3, flexShrink: 0, position: 'relative' }}>
            {/* Mapa */}
            <div style={{ fontSize: 28, lineHeight: 1, color: gold, userSelect: 'none' }}>🗺</div>
            {/* Foto */}
            <div style={{ width: '100%', flex: 1, background: '#d0cfc8', border: `0.5px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 55, overflow: 'hidden', borderRadius: 2 }}>
              {foto
                ? <img src={foto} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <svg width="28" height="34" viewBox="0 0 24 30" fill="none"><circle cx="12" cy="9" r="6" fill="#888"/><path d="M2 28c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="#888"/></svg>
              }
            </div>
            {/* Assinatura */}
            <div style={{ width: '100%', height: 22, border: `0.5px solid ${borderColor}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, overflow: 'hidden' }}>
              {assinatura
                ? <img src={assinatura} alt="assinatura" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                : <span style={{ fontFamily: 'cursive', fontSize: 9, color: '#555' }}>D. Arrieira</span>
              }
            </div>
            <div style={{ fontSize: 5.5, color: '#777', letterSpacing: '0.04em' }}>7 ASSINATURA DO PORTADOR</div>
          </div>

          {/* Campos de dados */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Linha 1: Nome + 1ª Habilitação */}
            <div style={{ display: 'flex', borderBottom: `0.5px solid ${borderColor}` }}>
              <div style={{ ...fieldBox, flex: 1, borderRight: `0.5px solid ${borderColor}`, borderBottom: 'none', borderLeft: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>2 e 1  Nome e Sobrenome</div>
                <div style={{ ...valueStyle, fontSize: 9 }}>{nome}</div>
              </div>
              <div style={{ ...fieldBox, width: 55, borderBottom: 'none', borderRight: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>1ª Habilitação</div>
                <div style={valueStyle}>{primeiraHab}</div>
              </div>
            </div>

            {/* Linha 2: Nascimento */}
            <div style={{ ...fieldBox, borderBottom: `0.5px solid ${borderColor}`, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
              <div style={labelStyle}>3  Data, Local e UF de Nascimento</div>
              <div style={valueStyle}>{nascimento}</div>
            </div>

            {/* Linha 3: Emissão + Validade + ACC + cat */}
            <div style={{ display: 'flex', borderBottom: `0.5px solid ${borderColor}` }}>
              <div style={{ ...fieldBox, flex: 1, borderRight: `0.5px solid ${borderColor}`, borderBottom: 'none', borderLeft: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>4a  Data Emissão</div>
                <div style={valueStyle}>{emissao}</div>
              </div>
              <div style={{ ...fieldBox, flex: 1, borderRight: `0.5px solid ${borderColor}`, borderBottom: 'none', borderLeft: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>4b  Validade</div>
                <div style={{ ...valueStyle, color: '#cc0000', fontWeight: 700 }}>{validade}</div>
              </div>
              <div style={{ ...fieldBox, width: 28, borderRight: `0.5px solid ${borderColor}`, borderBottom: 'none', borderLeft: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>ACC</div>
                <div style={{ ...valueStyle, fontSize: 7 }}>{acc}</div>
              </div>
              <div style={{ ...fieldBox, width: 18, borderBottom: 'none', borderRight: 'none', borderLeft: 'none', borderTop: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#222' }}>D</span>
              </div>
            </div>

            {/* Linha 4: Doc identidade */}
            <div style={{ ...fieldBox, borderBottom: `0.5px solid ${borderColor}`, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
              <div style={labelStyle}>4c  Doc. Identidade / Órgão Emissor / UF</div>
              <div style={valueStyle}>{docIdentidade}</div>
            </div>

            {/* Linha 5: CPF + Registro + Cat */}
            <div style={{ display: 'flex', borderBottom: `0.5px solid ${borderColor}` }}>
              <div style={{ ...fieldBox, flex: 1, borderRight: `0.5px solid ${borderColor}`, borderBottom: 'none', borderLeft: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>4d  CPF</div>
                <div style={valueStyle}>{cpf}</div>
              </div>
              <div style={{ ...fieldBox, flex: 1, borderRight: `0.5px solid ${borderColor}`, borderBottom: 'none', borderLeft: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>5  Nº Registro</div>
                <div style={{ ...valueStyle, color: '#cc6600', fontWeight: 700 }}>{registro}</div>
              </div>
              <div style={{ ...fieldBox, width: 30, borderBottom: 'none', borderRight: 'none', borderLeft: 'none', borderTop: 'none' }}>
                <div style={labelStyle}>9  Cat Hab</div>
                <div style={{ ...valueStyle, fontSize: 13, fontWeight: 700 }}>{catHab}</div>
              </div>
            </div>

            {/* Linha 6: Nacionalidade */}
            <div style={{ ...fieldBox, borderBottom: `0.5px solid ${borderColor}`, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
              <div style={labelStyle}>Nacionalidade</div>
              <div style={valueStyle}>{nacionalidade}</div>
            </div>

            {/* Linha 7: Filiação */}
            <div style={{ ...fieldBox, flex: 1, borderLeft: 'none', borderRight: 'none', borderTop: 'none', borderBottom: 'none' }}>
              <div style={labelStyle}>Filiação</div>
              <div style={{ ...valueStyle, marginBottom: 2 }}>{filiacao1}</div>
              <div style={valueStyle}>{filiacao2}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
