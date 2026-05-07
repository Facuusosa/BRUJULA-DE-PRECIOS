'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ChevronLeft, Heart, Share2, ExternalLink } from 'lucide-react'
import {
  Producto, formatearPrecio, extraerTamano,
  calcularBombas
} from '@/lib/data'
import BlurText from '@/components/reactbits/TextAnimations/BlurText/BlurText'

interface VistaDetalleProps {
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
  onVerComparativa?: () => void
  esFavorito?: boolean
  onToggleFavorito?: () => void
  onVerProducto?: (producto: Producto) => void
}

const LOGOS: Record<string, string> = {
  'Maxiconsumo':   '/mayoristas/maxiconsumo.webp',
  'Yaguar':        '/mayoristas/yaguar.png',
  'MaxiCarrefour': '/mayoristas/maxicarrefour.jpg',
}

export function VistaDetalle({
  producto,
  onBack,
  onGuardar,
  esFavorito,
  onToggleFavorito,
  onVerProducto,
}: VistaDetalleProps) {
  const [margen, setMargen] = useState(35)
  const [mayoristaSel, setMayoristaSel] = useState('')
  const [precioVentaEdit, setPrecioVentaEdit] = useState('')
  const [gananciaEdit, setGananciaEdit] = useState('')

  const tamano = extraerTamano(producto.nombre)
  const preciosValidos = producto.precios
    .filter(p => p.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  const mejorPrecio = preciosValidos[0]
  const precioMax = preciosValidos[preciosValidos.length - 1]

  const mayoristaCal = mayoristaSel || mejorPrecio?.mayorista || ''
  const precioCompra = preciosValidos.find(p => p.mayorista === mayoristaCal)?.precio ?? mejorPrecio?.precio ?? 0
  const precioVentaCalc = precioCompra > 0 ? precioCompra / (1 - margen / 100) : 0
  const gananciaCalc = precioVentaCalc - precioCompra

  const precioVentaMostrar = precioVentaEdit || Math.round(precioVentaCalc).toString()
  const gananciaMostrar = gananciaEdit || Math.round(gananciaCalc).toString()

  const handleSlider = (val: number) => {
    setMargen(val)
    setPrecioVentaEdit('')
    setGananciaEdit('')
  }

  const handlePrecioVentaManual = (val: string) => {
    const limpio = val.replace(/[^0-9]/g, '')
    setPrecioVentaEdit(limpio)
    const pv = parseInt(limpio, 10)
    if (!isNaN(pv) && pv > precioCompra && precioCompra > 0) {
      const nuevoMargen = (1 - precioCompra / pv) * 100
      setMargen(Math.min(80, Math.max(5, Math.round(nuevoMargen))))
      setGananciaEdit('')
    }
  }

  const handleGananciaManual = (val: string) => {
    const limpio = val.replace(/[^0-9]/g, '')
    setGananciaEdit(limpio)
    const g = parseInt(limpio, 10)
    if (!isNaN(g) && g > 0 && precioCompra > 0) {
      const pv = precioCompra + g
      const nuevoMargen = (1 - precioCompra / pv) * 100
      setMargen(Math.min(80, Math.max(5, Math.round(nuevoMargen))))
      setPrecioVentaEdit('')
    }
  }

  const relacionados = useMemo(() =>
    calcularBombas()
      .filter(b => b.sector === producto.sector && b.id !== producto.id)
      .slice(0, 8),
    [producto.sector, producto.id]
  )


  const handleGuardar = () => {
    if (!mejorPrecio) return
    onGuardar({
      producto,
      mayorista: mayoristaCal,
      precioCompra,
      margen,
      precioVenta: parseInt(precioVentaMostrar, 10) || Math.round(precioVentaCalc),
      ganancia: parseInt(gananciaMostrar, 10) || Math.round(gananciaCalc),
    })
  }

  return (
    <div style={{ background: '#fff', minHeight: '100%' }}>
      <style>{`
        .detalle-layout {
          display: flex;
          flex-direction: column;
        }
        .detalle-imagen-panel {
          position: sticky;
          top: 0;
          z-index: 5;
          height: 300px;
          background: #ffffff;
          flex-shrink: 0;
        }
        .detalle-info-panel {
          background: #fff;
          border-radius: 20px 20px 0 0;
          margin-top: -20px;
          position: relative;
          z-index: 6;
          padding: 28px 20px 80px;
          min-width: 0;
          overflow-x: hidden;
          word-break: break-word;
          overflow-wrap: anywhere;
        }
        .detalle-back-btn {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: 20px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #0a0a0a;
          min-height: 44px;
        }
        .detalle-actions-img {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          display: flex;
          gap: 8px;
        }
        .detalle-action-btn {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .detalle-precio-row {
          display: flex;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #f0f0f0;
          gap: 12px;
        }
        .visitar-btn {
          font-size: 12px;
          font-weight: 600;
          color: #0a0a0a;
          background: #e8f5e9;
          padding: 6px 14px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .relacionados-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }
        .relacionados-scroll::-webkit-scrollbar { display: none; }
        @media (min-width: 768px) {
          .detalle-layout {
            display: grid;
            grid-template-columns: 48% 1fr;
            min-height: 100%;
          }
          .detalle-imagen-panel {
            position: sticky;
            top: 0;
            height: 100vh;
            border-radius: 0;
            margin: 0;
          }
          .detalle-info-panel {
            border-radius: 0;
            margin: 0;
            padding: 32px 40px 80px;
            min-width: 0;
          }
          .detalle-back-btn {
            background: rgba(255,255,255,0.95);
          }
        }
      `}</style>

      <div className="detalle-layout">

        {/* Panel imagen (sticky) */}
        <div className="detalle-imagen-panel">
          <button className="detalle-back-btn" onClick={onBack}>
            <ChevronLeft size={16} strokeWidth={2.5} />
            Volver
          </button>
          <div className="detalle-actions-img">
            <button className="detalle-action-btn" onClick={onToggleFavorito} aria-label="Favorito">
              <Heart size={18} strokeWidth={1.8} color={esFavorito ? '#ef4444' : '#555'} fill={esFavorito ? '#ef4444' : 'none'} />
            </button>
            <button className="detalle-action-btn" aria-label="Compartir">
              <Share2 size={18} strokeWidth={1.8} color="#555" />
            </button>
          </div>
          {producto.imageUrl ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image
                src={producto.imageUrl}
                alt={producto.nombre}
                fill
                style={{ objectFit: 'contain', padding: '32px' }}
                unoptimized
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc', fontSize: '48px' }}>?</div>
          )}
        </div>

        {/* Panel info */}
        <div className="detalle-info-panel">

          {/* Badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {tamano && (
              <span style={{
                background: '#0a0a0a', color: '#fff',
                fontSize: '11px', fontWeight: 700, padding: '3px 8px',
                borderRadius: '4px', letterSpacing: '0.05em',
              }}>
                {tamano}
              </span>
            )}
            {producto.abc && (
              <span style={{
                background: producto.abc === 'A' ? '#0a0a0a' : producto.abc === 'B' ? '#2563eb' : '#6b7280',
                color: '#fff',
                fontSize: '11px', fontWeight: 700, padding: '3px 8px',
                borderRadius: '4px', letterSpacing: '0.05em',
              }}>
                ABC {producto.abc}
              </span>
            )}
          </div>

          {/* Nombre — BlurText + Barlow Condensed */}
          <style>{`
            .detalle-nombre-blur { margin: 0 0 24px !important; }
            .detalle-nombre-blur span {
              font-family: var(--font-barlow-condensed), "Barlow Condensed", sans-serif !important;
              font-size: 26px !important; font-weight: 800 !important;
              text-transform: uppercase !important; letter-spacing: 0.01em !important;
              color: #0a0a0a !important; line-height: 1.15 !important;
            }
            .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            @media (min-width: 768px) {
              .detalle-nombre-blur span { font-size: 32px !important; }
            }
            @media (max-width: 380px) {
              .detalle-nombre-blur span { font-size: 22px !important; }
              .calc-grid { grid-template-columns: 1fr; }
            }
          `}</style>
          <BlurText
            text={producto.nombre}
            animateBy="words"
            direction="top"
            delay={60}
            stepDuration={0.25}
            className="detalle-nombre-blur"
          />

          {/* DONDE COMPRAR */}
          <SectionLabel>DONDE COMPRAR</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {preciosValidos.map((precio, idx) => {
              const logo = LOGOS[precio.mayorista]
              const esMejor = idx === 0
              const esSeleccionado = precio.mayorista === mayoristaCal
              const diferencia = precio.precio - (mejorPrecio?.precio ?? 0)
              const pctDif = mejorPrecio ? Math.round((diferencia / mejorPrecio.precio) * 100) : 0

              return (
                <div
                  key={precio.mayorista}
                  onClick={() => setMayoristaSel(precio.mayorista)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: `2px solid ${esSeleccionado ? '#0a0a0a' : esMejor ? '#16a34a40' : '#e5e7eb'}`,
                    background: esMejor ? '#f0fdf4' : esSeleccionado && !esMejor ? '#fafafa' : '#fff',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    position: 'relative',
                  }}
                >
                  {/* Indicador lateral seleccionado */}
                  {esSeleccionado && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: '3px', borderRadius: '0 3px 3px 0',
                      background: '#0a0a0a',
                    }} />
                  )}

                  {/* Logo */}
                  <div style={{ width: '80px', height: '28px', position: 'relative', flexShrink: 0 }}>
                    {logo ? (
                      <Image src={logo} alt={precio.mayorista} fill style={{ objectFit: 'contain', objectPosition: 'left' }} unoptimized />
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{precio.mayorista}</span>
                    )}
                  </div>

                  {/* Precio + info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '20px', fontWeight: 800,
                        color: esMejor ? '#16a34a' : '#0a0a0a',
                      }}>
                        {formatearPrecio(precio.precio)}
                      </span>
                      {!esMejor && diferencia > 0 && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>
                          +{formatearPrecio(diferencia)} ({pctDif}% más caro)
                        </span>
                      )}
                    </div>
                    {esMejor && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px',
                        fontSize: '11px', fontWeight: 700, color: '#16a34a',
                        background: '#dcfce7', padding: '2px 8px', borderRadius: '20px',
                      }}>
                        <span>✓</span> Mejor precio
                      </div>
                    )}
                  </div>

                  {/* Link al sitio del mayorista */}
                  {precio.link && (
                    <a
                      href={precio.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      aria-label={`Ver en ${precio.mayorista}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 34, height: 34, borderRadius: '50%',
                        background: '#f3f4f6', flexShrink: 0, color: '#6b7280',
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={15} strokeWidth={2} />
                    </a>
                  )}

                  {/* Indicador "en calculadora" */}
                  {esSeleccionado && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, color: '#fff',
                      background: '#0a0a0a', padding: '3px 8px', borderRadius: '20px',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      En cálculo
                    </span>
                  )}
                </div>
              )
            })}
            {preciosValidos.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                Sin precios disponibles
              </div>
            )}
          </div>

          {/* COMPARATIVA DE AHORRO */}
          {preciosValidos.length > 1 && mejorPrecio && precioMax && mejorPrecio.precio !== precioMax.precio && (
            <div style={{ marginBottom: '28px' }}>
              <SectionLabel>COMPARATIVA</SectionLabel>
              <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Ahorrás comprando en <strong style={{ color: '#0a0a0a' }}>{mejorPrecio.mayorista}</strong></div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>
                    {formatearPrecio(precioMax.precio - mejorPrecio.precio)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>vs {precioMax.mayorista}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Diferencia</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>
                    {Math.round(((precioMax.precio - mejorPrecio.precio) / precioMax.precio) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALCULADORA DE MARGEN */}
          {preciosValidos.length > 0 && (
            <div style={{ background: '#f7f7f7', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
              <SectionLabel>CALCULADORA DE MARGEN</SectionLabel>

              {/* Selector mayorista */}
              {preciosValidos.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {preciosValidos.map(p => (
                    <button
                      key={p.mayorista}
                      onClick={() => setMayoristaSel(p.mayorista)}
                      style={{
                        padding: '5px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600,
                        border: `1.5px solid ${mayoristaCal === p.mayorista ? '#0a0a0a' : '#e5e7eb'}`,
                        background: mayoristaCal === p.mayorista ? '#0a0a0a' : '#fff',
                        color: mayoristaCal === p.mayorista ? '#fff' : '#555',
                        cursor: 'pointer',
                      }}
                    >
                      {p.mayorista}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
                Comprando en <strong style={{ color: '#0a0a0a' }}>{mayoristaCal}</strong>: {formatearPrecio(precioCompra)}
              </div>

              {/* Slider margen */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0a0a0a' }}>Margen</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0a0a0a' }}>{margen}%</span>
                </div>
                <input
                  type="range"
                  min={5} max={80} value={margen}
                  onChange={e => handleSlider(Number(e.target.value))}
                  className="slider-brujula"
                  style={{ width: '100%', '--slider-pct': `${((margen - 5) / (80 - 5)) * 100}%` } as React.CSSProperties}
                />
              </div>

              {/* Resultados — editables */}
              <div className="calc-grid">
                <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Precio venta</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#9ca3af' }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={precioVentaMostrar}
                      onChange={e => handlePrecioVentaManual(e.target.value)}
                      style={{
                        fontSize: '18px', fontWeight: 700, color: '#0a0a0a',
                        border: 'none', background: 'transparent', outline: 'none',
                        width: '100%', minWidth: 0, padding: 0,
                      }}
                    />
                  </div>
                </div>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Ganancia</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#9ca3af' }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={gananciaMostrar}
                      onChange={e => handleGananciaManual(e.target.value)}
                      style={{
                        fontSize: '18px', fontWeight: 700, color: '#0a0a0a',
                        border: 'none', background: 'transparent', outline: 'none',
                        width: '100%', minWidth: 0, padding: 0,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guardar */}
          {preciosValidos.length > 0 && (
            <button
              onClick={handleGuardar}
              style={{
                width: '100%', padding: '14px',
                background: '#0a0a0a', color: '#fff',
                touchAction: 'manipulation',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', marginBottom: '32px',
              }}
            >
              Guardar en mi lista
            </button>
          )}

          {/* ALTERNATIVAS DEL SECTOR */}
          {relacionados.length > 0 && (
            <div>
              <SectionLabel>ALTERNATIVAS DEL SECTOR</SectionLabel>
              <div className="relacionados-scroll">
                {relacionados.map(rel => {
                  const preciosRel = rel.precios.filter(p => p.precio > 0).sort((a, b) => a.precio - b.precio)
                  const logo = LOGOS[preciosRel[0]?.mayorista ?? '']
                  return (
                    <div
                      key={rel.id}
                      onClick={() => onVerProducto?.(rel)}
                      style={{
                        width: '140px', flexShrink: 0,
                        border: '1px solid #e5e7eb', borderRadius: '10px',
                        overflow: 'hidden', cursor: 'pointer',
                        background: '#fff',
                      }}
                    >
                      <div style={{ height: '100px', background: '#f5f5f5', position: 'relative' }}>
                        {rel.imageUrl ? (
                          <Image src={rel.imageUrl} alt={rel.nombre} fill style={{ objectFit: 'contain', padding: '8px' }} unoptimized />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ccc', fontSize: '24px' }}>?</div>
                        )}
                        {logo && (
                          <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '40px', height: '16px', background: '#fff', borderRadius: '3px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                              <Image src={logo} alt="" fill style={{ objectFit: 'contain' }} unoptimized />
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '8px' }}>
                        <div style={{
                          fontSize: '11px', fontWeight: 600, color: '#0a0a0a',
                          lineHeight: 1.3, marginBottom: '4px',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {rel.nombre}
                        </div>
                        {preciosRel[0] && (
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0a0a0a' }}>
                            {formatearPrecio(preciosRel[0].precio)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 700, color: '#555',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      marginBottom: '12px', paddingTop: '4px',
    }}>
      {children}
    </div>
  )
}
