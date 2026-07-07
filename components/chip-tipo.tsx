import { TipoFuente } from '@/lib/data'

// Distinción visible por fila (pedido Facu 06/07): el comerciante nunca debe
// confundir precio de compra (mayorista) con precio de góndola (cadena)
export function ChipTipo({ tipo, style }: { tipo: TipoFuente; style?: React.CSSProperties }) {
  const esCadena = tipo === 'cadena'
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '9px', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
      color: esCadena ? 'var(--green)' : 'var(--gray)',
      border: `1px solid ${esCadena ? 'var(--green)' : 'var(--line)'}`,
      borderRadius: '4px', padding: '1.5px 6px',
      ...style,
    }}>
      {esCadena ? 'Cadena' : 'Mayorista'}
    </span>
  )
}
