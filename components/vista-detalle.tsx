'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, Heart, Share2, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { Producto, productos, formatearPrecio, extraerTamano } from '@/lib/data'
import { ShuffleValue } from '@/components/shuffle-value'

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
  const [imgSrc, setImgSrc] = useState(producto.imageUrl || '')
  const [imgFallbackIdx, setImgFallbackIdx] = useState(0)

  useEffect(() => {
    setImgSrc(producto.imageUrl || '')
    setImgFallbackIdx(0)
  }, [producto.id, producto.imageUrl])

  const handleImageError = () => {
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
  const peorPrecio = preciosValidos[preciosValidos.length - 1]
  const esEan = /^\d{13}$/.test(producto.id)

  const precioCompra = mejorPrecio?.precio ?? 0
  const precioVentaCalc = precioCompra > 0 ? precioCompra / (1 - margen / 100) : 0
  const gananciaCalc = precioVentaCalc - precioCompra

  const ahorroUnidad = preciosValidos.length >= 2 ? peorPrecio.precio - mejorPrecio.precio : 0

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
      .slice(0, 10),
    [producto.sector, producto.id]
  )

  const handleGuardar = () => {
    if (!mejorPrecio) return
    onGuardar({
      producto,
      mayorista: mejorPrecio.mayorista,
      precioCompra,
      margen,
      precioVenta: Math.round(precioVentaCalc),
      ganancia: Math.round(gananciaCalc),
    })
  }

  const handleCompartir = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: producto.nombre, text: `${producto.nombre} — Brújula de Precios` }).catch(() => null)
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(producto.nombre)
      toast.success('Nombre copiado')
    }
  }

  // Posición del dot en la barra de rango: 3% a 97%
  const dotPos = (precio: number) => {
    if (preciosValidos.length < 2 || peorPrecio.precio === mejorPrecio.precio) return 50
    return 3 + ((precio - mejorPrecio.precio) / (peorPrecio.precio - mejorPrecio.precio)) * 94
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100%', paddingBottom: '40px' }}>
      <style>{`
        @keyframes det-rise { to { opacity: 1; transform: translateY(0); } }
        .det-anim { opacity: 0; transform: translateY(10px); animation: det-rise 380ms var(--ease-out) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .det-anim { transform: none; animation-duration: 150ms; }
        }

        .det-wrap { max-width: 1240px; margin: 0 auto; }
        .det-cols { display: block; }
        .det-stage {
          margin: 16px 20px 0;
          background: linear-gradient(180deg, var(--plate) 0%, var(--line) 100%);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          padding: 36px 20px;
          position: relative;
        }
        .det-stage img { height: 220px; width: auto; object-fit: contain; }
        .det-section { padding: 26px 20px 0; }
        .det-sh { font-size: 18px; font-weight: 600; letter-spacing: -0.2px; color: var(--ink); margin: 0; }
        .det-calc { margin: 26px 20px 0; }
        .det-cta-row { padding: 20px 20px 0; }
        .det-rel { padding: 30px 0 40px; }
        .det-rel .det-sh { padding: 0 20px; }
        .det-rel-scroll { display: flex; gap: 12px; padding: 14px 20px 0; overflow-x: auto; scrollbar-width: none; }
        .det-rel-scroll::-webkit-scrollbar { display: none; }
        .det-pid { padding: 14px 20px 0; }

        /* Desktop: imagen GRANDE sticky izquierda; TODO lo scrolleable a la derecha.
           OJO: ningún ancestro de .det-left con overflow hidden — mata el sticky */
        @media (min-width: 1000px) {
          .det-wrap { padding: 0 44px; }
          .det-cols { display: grid; grid-template-columns: calc(50% - 32px) 1fr; gap: 64px; align-items: start; }
          .det-left { position: sticky; top: 16px; }
          .det-right { min-width: 0; }
          .det-pid { padding: 14px 0 0; }
          .det-stage { margin: 8px 0 0; padding: 30px 20px; background: none; border-radius: 0; }
          .det-stage img { height: 500px; }
          .det-stage .det-abc { top: 0; left: 0; }
          .det-section { padding: 14px 0 0; }
          .det-sh { font-size: 25.7px; }
          .det-calc { margin: 30px 0 0; }
          .det-cta-row { padding: 22px 0 0; }
          .det-rel { padding-left: 0; padding-right: 0; }
          .det-rel .det-sh { padding: 0; font-size: 20px; }
          .det-rel-scroll { padding: 14px 0 0; }
          .det-rel-card { width: 150px !important; }
        }
        @media (hover: hover) and (pointer: fine) {
          .det-rel-card .ph img { transition: transform 450ms var(--ease-out); }
          .det-rel-card:hover .ph img { transform: scale(1.05); }
        }
      `}</style>

      <div className="det-wrap">

        {/* Top bar minimal */}
        <div className="det-anim" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 4px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', fontWeight: 500, color: 'var(--ink)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', padding: '6px 0',
            }}
          >
            <ChevronLeft size={22} strokeWidth={2} />
            Volver
          </button>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--ink)' }}>
            <button
              onClick={onToggleFavorito}
              aria-label="Favorito"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: esFavorito ? 'var(--gold)' : 'var(--ink)', padding: '4px' }}
            >
              <Heart size={22} strokeWidth={1.8} fill={esFavorito ? 'var(--gold)' : 'none'} />
            </button>
            <button
              onClick={handleCompartir}
              aria-label="Compartir"
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--ink)', padding: '4px' }}
            >
              <Share2 size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="det-cols">
          {/* ── Columna izquierda: identidad + imagen + acciones ── */}
          <div className="det-left">
            <div className="det-pid det-anim" style={{ animationDelay: '50ms' }}>
              <h1 style={{ fontSize: '25.7px', fontWeight: 600, letterSpacing: '-0.4px', color: 'var(--ink)', margin: 0, lineHeight: 1.25 }}>
                {producto.nombre}
              </h1>
              <div style={{ fontSize: '19.3px', fontWeight: 300, lineHeight: 1.3, marginTop: '1px', color: 'var(--ink)' }}>
                {producto.subcategoria}
              </div>
              {tamano && (
                <span className="tnum" style={{
                  display: 'inline-block', marginTop: '10px',
                  background: 'var(--pill)', color: '#ffffff',
                  fontSize: '12px', fontWeight: 600,
                  borderRadius: '999px', padding: '4px 12px',
                }}>
                  {tamano}
                </span>
              )}
            </div>

            <div className="det-stage det-anim" style={{ animationDelay: '110ms' }}>
              {producto.abc && (
                <span className="det-abc" style={{
                  position: 'absolute', top: '12px', left: '12px',
                  background: 'var(--gold)', color: '#ffffff',
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
                  borderRadius: '999px', padding: '5px 11px',
                }}>
                  CLASE {producto.abc}
                </span>
              )}
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={producto.nombre}
                  width={500}
                  height={500}
                  className="img-plate"
                  style={{ height: undefined, width: 'auto', objectFit: 'contain' }}
                  unoptimized
                  onError={handleImageError}
                />
              ) : (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--line)', fontSize: '48px' }}>?</div>
              )}
            </div>

            {/* Acciones como pills grises — formato Trolley detalle */}
            <div className="det-anim" style={{ animationDelay: '160ms', display: 'flex', justifyContent: 'center', gap: '10px', padding: '18px 0 0' }}>
              <button
                onClick={handleGuardar}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: 'var(--plate)', borderRadius: '999px',
                  padding: '10px 18px', border: 'none', cursor: 'pointer',
                  fontSize: '13.5px', fontWeight: 500, color: 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
                Lista
              </button>
              <button
                onClick={handleCompartir}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  background: 'var(--plate)', borderRadius: '999px',
                  padding: '10px 18px', border: 'none', cursor: 'pointer',
                  fontSize: '13.5px', fontWeight: 500, color: 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m13 5 7 7-7 7M20 12H8a5 5 0 0 0-5 5" /></svg>
                Compartir
              </button>
            </div>
          </div>

          {/* ── Columna derecha: dónde comprar + rango + insight + calculadora + CTA + relacionados ── */}
          <div className="det-right">
            <section className="det-section det-anim" style={{ animationDelay: '210ms' }}>
              <h2 className="det-sh">Dónde comprarlo</h2>

              {preciosValidos.map((precio, idx) => {
                const esMejor = idx === 0
                const diffPct = !esMejor && mejorPrecio.precio > 0
                  ? Math.round(((precio.precio - mejorPrecio.precio) / mejorPrecio.precio) * 100)
                  : 0
                return (
                  <div
                    key={precio.mayorista}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '15px 0',
                      borderBottom: idx === preciosValidos.length - 1 ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <div style={{ width: '86px', flexShrink: 0 }}>
                      {LOGOS[precio.mayorista] ? (
                        <Image
                          src={LOGOS[precio.mayorista]}
                          alt={precio.mayorista}
                          width={82}
                          height={22}
                          style={{ maxWidth: '82px', maxHeight: '22px', objectFit: 'contain', display: 'block', width: 'auto', height: 'auto' }}
                          unoptimized
                        />
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{precio.mayorista}</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="tnum" style={{ fontSize: '18px', fontWeight: esMejor ? 600 : 500, color: 'var(--ink)' }}>
                        {formatearPrecio(precio.precio)}
                      </div>
                      {esMejor ? (
                        <div style={{ fontSize: '10.7px', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.05em', marginTop: '1px' }}>
                          MÁS BARATO
                        </div>
                      ) : (
                        <div className="tnum" style={{ fontSize: '11.8px', color: 'var(--gray)', fontWeight: 400, marginTop: '1px' }}>
                          +{diffPct}% vs el mejor
                        </div>
                      )}
                    </div>
                    {precio.link && (
                      <a
                        href={precio.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          border: '1.5px solid var(--ink)', background: '#ffffff',
                          borderRadius: '999px', padding: '8px 16px',
                          fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)',
                          fontFamily: 'var(--font-sans)', textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: '5px',
                        }}
                      >
                        Ver <ArrowUpRight size={12} strokeWidth={2.5} />
                      </a>
                    )}
                  </div>
                )
              })}

              {/* Barra de rango de precios */}
              {preciosValidos.length >= 2 && (
                <div style={{ marginTop: '22px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)' }}>Rango de precios</div>
                  <div style={{
                    marginTop: '26px',
                    height: '6px', borderRadius: '99px',
                    background: 'linear-gradient(90deg, var(--green) 0%, var(--gold) 55%, #c0392b 100%)',
                    opacity: 0.85,
                    position: 'relative',
                  }}>
                    {preciosValidos.map((precio, idx) => {
                      // Si dos dots quedan a <20% de distancia, el label de uno baja para no pisarse
                      const colisiona = idx > 0 && Math.abs(dotPos(precio.precio) - dotPos(preciosValidos[idx - 1].precio)) < 20
                      return (
                        <span
                          key={precio.mayorista}
                          style={{
                            position: 'absolute', top: '50%', left: `${dotPos(precio.precio)}%`,
                            transform: 'translate(-50%, -50%)',
                            width: idx === 0 ? '16px' : '14px',
                            height: idx === 0 ? '16px' : '14px',
                            borderRadius: '99px',
                            background: '#ffffff',
                            border: `2.5px solid ${idx === 0 ? 'var(--green)' : 'var(--ink)'}`,
                          }}
                        >
                          <span className="tnum" style={{
                            position: 'absolute',
                            ...(colisiona ? { top: '16px', background: '#ffffff', padding: '0 4px', zIndex: 1 } : { bottom: '16px' }),
                            left: '50%', transform: 'translateX(-50%)',
                            fontSize: '11.5px', fontWeight: 600, whiteSpace: 'nowrap',
                            color: idx === 0 ? 'var(--green)' : 'var(--ink)',
                          }}>
                            {formatearPrecio(precio.precio)}
                          </span>
                        </span>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 400 }}>Más barato</span>
                    <span style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 400 }}>Más caro</span>
                  </div>
                </div>
              )}

              {/* Insight de precio auto-generado (reemplaza valoraciones vacías) */}
              <div style={{ marginTop: '14px' }}>
                <div className="tnum" style={{ fontSize: '12.8px', color: 'var(--green)', fontWeight: 500 }}>
                  {esEan ? `EAN ${producto.id} · ` : ''}{producto.abc ? `Clase ${producto.abc} · ` : ''}{preciosValidos.length} mayorista{preciosValidos.length !== 1 ? 's' : ''} lo {preciosValidos.length !== 1 ? 'venden' : 'vende'}
                </div>
                {ahorroUnidad > 0 && (
                  <p className="tnum" style={{ marginTop: '8px', fontSize: '14px', fontWeight: 300, lineHeight: 1.55, color: 'var(--ink)' }}>
                    Comprando en {mejorPrecio.mayorista} ahorrás <b style={{ fontWeight: 600 }}>{formatearPrecio(ahorroUnidad)}</b> por
                    unidad contra {peorPrecio.mayorista} — en una caja de 6 son <b style={{ fontWeight: 600 }}>{formatearPrecio(ahorroUnidad * 6)}</b>.
                  </p>
                )}
              </div>
            </section>

            {/* Calculadora de margen */}
            {mejorPrecio && (
              <div className="det-calc det-anim" style={{
                animationDelay: '260ms',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '20px',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--ink)', margin: 0 }}>
                  Calculadora de margen
                </h2>
                <div className="tnum" style={{ fontSize: '12.8px', color: 'var(--gray)', fontWeight: 400, marginTop: '3px' }}>
                  Comprando en {mejorPrecio.mayorista} a <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{formatearPrecio(precioCompra)}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '18px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink)' }}>Tu margen</span>
                  <span className="tnum" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--gold)' }}>{margen}%</span>
                </div>
                <input
                  type="range"
                  className="slider-brujula"
                  min={5} max={99} value={margen}
                  onChange={e => setMargen(parseInt(e.target.value, 10))}
                  aria-label="Margen de ganancia"
                  style={{ marginTop: '8px', '--slider-pct': `${((margen - 5) / (99 - 5)) * 100}%` } as React.CSSProperties}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
                  <div style={{ flex: 1, background: 'var(--plate)', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray)', textTransform: 'uppercase' }}>
                      Precio venta
                    </div>
                    <ShuffleValue
                      value={formatearPrecio(Math.round(precioVentaCalc))}
                      style={{ fontSize: '24px', fontWeight: 600, marginTop: '3px', color: 'var(--ink)', display: 'block' }}
                    />
                  </div>
                  <div style={{ flex: 1, background: 'var(--plate)', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray)', textTransform: 'uppercase' }}>
                      Ganancia
                    </div>
                    <ShuffleValue
                      value={formatearPrecio(Math.round(gananciaCalc))}
                      style={{ fontSize: '24px', fontWeight: 600, marginTop: '3px', color: 'var(--green)', display: 'block' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="det-cta-row det-anim" style={{ animationDelay: '300ms' }}>
              <button
                onClick={handleGuardar}
                style={{
                  width: '100%',
                  background: 'var(--pill)', color: '#ffffff',
                  border: 'none', borderRadius: '999px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '15px', fontWeight: 500,
                  padding: '15px 0', cursor: 'pointer',
                }}
              >
                Guardar en mi lista
              </button>
            </div>

            {/* De la misma categoría — scrollea con la columna derecha */}
            {relacionados.length > 0 && (
              <div className="det-rel det-anim" style={{ animationDelay: '340ms' }}>
                <h2 className="det-sh">De la misma categoría</h2>
                <div className="det-rel-scroll">
                  {relacionados.map(rel => (
                    <RelCard key={rel.id} producto={rel} onClick={() => onVerProducto?.(rel)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RelCard({ producto, onClick }: { producto: Producto; onClick: () => void }) {
  const [imgSrc, setImgSrc] = useState(producto.imageUrl || '')
  const [fallbackIdx, setFallbackIdx] = useState(0)
  const preciosValidos = producto.precios.filter(p => p.precio > 0)
  const mejor = preciosValidos.length ? Math.min(...preciosValidos.map(p => p.precio)) : 0

  const handleError = () => {
    const fallbacks = producto.imagenFallbacks || []
    if (fallbackIdx < fallbacks.length) {
      setImgSrc(fallbacks[fallbackIdx])
      setFallbackIdx(prev => prev + 1)
    } else {
      setImgSrc('')
    }
  }

  return (
    <div className="det-rel-card" onClick={onClick} style={{ flexShrink: 0, width: '124px', cursor: 'pointer' }}>
      <div className="ph" style={{
        height: '110px', background: 'var(--plate)', borderRadius: '6px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={producto.nombre}
            width={92}
            height={92}
            className="img-plate"
            style={{ maxHeight: '92px', maxWidth: '86%', objectFit: 'contain', width: 'auto', height: 'auto' }}
            unoptimized
            onError={handleError}
          />
        ) : (
          <span style={{ color: 'var(--line)', fontSize: '24px' }}>?</span>
        )}
      </div>
      <div className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px', color: 'var(--ink)' }}>
        {producto.nombre}
      </div>
      {mejor > 0 && (
        <div className="tnum" style={{ fontSize: '14px', fontWeight: 500, marginTop: '1px', color: 'var(--ink)' }}>
          {formatearPrecio(mejor)}
        </div>
      )}
    </div>
  )
}
