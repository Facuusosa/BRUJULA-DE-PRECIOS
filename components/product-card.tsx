'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Plus } from 'lucide-react'
import { Producto, extraerTamano, calcularPrecioPorUnidad, formatearPrecio } from '@/lib/data'
import { iconTap } from '@/lib/motion-variants'

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
    <motion.div
      onClick={onTap}
      whileHover={{ borderColor: '#d4a574', backgroundColor: '#1a1a1a' }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Imagen */}
      <div style={{ position: 'relative', aspectRatio: '1', background: '#1a1a1a' }}>
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
            fontSize: '32px', color: '#2a2a2a',
          }}>
            ?
          </div>
        )}

        {/* Badge tamaño */}
        {tamano && !badgeAhorro && (
          <span style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: '#222222', color: '#f7f7f7',
            border: '1px solid #2a2a2a',
            fontSize: '12px', fontWeight: 700,
            padding: '2px 7px', borderRadius: '4px',
            letterSpacing: '0.02em',
          }}>
            {tamano}
          </span>
        )}

        {/* Badge ahorro — gold */}
        {badgeAhorro && ahorroPorc > 0 && (
          <span style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: '#d4a574', color: '#0a0a0a',
            fontSize: '12px', fontWeight: 800,
            padding: '2px 7px', borderRadius: '4px',
          }}>
            -{ahorroPorc}%
          </span>
        )}

        {/* Botón + */}
        <motion.button
          onClick={e => { e.stopPropagation(); onAgregar() }}
          {...iconTap}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#1a1a1a', border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Agregar"
        >
          <Plus size={14} strokeWidth={2.5} color="#f7f7f7" />
        </motion.button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {marca && (
          <span style={{ fontSize: '14px', color: '#f7f7f7', fontWeight: 600, lineHeight: 1.3 }}>{marca}</span>
        )}
        <span style={{
          fontSize: '14px', fontWeight: 400, color: '#6b7280',
          lineHeight: 1.3, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {producto.nombre}
        </span>
        <div style={{ marginTop: '6px' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px', fontWeight: 800,
            color: '#d4a574', lineHeight: 1.2,
          }}>
            {precioMinimo > 0 ? formatearPrecio(precioMinimo) : '—'}
          </div>
          {precioUnidad && (
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400 }}>{precioUnidad}</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {producto.precios.filter(p => p.precio > 0).length} mayorista{producto.precios.filter(p => p.precio > 0).length !== 1 ? 's' : ''}
          </span>
          <motion.button
            onClick={e => { e.stopPropagation(); onToggleFavorito() }}
            {...iconTap}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
            aria-label="Favorito"
          >
            <Heart
              size={16}
              strokeWidth={1.8}
              color={esFavorito ? '#d4a574' : '#6b7280'}
              fill={esFavorito ? '#d4a574' : 'none'}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
