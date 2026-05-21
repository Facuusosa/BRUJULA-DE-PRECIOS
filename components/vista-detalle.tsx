'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, Share2, ExternalLink } from 'lucide-react'
import {
  Producto, formatearPrecio, extraerTamano,
  calcularBombas
} from '@/lib/data'
import BlurText from '@/components/reactbits/TextAnimations/BlurText/BlurText'
import { btnHover, iconTap, chipHover } from '@/lib/motion-variants'

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
      setMargen(Math.min(100, Math.max(5, Math.round(nuevoMargen))))
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
      setMargen(Math.min(100, Math.max(5, Math.round(nuevoMargen))))
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
    <div style={{ background: '#0a0a0a', minHeight: '100%' }}>
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
          background: #141414;
          flex-shrink: 0;
        }
        .detalle-info-panel {
          background: #0a0a0a;
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
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(8px);
          border: 1px solid #2a2a2a;
          border-radius: 20px;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #f7f7f7;
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
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(8px);
          border: 1px solid #2a2a2a;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .relacionados-scroll {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }
        .relacionados-scroll::-webkit-scrollbar { display: none; }
        .detalle-nombre-blur { margin: 0 0 24px !important; }
        .detalle-nombre-blur span {
          font-family: var(--font-barlow-condensed), "Barlow Condensed", sans-serif !important;
          font-size: 26px !important; font-weight: 800 !important;
          text-transform: uppercase !important; letter-spacing: 0.01em !important;
          color: #f7f7f7 !important; line-height: 1.15 !important;
        }
        .calc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
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
          .detalle-nombre-blur span { font-size: 32px !important; }
        }
        @media (max-width: 380px) {
          .detalle-nombre-blur span { font-size: 22px !important; }
          .calc-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="detalle-layout">

        {/* Panel imagen (sticky) */}
        <div className="detalle-imagen-panel">
          <motion.button className="detalle-back-btn" onClick={onBack} {...iconTap}>
            <ChevronLeft size={16} strokeWidth={2.5} />
            Volver
          </motion.button>
          <div className="detalle-actions-img">
            <motion.button className="detalle-action-btn" onClick={onToggleFavorito} aria-label="Favorito" {...iconTap}>
              <Heart size={18} strokeWidth={1.8} color={esFavorito ? '#d4a574' : '#6b7280'} fill={esFavorito ? '#d4a574' : 'none'} />
            </motion.button>
            <motion.button className="detalle-action-btn" aria-label="Compartir" {...iconTap}>
              <Share2 size={18} strokeWidth={1.8} color="#6b7280" />
            </motion.button>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#2a2a2a', fontSize: '48px' }}>?</div>
          )}
        </div>

        {/* Panel info */}
        <div className="detalle-info-panel">

          {/* Badges */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {tamano && (
              <span style={{
                background: '#222222', color: '#f7f7f7',
                border: '1px solid #2a2a2a',
                fontSize: '11px', fontWeight: 700, padding: '3px 8px',
                borderRadius: '4px', letterSpacing: '0.05em',
              }}>
                {tamano}
              </span>
            )}
            {producto.abc && (
              <span style={{
                background: producto.abc === 'A' ? '#d4a574' : producto.abc === 'B' ? '#2563eb' : '#2a2a2a',
                color: producto.abc === 'A' ? '#0a0a0a' : '#f7f7f7',
                fontSize: '11px', fontWeight: 700, padding: '3px 8px',
                borderRadius: '4px', letterSpacing: '0.05em',
              }}>
                ABC {producto.abc}
              </span>
            )}
          </div>

          {/* Nombre */}
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
                <motion.div
                  key={precio.mayorista}
                  onClick={() => setMayoristaSel(precio.mayorista)}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: `2px solid ${esSeleccionado ? '#d4a574' : esMejor ? 'rgba(212,165,116,0.3)' : '#2a2a2a'}`,
                    background: esMejor ? '#1a1a1a' : '#141414',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {/* Indicador lateral seleccionado */}
                  {esSeleccionado && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: '3px', borderRadius: '0 3px 3px 0',
                      background: '#d4a574',
                    }} />
                  )}

                  {/* Logo */}
                  <div style={{ width: '80px', height: '28px', position: 'relative', flexShrink: 0 }}>
                    {logo ? (
                      <Image src={logo} alt={precio.mayorista} fill style={{ objectFit: 'contain', objectPosition: 'left' }} unoptimized />
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f7f7f7' }}>{precio.mayorista}</span>
                    )}
                  </div>

                  {/* Precio + info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                        fontSize: esMejor ? '24px' : '20px', fontWeight: 800,
                        color: esMejor ? '#d4a574' : '#f7f7f7',
                      }}>
                        {formatearPrecio(precio.precio)}
                      </span>
                      {!esMejor && diferencia > 0 && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                          +{formatearPrecio(diferencia)} ({pctDif}% más)
                        </span>
                      )}
                    </div>
                    {esMejor && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '3px',
                        fontSize: '11px', fontWeight: 700, color: '#0a0a0a',
                        background: '#d4a574', padding: '2px 8px', borderRadius: '20px',
                      }}>
                        Mejor precio
                      </div>
                    )}
                    {precio.fechaScraping && (
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                        Precio al {precio.fechaScraping}
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
                      title={precio.mayorista === 'MaxiCarrefour' ? 'Requiere login en comerciante.carrefour.com.ar' : `Ver en ${precio.mayorista}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 34, height: 34, borderRadius: '50%',
                        background: '#222222', flexShrink: 0, color: '#6b7280',
                        textDecoration: 'none',
                        border: '1px solid #2a2a2a',
                      }}
                    >
                      <ExternalLink size={15} strokeWidth={2} />
                    </a>
                  )}

                  {/* Indicador "en calculadora" */}
                  {esSeleccionado && (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, color: '#0a0a0a',
                      background: '#d4a574', padding: '3px 8px', borderRadius: '20px',
                      whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      En cálculo
                    </span>
                  )}
                </motion.div>
              )
            })}
            {preciosValidos.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                Sin precios por ahora
              </div>
            )}
          </div>

          {/* COMPARATIVA DE AHORRO */}
          {preciosValidos.length > 1 && mejorPrecio && precioMax && mejorPrecio.precio !== precioMax.precio && (
            <div style={{ marginBottom: '28px' }}>
              <SectionLabel>COMPARATIVA</SectionLabel>
              <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                    Ahorrás comprando en <strong style={{ color: '#f7f7f7' }}>{mejorPrecio.mayorista}</strong>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                    fontSize: '32px', fontWeight: 800, color: '#d4a574', lineHeight: 1,
                  }}>
                    {formatearPrecio(precioMax.precio - mejorPrecio.precio)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>vs {precioMax.mayorista}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Diferencia</div>
                  <div style={{
                    fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                    fontSize: '20px', fontWeight: 800, color: '#f7f7f7',
                  }}>
                    {Math.round(((precioMax.precio - mejorPrecio.precio) / precioMax.precio) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CALCULADORA DE MARGEN */}
          {preciosValidos.length > 0 && (
            <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
              <SectionLabel>CALCULADORA DE MARGEN</SectionLabel>

              {/* Selector mayorista */}
              {preciosValidos.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {preciosValidos.map(p => (
                    <motion.button
                      key={p.mayorista}
                      onClick={() => setMayoristaSel(p.mayorista)}
                      {...chipHover}
                      style={{
                        padding: '5px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600,
                        border: `1.5px solid ${mayoristaCal === p.mayorista ? '#d4a574' : '#2a2a2a'}`,
                        background: mayoristaCal === p.mayorista ? '#d4a574' : '#1a1a1a',
                        color: mayoristaCal === p.mayorista ? '#0a0a0a' : '#f7f7f7',
                        cursor: 'pointer',
                      }}
                    >
                      {p.mayorista}
                    </motion.button>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                Comprando en <strong style={{ color: '#f7f7f7' }}>{mayoristaCal}</strong>: {formatearPrecio(precioCompra)}
              </div>

              {/* Slider margen */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#f7f7f7' }}>Margen</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#d4a574' }}>{margen}%</span>
                </div>
                <input
                  type="range"
                  min={5} max={100} value={margen}
                  onChange={e => handleSlider(Number(e.target.value))}
                  className="slider-brujula"
                  style={{ width: '100%', '--slider-pct': `${((margen - 5) / (100 - 5)) * 100}%` } as React.CSSProperties}
                />
              </div>

              {/* Resultados — editables */}
              <div className="calc-grid">
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Precio venta</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{
                      fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                      fontSize: '18px', fontWeight: 800, color: '#d4a574',
                    }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={precioVentaMostrar}
                      onChange={e => handlePrecioVentaManual(e.target.value)}
                      style={{
                        fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                        fontSize: '28px', fontWeight: 800, color: '#d4a574',
                        border: 'none', background: 'transparent', outline: 'none',
                        width: '100%', minWidth: 0, padding: 0,
                      }}
                    />
                  </div>
                </div>
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ganancia</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                    <span style={{
                      fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                      fontSize: '18px', fontWeight: 800, color: '#6b7280',
                    }}>$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={gananciaMostrar}
                      onChange={e => handleGananciaManual(e.target.value)}
                      style={{
                        fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                        fontSize: '28px', fontWeight: 800, color: '#f7f7f7',
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
            <motion.button
              onClick={handleGuardar}
              {...btnHover}
              style={{
                width: '100%', padding: '14px',
                background: '#d4a574', color: '#0a0a0a',
                touchAction: 'manipulation',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: 700,
                cursor: 'pointer', marginBottom: '32px',
                fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}
            >
              Guardar en mi lista
            </motion.button>
          )}

          {/* ALTERNATIVAS DEL SECTOR */}
          {relacionados.length > 0 && (
            <div>
              <SectionLabel>DE LA MISMA CATEGORÍA</SectionLabel>
              <div className="relacionados-scroll">
                {relacionados.map(rel => {
                  const preciosRel = rel.precios.filter(p => p.precio > 0).sort((a, b) => a.precio - b.precio)
                  const logo = LOGOS[preciosRel[0]?.mayorista ?? '']
                  return (
                    <motion.div
                      key={rel.id}
                      onClick={() => onVerProducto?.(rel)}
                      whileHover={{ borderColor: '#d4a574' }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      style={{
                        width: '140px', flexShrink: 0,
                        border: '1px solid #2a2a2a', borderRadius: '10px',
                        overflow: 'hidden', cursor: 'pointer',
                        background: '#141414',
                      }}
                    >
                      <div style={{ height: '100px', background: '#1a1a1a', position: 'relative' }}>
                        {rel.imageUrl ? (
                          <Image src={rel.imageUrl} alt={rel.nombre} fill style={{ objectFit: 'contain', padding: '8px' }} unoptimized />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#2a2a2a', fontSize: '24px' }}>?</div>
                        )}
                        {logo && (
                          <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '40px', height: '16px', background: '#141414', borderRadius: '3px', border: '1px solid #2a2a2a', overflow: 'hidden' }}>
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                              <Image src={logo} alt="" fill style={{ objectFit: 'contain' }} unoptimized />
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '8px' }}>
                        <div style={{
                          fontSize: '11px', fontWeight: 600, color: '#f7f7f7',
                          lineHeight: 1.3, marginBottom: '4px',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {rel.nombre}
                        </div>
                        {preciosRel[0] && (
                          <div style={{
                            fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                            fontSize: '14px', fontWeight: 800, color: '#d4a574',
                          }}>
                            {formatearPrecio(preciosRel[0].precio)}
                          </div>
                        )}
                      </div>
                    </motion.div>
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
      fontSize: '11px', fontWeight: 700, color: '#6b7280',
      letterSpacing: '0.08em', textTransform: 'uppercase',
      marginBottom: '12px', paddingTop: '4px',
    }}>
      {children}
    </div>
  )
}
