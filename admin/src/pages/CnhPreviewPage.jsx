import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import CnhPdfPreview from '../components/CnhPdfPreview.jsx'
import { api } from '../utils/api.js'

export default function CnhPreviewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cnh, setCnh] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getCnh(id).then(c => { setCnh(c); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!window.confirm(`Excluir CNH de "${cnh?.nome}"?`)) return
    await api.deleteCnh(id)
    navigate('/cnhs')
  }

  if (loading) return <Layout><div style={{ color: '#64748b', padding: 40 }}>Carregando...</div></Layout>
  if (!cnh) return <Layout><div style={{ color: '#ef4444', padding: 40 }}>CNH não encontrada</div></Layout>

  return (
    <Layout>
      <div className="admin-split">
        <div className="admin-split__main">
          <div className="admin-form-header" style={{ marginBottom: 24 }}>
            <button onClick={() => navigate('/cnhs')} style={{ background: '#161210', border: '1px solid #3a2820', borderRadius: 8, padding: '8px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>← Voltar</button>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{cnh.nome || '—'}</h1>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            <button
              onClick={() => navigate(`/cnhs/${id}/editar`)}
              style={{ background: '#f59e0b20', color: '#f59e0b', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              style={{ background: '#ef444420', color: '#ef4444', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Excluir
            </button>
          </div>

          <div style={{ background: '#161210', borderRadius: 12, border: '1px solid #3a2820', overflow: 'hidden' }}>
            {[
              ['CPF', cnh.cpf],
              ['Registro', cnh.registro],
              ['Categoria', cnh.catHab],
              ['Nascimento', cnh.nascimento],
              ['Local nasc.', cnh.localNascimento],
              ['1ª Habilitação', cnh.primeiraHab],
              ['Emissão', cnh.emissao],
              ['Validade', cnh.validade],
              ['Doc. Identidade', cnh.docIdentidade],
              ['Nacionalidade', cnh.nacionalidade],
              ['Filiação 1 (Pai)', cnh.filiacao1],
              ['Filiação 2 (Mãe)', cnh.filiacao2],
              ['Local', cnh.local],
              ['Nº Lateral', cnh.numero],
              ['Cert. A', cnh.certA],
              ['Cert. B', cnh.certB],
              ['MRZ 1', cnh.mrz1],
              ['MRZ 2', cnh.mrz2],
              ['MRZ 3', cnh.mrz3],
              ['Criado em', cnh.created_at ? new Date(cnh.created_at).toLocaleString('pt-BR') : '—'],
              ['Expira em', cnh.expires_at ? new Date(cnh.expires_at).toLocaleString('pt-BR') : '—'],
            ].map(([label, value], i, arr) => (
              <div
                key={label}
                className="admin-info-row"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #221816' : 'none' }}
              >
                <span className="admin-info-row__label" style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: 13, color: '#e2e8f0', fontFamily: label.startsWith('MRZ') || label === 'Cert.' ? 'monospace' : 'inherit' }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-split__side">
          <div style={{ marginBottom: 12, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preview do documento</div>
          <CnhPdfPreview data={cnh} />
        </div>
      </div>
    </Layout>
  )
}
