import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function VeiculosPage() {
  const navigate = useNavigate()
  const [placa, setPlaca] = useState('')
  const [buscado, setBuscado] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F0F0F0' }}>
      <div style={{ background: '#1351B4', display: 'flex', alignItems: 'center', padding: '0 16px', height: 62, flexShrink: 0 }}>
        <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 16, paddingRight: 36 }}>Meus Veículos</span>
      </div>

      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 12 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: '#1C1C1E', margin: '0 0 12px' }}>Consultar Veículo por Placa</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="ABC1234"
              value={placa}
              onChange={e => setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,7))}
              style={{ flex: 1, height: 44, border: '1px solid #9E9E9E', borderRadius: 4, padding: '0 12px', fontSize: 16, fontFamily: 'monospace', letterSpacing: '0.15em', outline: 'none', boxSizing: 'border-box' }}
            />
            <button onClick={() => setBuscado(true)} style={{ height: 44, background: '#1351B4', border: 'none', borderRadius: 4, color: '#fff', fontWeight: 700, fontSize: 14, padding: '0 16px', cursor: 'pointer' }}>
              Buscar
            </button>
          </div>
        </div>

        {buscado && placa.length >= 7 && (
          <div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#1C1C1E', margin: 0 }}>Veículo Encontrado</p>
              <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>ATIVO</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {[['Placa',placa],['Renavam','00000000000'],['Marca/Modelo','DEMO / EXEMPLO'],['Ano Fab/Mod','2020/2021'],['Cor','Prata'],['Combustível','Flex'],['Município','São Paulo - SP'],['Categoria','Particular']].map(([l,v]) => (
                <div key={l}><p style={{ fontSize: 11, color: '#9E9E9E', margin: '0 0 2px' }}>{l}</p><p style={{ fontSize: 13.5, fontWeight: 600, color: '#1C1C1E', margin: 0 }}>{v}</p></div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <p style={{ fontSize: 11, color: '#9E9E9E', fontWeight: 700, padding: '10px 16px 8px', margin: 0, letterSpacing: '0.08em', borderBottom: '1px solid #F0F0F0', textTransform: 'uppercase' }}>Serviços Disponíveis</p>
          {['Consultar informações do CRV atual do veículo','Consultar dados de veículo na base RENAVAM','Realizar consulta sobre recall de veículos','Consultar Restrição de Roubo/Furto de Veículo','Consultar online os dados de placa veicular','Indicar online o principal condutor de um veículo','Homologar veículo de Coleção','Homologar veículo adquirido em Leilão'].map((item, i, arr) => (
            <button key={i} style={{ width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', cursor: 'pointer', borderBottom: i < arr.length-1 ? '1px solid #F0F0F0' : 'none', textAlign: 'left' }}>
              <span style={{ fontSize: 13.5, color: '#424242', flex: 1, paddingRight: 8 }}>{item}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="#1351B4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
