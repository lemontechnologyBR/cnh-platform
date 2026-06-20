export default function CnhLogo({ width = 195 }) {
  return (
    <img
      src="/cnh-logo.png?v=2"
      alt="CNH do Brasil"
      style={{ width, objectFit: 'contain' }}
      draggable={false}
    />
  )
}
