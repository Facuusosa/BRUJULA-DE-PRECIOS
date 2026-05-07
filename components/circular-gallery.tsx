'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Sector {
  nombre: string
  imagen: string
}

interface CircularGalleryProps {
  sectores?: Sector[]
  onSelectSector: (nombre: string) => void
  sectorActivo?: string
}

const SECTORES_DEFAULT: Sector[] = [
  { nombre: 'Almacén',          imagen: '/categories/almacen_real.png' },
  { nombre: 'Bebidas',          imagen: '/categories/bebidas_real.png' },
  { nombre: 'Limpieza',         imagen: '/categories/limpieza_real.png' },
  { nombre: 'Frescos',          imagen: '/categories/frescos_real.png' },
  { nombre: 'Cuidado Personal', imagen: '/categories/perfumeria_real.png' },
  { nombre: 'Mascotas',         imagen: '/categories/mascotas.png' },
  { nombre: 'Kiosco',           imagen: '/categories/almacen.png' },
  { nombre: 'Bazar',            imagen: '/categories/hogar.png' },
]

const RADIO = 110
const ITEM_SIZE = 76

export function CircularGallery({
  sectores = SECTORES_DEFAULT,
  onSelectSector,
  sectorActivo,
}: CircularGalleryProps) {
  const [rotacion, setRotacion] = useState(0)
  const paso = 360 / sectores.length

  const handleClick = (nombre: string) => {
    setRotacion(prev => prev + paso)
    onSelectSector(nombre)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '280px',
        height: '280px',
        margin: '0 auto',
      }}
    >
      {/* Centro decorativo */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0a0a0a, #0d4820)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: '18px', color: '#d4a574', fontWeight: 900 }}>B</span>
      </div>

      {/* Items de la galería */}
      {sectores.map((sector, index) => {
        const angulo = paso * index
        const transform = `rotate(${angulo + rotacion}deg) translateX(${RADIO}px) rotate(${-(angulo + rotacion)}deg)`
        const isActivo = sectorActivo === sector.nombre

        return (
          <button
            key={sector.nombre}
            onClick={() => handleClick(sector.nombre)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${ITEM_SIZE}px`,
              height: `${ITEM_SIZE}px`,
              marginTop: `-${ITEM_SIZE / 2}px`,
              marginLeft: `-${ITEM_SIZE / 2}px`,
              transform,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: isActivo
                ? '0 4px 16px rgba(212,165,116,0.5)'
                : '0 4px 12px rgba(0,0,0,0.10)',
              border: isActivo ? '2px solid #d4a574' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px',
              zIndex: 2,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(212,165,116,0.4)'
              ;(e.currentTarget as HTMLElement).style.transform = transform + ' scale(1.05)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = isActivo
                ? '0 4px 16px rgba(212,165,116,0.5)'
                : '0 4px 12px rgba(0,0,0,0.10)'
              ;(e.currentTarget as HTMLElement).style.transform = transform
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <Image
                src={sector.imagen}
                alt={sector.nombre}
                width={38}
                height={38}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#0a0a0a',
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: '60px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sector.nombre}
            </span>
          </button>
        )
      })}
    </div>
  )
}
