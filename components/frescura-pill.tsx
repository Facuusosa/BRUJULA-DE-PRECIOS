import { frescuraDe, type Precio } from '@/lib/data'

// Indicador visual de frescura de un precio: punto de color + texto ("Hoy" / "Hace N d").
// Verde = de hoy, gris = esta semana, ambar = viejo (>14 dias). No renderiza nada si la
// fuente no tiene fecha. El title muestra la fecha exacta al pasar el mouse.
export function FrescuraPill({ precio, compact = false }: { precio: Precio; compact?: boolean }) {
  const f = frescuraDe(precio)
  if (!f) return null
  return (
    <span
      title={precio.fechaScraping ? `Precio del ${precio.fechaScraping}` : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: compact ? 9 : 10,
        fontWeight: 600,
        lineHeight: 1,
        color: f.color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: f.color,
          flexShrink: 0,
        }}
      />
      {f.label}
    </span>
  )
}
