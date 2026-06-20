export default function CnhLogo({ width = 195 }) {
  return (
    <img
      src="/cnhdobrasil.png?v=1"
      alt="CNH do Brasil"
      style={{ width, objectFit: 'contain' }}
      draggable={false}
    />
  )
}
