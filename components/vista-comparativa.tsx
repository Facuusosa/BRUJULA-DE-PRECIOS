'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Calculator } from 'lucide-react'
import Image from 'next/image'
import { Producto, formatearPrecio } from '@/lib/data'

interface VistaComparativaProps {
  producto: Producto
  onBack: () => void
  onGuardar: (data: {
    producto: Producto
    mayorista: string
    precioCompra: number
    margen: number
    precioVenta: number
    ganancia: number
  }) => void
}

const COLORES_BARRA: Record<string, string> = {
  Maxiconsumo:    '#0a0a0a',
  Yaguar:         '#374151',
  MaxiCarrefour:  '#f59e0b',
}

const COLOR_DEFAULT = '#6b7280'

export function VistaComparativa({ producto, onBack, onGuardar }: VistaComparativaProps) {
  const preciosValidos = producto.precios
    .filter(p => p.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  const mejorPrecio = preciosValidos[0]
  const maxPrecio = Math.max(...preciosValidos.map(p => p.precio))

  const [margen, setMargen] = useState(35)
  const [cantidad, setCantidad] = useState(12)
  const [animado, setAnimado] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimado(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!mejorPrecio) return null

  const precioCompra = mejorPrecio.precio
  const precioVenta = precioCompra / (1 - margen / 100)
  const ganancia = precioVenta - precioCompra
  const gananciaTotal = ganancia * cantidad

  const sliderPct = `${((margen - 5) / (80 - 5)) * 100}%`

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @media (max-width: 420px) {
          .comp-container { padding: 14px !important; }
          .comp-nombre { font-size: 14px !important; }
          .comp-calc { padding: 16px !important; }
          .comp-precio-compra { font-size: 18px !important; }
          .comp-guardar { padding: 15px !important; font-size: 15px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        background: '#ffffff',
        zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0a0a0a', padding: '10px', margin: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '44px', minWidth: '44px' }}
          aria-label="Volver"
        >
          <ChevronLeft size={28} strokeWidth={2} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0a0a0a' }}>Comparativa de precios</span>
      </div>

      <div className="comp-container" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {/* Producto ref */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'var(--c-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {producto.imageUrl ? (
              <Image src={producto.imageUrl} alt={producto.nombre} width={55} height={55} style={{ objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e2e8f0' }} />
            )}
          </div>
          <div>
            <p className="comp-nombre" style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0a0a0a', lineHeight: 1.3 }}>{producto.nombre}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{producto.sector}</p>
          </div>
        </div>

        {/* Barras por mayorista */}
        <div style={{ marginBottom: '28px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            display: 'block',
            marginBottom: '16px',
          }}>
            Precios por mayorista
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {preciosValidos.map((p, i) => {
              const anchoPct = animado ? (p.precio / maxPrecio) * 100 : 0
              const esMejor = i === 0
              return (
                <div key={p.mayorista}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0a0a0a' }}>{p.mayorista}</span>
                      {esMejor && (
                        <span style={{
                          background: '#f59e0b',
                          color: '#0a0a0a',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '20px',
                        }}>
                          Mejor
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#0a0a0a' }}>
                      {formatearPrecio(p.precio)}
                    </span>
                  </div>
                  {/* Track */}
                  <div style={{ height: '10px', background: 'var(--c-soft)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${anchoPct}%`,
                      background: COLORES_BARRA[p.mayorista] ?? COLOR_DEFAULT,
                      borderRadius: '5px',
                      transition: 'width 0.6s ease-out',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calculadora */}
        <div className="comp-calc" style={{
          background: '#f5f5f5',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Calculator size={20} color="#0a0a0a" strokeWidth={1.8} />
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0a0a0a' }}>Calculadora</span>
          </div>

          {/* Precio compra readonly */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
              Si comprás en {mejorPrecio.mayorista}:
            </span>
            <p className="comp-precio-compra" style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 900, color: '#0a0a0a' }}>
              {formatearPrecio(precioCompra)}
            </p>
          </div>

          {/* Slider margen */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Margen:</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0a0a0a' }}>{margen}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              value={margen}
              onChange={e => setMargen(Number(e.target.value))}
              className="slider-brujula"
              style={{ width: '100%', '--slider-pct': sliderPct } as React.CSSProperties}
            />
          </div>

          {/* Resultados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Precio de venta:</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0a0a0a' }}>{formatearPrecio(precioVenta)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Ganancia/unidad:</span>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0a0a0a' }}>{formatearPrecio(ganancia)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Si comprás</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={cantidad}
                  onChange={e => setCantidad(Math.max(1, Number(e.target.value)))}
                  onClick={e => e.stopPropagation()}
                  style={{
                    width: '56px',
                    minHeight: '44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '4px 6px',
                    fontSize: '16px',
                    fontWeight: 700,
                    textAlign: 'center',
                    color: '#0a0a0a',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                />
                <span style={{ fontSize: '14px', color: '#6b7280' }}>unidades:</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#0a0a0a' }}>{formatearPrecio(gananciaTotal)}</span>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <button
          onClick={() => onGuardar({
            producto,
            mayorista: mejorPrecio.mayorista,
            precioCompra,
            margen,
            precioVenta,
            ganancia,
          })}
          className="comp-guardar"
          style={{
            width: '100%',
            background: '#0a0a0a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '18px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: '52px',
          }}
        >
          Guardar en mi lista
        </button>
      </div>
    </div>
  )
}
