'use client'

import { ChevronLeft, Heart, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Producto, formatearPrecio } from '@/lib/data'
import SpotlightCard from './reactbits/Components/SpotlightCard/SpotlightCard'

interface VistaShowcaseProps {
  producto: Producto
  onBack: () => void
  onVerMas: () => void
  esFavorito?: boolean
  onToggleFavorito?: () => void
}

function getMejorPrecio(producto: Producto) {
  const validos = producto.precios.filter(p => p.precio > 0)
  if (validos.length === 0) return null
  return validos.reduce((a, b) => a.precio < b.precio ? a : b)
}

export function VistaShowcase({
  producto,
  onBack,
  onVerMas,
  esFavorito = false,
  onToggleFavorito,
}: VistaShowcaseProps) {
  const mejor = getMejorPrecio(producto)
  const cantidadMayoristas = producto.precios.filter(p => p.precio > 0).length

  const descuento = (() => {
    const validos = producto.precios.filter(p => p.precio > 0)
    if (validos.length < 2) return 0
    const precios = validos.map(p => p.precio)
    return Math.round((1 - Math.min(...precios) / Math.max(...precios)) * 100)
  })()

  return (
    <div className="animate-slide-in-right" style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Header transparente */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={22} color="#ffffff" />
        </button>
        <button
          onClick={onToggleFavorito}
          style={{
            background: esFavorito ? 'rgba(212,165,116,0.2)' : 'rgba(255,255,255,0.12)',
            border: esFavorito ? '1px solid #d4a574' : 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Heart size={18} fill={esFavorito ? '#d4a574' : 'none'} color={esFavorito ? '#d4a574' : '#ffffff'} />
        </button>
      </div>

      {/* Zona imagen — ocupa el 50% superior */}
      <div style={{
        flex: '0 0 55vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '80px',
        position: 'relative',
      }}>
        <SpotlightCard
          className=""
          spotlightColor="rgba(212,165,116,0.15)"
        >
          <div style={{
            width: '220px',
            height: '220px',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 60px 0 rgba(0,0,0,0.4)',
          }}>
            {producto.imageUrl ? (
              <Image
                src={producto.imageUrl}
                alt={producto.nombre}
                width={200}
                height={200}
                style={{
                  objectFit: 'contain',
                  padding: '16px',
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                }}
              />
            ) : (
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
            )}
          </div>
        </SpotlightCard>

        {/* Badge descuento */}
        {descuento > 0 && (
          <div style={{
            position: 'absolute',
            top: '80px',
            right: 'calc(50% - 130px)',
            background: '#d4a574',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
          }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#0a0a0a', textAlign: 'center', lineHeight: 1.1 }}>
              -{descuento}%
            </span>
          </div>
        )}
      </div>

      {/* Divisor */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)', margin: '0 20px' }} />

      {/* Información del producto */}
      <div style={{
        flex: 1,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            lineHeight: 1.25,
          }}>
            {producto.nombre.split(' ').slice(0, 5).join(' ')}
          </h2>
          {producto.nombre.split(' ').length > 5 && (
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: '2px 0 0' }}>
              {producto.nombre.split(' ').slice(5).join(' ')}
            </p>
          )}
        </div>

        {mejor && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: '32px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
              {formatearPrecio(mejor.precio)}
            </span>
            <span style={{
              background: '#d4a574',
              color: '#0a0a0a',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
            }}>
              en {mejor.mayorista}
            </span>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Disponible en {cantidadMayoristas} mayorista{cantidadMayoristas !== 1 ? 's' : ''}
        </p>

        <div style={{ flex: 1 }} />

        {/* Agregar a mi lista */}
        <button
          onClick={onToggleFavorito}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.30)',
            borderRadius: '14px',
            padding: '14px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '15px',
            fontWeight: 700,
          }}
        >
          <Heart size={18} fill={esFavorito ? '#ffffff' : 'none'} color="#ffffff" />
          {esFavorito ? 'En mi lista' : 'Agregar a mi lista'}
        </button>

        {/* Ver más → Vista 4 */}
        <button
          onClick={onVerMas}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '16px',
            cursor: 'pointer',
            color: '#0a0a0a',
            fontSize: '16px',
            fontWeight: 700,
          }}
        >
          Ver mas
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
