import theme from '../styles/theme.js'

export default function BrandLogo({ height = 44, showSubtitle = true, subtitle = 'Painel de controle' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img
        src="/logo-phoenix.png"
        alt="Cupula Fenix"
        style={{ height, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
      />
      {showSubtitle && (
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: theme.text, lineHeight: 1.1 }}>
            Cupula <span style={{ color: theme.accentGold }}>Fenix</span>
          </div>
          {subtitle && (
            <div style={{ color: theme.textDim, fontSize: 11, marginTop: 3 }}>{subtitle}</div>
          )}
        </div>
      )}
    </div>
  )
}
