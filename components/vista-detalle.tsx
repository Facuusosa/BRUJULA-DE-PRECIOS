'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, Share2, ExternalLink } from 'lucide-react'
import {
  Producto, ProductoBomba, productos, formatearPrecio, extraerTamano,
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
  const [imgSrc, setImgSrc] = useState(producto.imageUrl || '')
  const [imgFallbackIdx, setImgFallbackIdx] = useState(0)

  const handleDetalleImageError = () => {
    const fallbacks = producto.imagenFallbacks || []
    if (imgFallbackIdx < fallbacks.length) {
      setImgSrc(fallbacks[imgFallbackIdx])
      setImgFallbackIdx(prev => prev + 1)
    } else {
      setImgSrc('')
    }
  }

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
    productos
      .filter(p => p.sector === producto.sector && p.id !== producto.id && p.precios.some(pr => pr.precio > 0))
      .sort((a, b) => {
        const abcOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
        const aAbc = abcOrder[a.abc ?? ''] ?? 4
        const bAbc = abcOrder[b.abc ?? ''] ?? 4
        if (aAbc !== bAbc) return aAbc - bAbc
        return b.precios.filter(p => p.precio > 0).length - a.precios.filter(p => p.precio > 0).length
      })
      .slice(0, 20),
    [producto.sector, producto.id]
  )

  const semilla = useMemo(() => Math.floor(Date.now() / (1000 * 60 * 30)), [])
  const bombasRotativas = useMemo((): ProductoBomba[] => {
    const todas = calcularBombas().filter(b => b.id !== producto.id)
    const indices = Array.from({ length: todas.length }, (_, i) => i)
    let s = semilla
    for (let i = indices.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      const j = Math.abs(s) % (i + 1)
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    return indices.slice(0, 4).map(i => todas[i])
  }, [semilla, producto.id])

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
          overflow-x: scroll;
          padding-bottom: 8px;
          scrollbar-width: thin;
          scrollbar-color: #2a2a2a transparent;
        }
        .rotativas-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          overflow-x: visible !important;
        }
        .detalle-nombre-blur { margin: 0 0 20px !important; }
        .detalle-nombre-blur span {
          font-family: var(--font-poppins, "Poppins"), sans-serif !important;
          font-size: 22px !important; font-weight: 700 !important;
          text-transform: none !important; letter-spacing: -0.01em !important;
          color: #f7f7f7 !important; line-height: 1.25 !important;
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
          {imgSrc ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image
                src={imgSrc}
                alt={producto.nombre}
                fill
                style={{ objectFit: 'contain', padding: '32px' }}
                unoptimized
                onError={handleDetalleImageError}
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
          <SectionLabel>Dónde comprar</SectionLabel>
          <div style={{ border: '1px solid #1f1f1f', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
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
                  whileTap={{ scale: 0.995 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px',
                    borderBottom: idx < preciosValidos.length - 1 ? '1px solid #1f1f1f' : 'none',
                    background: esSeleccionado ? '#161616' : '#0f0f0f',
                    cursor: 'pointer',
                  }}
                >
                  {/* Logo */}
                  <div style={{ width: '72px', height: '26px', position: 'relative', flexShrink: 0 }}>
                    {logo
                      ? <Image src={logo} alt={precio.mayorista} fill style={{ objectFit: 'contain', objectPosition: 'left' }} unoptimized />
                      : <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>{precio.mayorista}</span>
                    }
                  </div>

                  {/* Nombre mayorista + badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#9ca3af' }}>{precio.mayorista}</span>
                      {esMejor && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, color: '#16a34a',
                          background: 'rgba(22,163,74,0.12)', padding: '1px 7px',
                          borderRadius: '20px', border: '1px solid rgba(22,163,74,0.25)',
                        }}>
                          Mejor precio
                        </span>
                      )}
                    </div>
                    {precio.fechaScraping && (
                      <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '1px' }}>
                        Actualizado {precio.fechaScraping}
                      </div>
                    )}
                  </div>

                  {/* Precio */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                      fontSize: '20px', fontWeight: 700,
                      color: esMejor ? '#f7f7f7' : '#9ca3af',
                    }}>
                      {formatearPrecio(precio.precio)}
                    </div>
                    {!esMejor && diferencia > 0 && (
                      <div style={{ fontSize: '11px', color: '#4b5563' }}>+{pctDif}% más</div>
                    )}
                  </div>

                  {/* Botón VER */}
                  {precio.link && (
                    <a
                      href={precio.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      aria-label={`Ver en ${precio.mayorista}`}
                      title={precio.mayorista === 'MaxiCarrefour' ? 'Requiere login' : `Ver en ${precio.mayorista}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '6px 12px', borderRadius: '6px', flexShrink: 0,
                        background: esSeleccionado ? '#2563eb' : '#1a1a1a',
                        color: esSeleccionado ? '#fff' : '#6b7280',
                        textDecoration: 'none', fontSize: '12px', fontWeight: 600,
                        border: `1px solid ${esSeleccionado ? '#2563eb' : '#2a2a2a'}`,
                        gap: '4px',
                      }}
                    >
                      Ver <ExternalLink size={11} strokeWidth={2} />
                    </a>
                  )}
                </motion.div>
              )
            })}
            {preciosValidos.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                Sin precios disponibles
              </div>
            )}
          </div>

          {/* PRECIO HOY */}
          {preciosValidos.length > 1 && mejorPrecio && precioMax && mejorPrecio.precio !== precioMax.precio && (
            <motion.div
              style={{ marginBottom: '28px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
            >
              <SectionLabel>Precio hoy</SectionLabel>
              <div style={{ background: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '12px', padding: '20px 16px' }}>
                {/* Barra gradiente */}
                <div style={{ position: 'relative', marginBottom: '28px' }}>
                  {/* Marcadores encima de la barra */}
                  <div style={{ position: 'relative', height: '32px' }}>
                    {preciosValidos.map((p, idx) => {
                      const rango = precioMax.precio - mejorPrecio.precio
                      const pos = rango === 0 ? 0 : (p.precio - mejorPrecio.precio) / rango
                      const esMejor = idx === 0
                      return (
                        <div
                          key={p.mayorista}
                          style={{
                            position: 'absolute',
                            left: `${pos * 100}%`,
                            transform: 'translateX(-50%)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                          }}
                        >
                          {/* Triángulo apuntando hacia la barra */}
                          <div style={{
                            width: 0, height: 0,
                            borderLeft: '5px solid transparent',
                            borderRight: '5px solid transparent',
                            borderTop: `7px solid ${esMejor ? '#f7f7f7' : '#4b5563'}`,
                            marginBottom: '2px',
                          }} />
                          <span style={{
                            fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                            color: esMejor ? '#f7f7f7' : '#9ca3af',
                            fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                          }}>
                            {formatearPrecio(p.precio)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Barra gradiente semáforo */}
                  <div style={{
                    height: '8px', borderRadius: '99px',
                    background: 'linear-gradient(to right, #16a34a 0%, #eab308 50%, #dc2626 100%)',
                  }} />
                  {/* Labels extremos */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Más barato</span>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Más caro</span>
                  </div>
                </div>
                {/* Resumen ahorro */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #1f1f1f' }}>
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                    Comprando en <strong style={{ color: '#f7f7f7' }}>{mejorPrecio.mayorista}</strong> ahorrás
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{
                      fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                      fontSize: '20px', fontWeight: 700, color: '#16a34a',
                    }}>
                      {formatearPrecio(precioMax.precio - mejorPrecio.precio)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      ({Math.round(((precioMax.precio - mejorPrecio.precio) / precioMax.precio) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
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
                  min={5} max={99} value={margen}
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
                        width: '150px', flexShrink: 0,
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

          {/* TE TAMBIÉN TE PODRÍA INTERESAR — bombas rotativas */}
          {bombasRotativas.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '10px', fontWeight: 800,
                  background: '#d4a574', color: '#0a0a0a',
                  padding: '3px 8px', borderRadius: '4px',
                  letterSpacing: '0.06em', flexShrink: 0,
                }}>TOP</span>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: '#d4a574',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  También te podría interesar
                </span>
              </div>
              <div className="relacionados-scroll rotativas-grid">
                  {bombasRotativas.map(rel => {
                    const preciosRel = rel.precios.filter(p => p.precio > 0).sort((a, b) => a.precio - b.precio)
                    const logo = LOGOS[preciosRel[0]?.mayorista ?? '']
                    const ahorro = rel.ahorroVsMaximo
                    return (
                      <motion.div
                        key={rel.id}
                        onClick={() => onVerProducto?.(rel)}
                        whileHover={{ borderColor: '#d4a574' }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{
                          border: '1px solid #2a2a2a', borderRadius: '10px',
                          overflow: 'hidden', cursor: 'pointer',
                          background: '#141414',
                        }}
                      >
                        <div style={{ height: '120px', background: '#1a1a1a', position: 'relative' }}>
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
                          {ahorro > 0 && (
                            <div style={{
                              position: 'absolute', top: '4px', right: '4px',
                              background: '#16a34a', color: '#fff',
                              fontSize: '10px', fontWeight: 800,
                              padding: '2px 6px', borderRadius: '8px',
                            }}>
                              -{ahorro}%
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
      fontSize: '13px', fontWeight: 600, color: '#9ca3af',
      marginBottom: '12px',
    }}>
      {children}
    </div>
  )
}
