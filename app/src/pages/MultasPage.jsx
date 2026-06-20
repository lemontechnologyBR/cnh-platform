import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MULTAS = [
  { id:1, placa:'ABC1234', data:'10/03/2024', desc:'Excesso de velocidade em até 20%', valor:'R$ 130,16', pontos:4, status:'Pendente', orgao:'DETRAN-SP' },
  { id:2, placa:'ABC1234', data:'22/01/2024', desc:'Avanço de sinal vermelho', valor:'R$ 293,47', pontos:7, status:'Paga', orgao:'CET-SP' },
  { id:3, placa:'ABC1234', data:'05/11/2023', desc:'Parar sobre a faixa de pedestres', valor:'R$ 195,23', pontos:5, status:'Em Recurso', orgao:'DETRAN-SP' },
]

const STATUS_STYLE = {
  'Pendente': { bg:'#FEF3C7', color:'#92400E' },
  'Paga':     { bg:'#D1FAE5', color:'#065F46' },
  'Em Recurso':{ bg:'#DBEAFE', color:'#1E40AF' },
}

export default function MultasPage() {
  const navigate = useNavigate()
  const [filtro, setFiltro] = useState('todas')

  const lista = filtro === 'todas' ? MULTAS : MULTAS.filter(m =>
    filtro === 'pendente' ? m.status === 'Pendente' :
    filtro === 'paga' ? m.status === 'Paga' : m.status === 'Em Recurso'
  )

  const totalPendente = MULTAS.filter(m => m.status === 'Pendente')
    .reduce((a, m) => a + parseFloat(m.valor.replace('R$ ','').replace(',','.')), 0)

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#F0F0F0' }}>
      <div style={{ background:'#1351B4', display:'flex', alignItems:'center', padding:'0 16px', height:62, flexShrink:0 }}>
        <button onClick={() => navigate('/home')} style={{ background:'none', border:'none', cursor:'pointer', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex:1, textAlign:'center', color:'#fff', fontWeight:700, fontSize:16, paddingRight:36 }}>Infrações e Multas</span>
      </div>

      <div style={{ flex:1, padding:16, overflowY:'auto' }}>
        {/* Resumo */}
        <div style={{ background:'linear-gradient(135deg,#1351B4,#071D41)', borderRadius:12, padding:16, marginBottom:14 }}>
          <p style={{ color:'rgba(255,255,255,0.6)', fontSize:12, margin:'0 0 3px' }}>Total a pagar</p>
          <p style={{ color:'#fff', fontWeight:800, fontSize:26, margin:'0 0 12px' }}>
            R$ {totalPendente.toFixed(2).replace('.',',')}
          </p>
          <div style={{ display:'flex', gap:20 }}>
            <div><p style={{ color:'rgba(255,255,255,0.5)', fontSize:11, margin:'0 0 1px' }}>Multas pendentes</p><p style={{ color:'#fff', fontWeight:700, fontSize:15, margin:0 }}>{MULTAS.filter(m=>m.status==='Pendente').length}</p></div>
            <div><p style={{ color:'rgba(255,255,255,0.5)', fontSize:11, margin:'0 0 1px' }}>Total de pontos</p><p style={{ color:'#fff', fontWeight:700, fontSize:15, margin:0 }}>{MULTAS.filter(m=>m.status==='Pendente').reduce((a,m)=>a+m.pontos,0)}</p></div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display:'flex', gap:8, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
          {[['todas','Todas'],['pendente','Pendentes'],['paga','Pagas'],['recurso','Em Recurso']].map(([id,lbl]) => (
            <button key={id} onClick={() => setFiltro(id)} style={{
              flexShrink:0, padding:'7px 14px', borderRadius:100, fontSize:12.5, fontWeight:500,
              background: filtro===id ? '#1351B4' : '#fff',
              color: filtro===id ? '#fff' : '#555',
              border: filtro===id ? 'none' : '1px solid #DDD',
              cursor:'pointer',
            }}>{lbl}</button>
          ))}
        </div>

        {/* Cards de multas */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:12 }}>
          {lista.map(m => (
            <div key={m.id} style={{ background:'#fff', borderRadius:8, padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ flex:1, paddingRight:8 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color:'#1C1C1E' }}>{m.placa}</span>
                    <span style={{ color:'#CCC' }}>•</span>
                    <span style={{ fontSize:12, color:'#9E9E9E' }}>{m.data}</span>
                  </div>
                  <p style={{ fontSize:13.5, color:'#424242', margin:0, lineHeight:1.4 }}>{m.desc}</p>
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:100, ...STATUS_STYLE[m.status], flexShrink:0 }}>{m.status}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid #F0F0F0' }}>
                <div style={{ display:'flex', gap:16 }}>
                  {[['Valor', m.valor, '#CC0000'],['Pontos', `${m.pontos} pts`, '#1C1C1E'],['Órgão', m.orgao, '#1C1C1E']].map(([l,v,c]) => (
                    <div key={l}><p style={{ fontSize:10, color:'#9E9E9E', margin:'0 0 1px' }}>{l}</p><p style={{ fontSize:12.5, fontWeight:700, color:c, margin:0 }}>{v}</p></div>
                  ))}
                </div>
                {m.status === 'Pendente' && (
                  <button style={{ background:'#1351B4', border:'none', borderRadius:6, padding:'6px 14px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>Pagar</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Outros serviços */}
        <div style={{ background:'#fff', borderRadius:8, boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden' }}>
          <p style={{ fontSize:11, color:'#9E9E9E', fontWeight:700, padding:'10px 16px 8px', margin:0, letterSpacing:'0.08em', borderBottom:'1px solid #F0F0F0', textTransform:'uppercase' }}>Outros Serviços</p>
          {['Defesa da Autuação','Apresentar recurso contra penalidade de multa','Solicitação de Advertência','Restituição de Multa de Trânsito','Obter desconto sobre o valor de multas'].map((item,i,arr) => (
            <button key={i} style={{ width:'100%', background:'none', border:'none', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', cursor:'pointer', borderBottom:i<arr.length-1?'1px solid #F0F0F0':'none', textAlign:'left' }}>
              <span style={{ fontSize:13.5, color:'#424242' }}>{item}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#1351B4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
