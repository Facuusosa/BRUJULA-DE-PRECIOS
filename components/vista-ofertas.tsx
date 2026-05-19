'use client'

import { useState, useMemo } from 'react'
import { calcularBombas, Producto } from '@/lib/data'
import { BombaListItem } from '@/components/bomba-list-item'

interface VistaOfertasProps {
  onVerProducto: (producto: Producto) => void
  favoritos: Set<string>
  onToggleFavorito: (id: string) => void
}

const SECTORES_OPTS = ['Todos', 'Almacen', 'Bebidas', 'Limpieza', 'Frescos', 'Cuidado Personal', 'Mascotas', 'Kiosco', 'Bazar']

export function VistaOfertas({ onVerProducto }: VistaOfertasProps) {
  const [sector, setSector] = useState('Todos')
  const todasBombas = useMemo(() => calcularBombas(), [])

  const filtradas = useMemo(() => {
    if (sector === 'Todos') return todasBombas
    return todasBombas.filter(b => b.sector === sector)
  }, [todasBombas, sector])

  const tituloPorSector = sector === 'Todos'
    ? 'Todas las ofertas de hoy'
    : `Lo mejor de ${sector}`

  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>

        {/* Pills de sector */}
        <div
          style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '4px' }}
          className="scrollbar-hide"
        >
          {SECTORES_OPTS.map(s => (
            <button
              key={s}
              onClick={() => setSector(s)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                border: `1.5px solid ${s === sector ? '#0a0a0a' : '#e5e7eb'}`,
                background: s === sector ? '#0a0a0a' : '#ffffff',
                color: s === sector ? '#ffffff' : '#0a0a0a',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Título */}
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0a0a0a', margin: '0 0 6px' }}>
          {tituloPorSector}
        </h1>
        <p style={{ fontSize: '14px', color: '#555', margin: '0 0 28px' }}>
          Lo que más conviene comprar hoy
        </p>

        {/* Lista numerada */}
        {filtradas.length > 0 ? (
          <div>
            {filtradas.map((bomba, idx) => (
              <BombaListItem
                key={bomba.id}
                bomba={bomba}
                rank={idx + 1}
                onVerProducto={() => onVerProducto(bomba)}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Nada en esta categoría hoy</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>Probá con otra categoría</div>
          </div>
        )}
      </div>
    </div>
  )
}
