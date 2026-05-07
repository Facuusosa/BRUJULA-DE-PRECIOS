'use client'

import Image from 'next/image'
import { Heart, Plus } from 'lucide-react'
import { Producto, extraerTamano, calcularPrecioPorUnidad, formatearPrecio } from '@/lib/data'

interface ProductCardProps {
  producto: Producto
  onTap: () => void
  onAgregar: () => void
  esFavorito: boolean
  onToggleFavorito: () => void
  badgeAhorro?: boolean
}

function extraerMarca(nombre: string): string {
  const palabras = nombre.split(' ')
  if (palabras.length >= 2 && palabras[0].length <= 12) return palabras[0]
  return ''
}

export function ProductCard({ producto, onTap, onAgregar, esFavorito, onToggleFavorito, badgeAhorro = false }: ProductCardProps) {
  const tamano = extraerTamano(producto.nombre)
  const precioMinimo = producto.precios.length > 0
    ? Math.min(...producto.precios.filter(p => p.precio > 0).map(p => p.precio))
    : 0
  const precioMaximo = producto.precios.length > 0
    ? Math.max(...producto.precios.filter(p => p.precio > 0).map(p => p.precio))
    : 0
  const precioUnidad = calcularPrecioPorUnidad(precioMinimo, tamano)
  const marca = extraerMarca(producto.nombre)
  const ahorroPorc = precioMinimo > 0 && precioMaximo > precioMinimo
    ? Math.round(((precioMaximo - precioMinimo) / precioMaximo) * 100)
    : 0

  return (
    <div
      onClick={onTap}
      style={{
        background: '#ffffff',
        border: '1px solid #eeeeee',
        borderRadius: '0px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#eeeeee'}
    >
      {/* Imagen */}
      <div style={{ position: 'relative', aspectRatio: '1', background: '#f5f5f5' }}>
        {producto.imageUrl ? (
          <Image
            src={producto.imageUrl}
            alt={producto.nombre}
            fill
            style={{ objectFit: 'contain', padding: '15px' }}
            unoptimized
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', color: '#d1d5db',
          }}>
            ?
          </div>
        )}

        {/* Badge tamaño */}
        {tamano && !badgeAhorro && (
          <span style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: '#000000', color: '#ffffff',
            fontSize: '12px', fontWeight: 700,
            padding: '2px 7px', borderRadius: '4px',
            letterSpacing: '0.02em',
          }}>
            {tamano}
          </span>
        )}

        {/* Badge ahorro (vista Ofertas) */}
        {badgeAhorro && ahorroPorc > 0 && (
          <span style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: '#16a34a', color: '#ffffff',
            fontSize: '12px', fontWeight: 700,
            padding: '2px 7px', borderRadius: '4px',
          }}>
            -{ahorroPorc}%
          </span>
        )}

        {/* Botón + */}
        <button
          onClick={e => { e.stopPropagation(); onAgregar() }}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#ffffff', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'}
          aria-label="Agregar"
        >
          <Plus size={14} strokeWidth={2.5} color="#0a0a0a" />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
        {marca && (
          <span style={{ fontSize: '14px', color: '#0a0a0a', fontWeight: 600, lineHeight: 1.3 }}>{marca}</span>
        )}
        <span style={{
          fontSize: '14px', fontWeight: 300, color: '#0a0a0a',
          lineHeight: 1.3, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {producto.nombre}
        </span>
        <div style={{ marginTop: '6px' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#0a0a0a', lineHeight: 1.2 }}>
            {precioMinimo > 0 ? formatearPrecio(precioMinimo) : '—'}
          </div>
          {precioUnidad && (
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 300 }}>{precioUnidad}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            {producto.precios.filter(p => p.precio > 0).length} mayorista{producto.precios.filter(p => p.precio > 0).length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorito() }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
            aria-label="Favorito"
          >
            <Heart
              size={16}
              strokeWidth={1.8}
              color={esFavorito ? '#ef4444' : '#9ca3af'}
              fill={esFavorito ? '#ef4444' : 'none'}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
