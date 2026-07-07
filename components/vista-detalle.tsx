'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, Heart, Share2, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { Producto, productos, formatearPrecio, extraerTamano, fuentePorNombre } from '@/lib/data'
import { ShuffleValue } from '@/components/shuffle-value'
import { FrescuraPill } from '@/components/frescura-pill'
import { HScroll } from '@/components/h-scroll'
import { ChipTipo } from '@/components/chip-tipo'

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

export function VistaDetalle({
  producto,
  onBack,
  onGuardar,
  esFavorito,
  onToggleFavorito,
  onVerProducto,
}: VistaDetalleProps) {
  const [margen, setMargen] = useState(35)
  // Calculadora flexible (pedido Facu 06/07): base a libre elección entre TODOS
  // los competidores (mayorista o cadena) + precio de venta tipeado exacto
  const [fuenteSel, setFuenteSel] = useState<string | null>(null)
  const [ventaManual, setVentaManual] = useState<number | null>(null)
  const [imgSrc, setImgSrc] = useState(producto.imageUrl || '')
  const [imgFallbackIdx, setImgFallbackIdx] = useState(0)

  useEffect(() => {
    setImgSrc(producto.imageUrl || '')
    setImgFallbackIdx(0)
    setFuenteSel(null)
    setVentaManual(null)
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
  // Mayoristas = precio de compra; cadenas (Coto, Carrefour) = referencia góndola.
  // filter, no find: con 2+ cadenas el find mostraba solo la primera (bug 06/07)
  const preciosValidos = producto.precios
    .filter(p => p.precio > 0 && p.tipoFuente === 'mayorista')
    .sort((a, b) => a.precio - b.precio)
  const preciosGondola = producto.precios
    .filter(p => p.precio > 0 && p.tipoFuente === 'cadena')
    .sort((a, b) => a.precio - b.precio)

  const mejorPrecio = preciosValidos[0]
  const peorPrecio = preciosValidos[preciosValidos.length - 1]
  const esEan = /^\d{13}$/.test(producto.id)

  // Base de la calculadora: el competidor que elija el usuario (default: el
  // mayorista más barato). ventaManual (tipeado exacto) manda sobre el slider.
  const preciosTodos = [...preciosValidos, ...preciosGondola]
  const precioBase = (fuenteSel ? preciosTodos.find(p => p.mayorista === fuenteSel) : undefined)
    ?? mejorPrecio ?? preciosTodos[0]
  const precioCompra = precioBase?.precio ?? 0
  const precioVentaCalc = ventaManual ?? (precioCompra > 0 ? precioCompra / (1 - margen / 100) : 0)
  const gananciaCalc = precioVentaCalc - precioCompra
  const margenEfectivo = precioVentaCalc > 0 ? Math.round((1 - precioCompra / precioVentaCalc) * 100) : margen

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
    // Mi Lista ahora soporta 3 ámbitos (Más barato / Mayoristas / Cadenas) y
    // recalcula el mejor precio en vivo según cuál esté activo — guardamos la
    // fuente que el usuario esté mirando en la calculadora tal cual, sin forzar
    // un fallback a mayorista acá.
    if (!precioBase) {
      toast.error('Este producto no tiene precio disponible para comprar')
      return
    }
    const venta = Math.round(precioVentaCalc)
    onGuardar({
      producto,
      mayorista: precioBase.mayorista,
      precioCompra: precioBase.precio,
      margen: venta > 0 ? Math.round((1 - precioBase.precio / venta) * 100) : margenEfectivo,
      precioVenta: venta,
      ganancia: venta - Math.round(precioBase.precio),
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

              {/* Una sola tira: mayoristas primero (por precio), cadenas después.
                  El chip por fila reemplaza a los sub-encabezados */}
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
                      borderBottom: idx === preciosValidos.length - 1 && preciosGondola.length === 0 ? 'none' : '1px solid var(--line)',
                    }}
                  >
                    <div style={{ width: '86px', flexShrink: 0 }}>
                      {fuentePorNombre(precio.mayorista)?.logo ? (
                        <Image
                          src={fuentePorNombre(precio.mayorista)!.logo}
                          alt={precio.mayorista}
                          width={82}
                          height={22}
                          style={{ maxWidth: '82px', maxHeight: '22px', objectFit: 'contain', display: 'block', width: 'auto', height: 'auto' }}
                          unoptimized
                        />
                      ) : (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{precio.mayorista}</span>
                      )}
                      <ChipTipo tipo="mayorista" style={{ marginTop: '5px' }} />
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
                      {/* El portal del comerciante de Carrefour suma percepciones IIBB (~3%)
                          segun el CUIT del cliente — mostrar el equivalente evita que el
                          usuario crea que nuestro precio esta mal al comparar con su portal */}
                      {precio.mayorista === 'MaxiCarrefour' && (
                        <div className="tnum" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '2px' }}>
                          ≈ {formatearPrecio(precio.precio * 1.03)} en tu portal con percepciones (3%)
                        </div>
                      )}
                      <div style={{ marginTop: '3px' }}>
                        <FrescuraPill precio={precio} />
                      </div>
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

              {/* Cadenas: misma tira, misma fila — el chip CADENA (verde) las
                  distingue. Es venta al público, nunca precio de compra */}
              {preciosGondola.map((precio, idx) => (
                <div
                  key={precio.mayorista}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '15px 0',
                    borderBottom: idx === preciosGondola.length - 1 ? 'none' : '1px solid var(--line)',
                  }}
                >
                  <div style={{ width: '86px', flexShrink: 0 }}>
                    {fuentePorNombre(precio.mayorista)?.logo ? (
                      <Image
                        src={fuentePorNombre(precio.mayorista)!.logo}
                        alt={precio.mayorista}
                        width={82}
                        height={22}
                        style={{ maxWidth: '82px', maxHeight: '22px', objectFit: 'contain', display: 'block', width: 'auto', height: 'auto' }}
                        unoptimized
                      />
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{precio.mayorista}</span>
                    )}
                    <ChipTipo tipo="cadena" style={{ marginTop: '5px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span className="tnum" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                        {formatearPrecio(precio.precio)}
                      </span>
                      {precio.oferta && (
                        <span style={{ fontSize: '10.7px', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.04em' }}>
                          OFERTA {precio.oferta}
                        </span>
                      )}
                    </div>
                    {/* Tachado solo si el regular es MAYOR: en promos por cantidad
                        (2do al X%) el precio unitario no cambia y tacharlo confunde */}
                    {precio.oferta && precio.precioRegular && precio.precioRegular > precio.precio ? (
                      <div className="tnum" style={{ fontSize: '11.8px', color: 'var(--gray)', fontWeight: 400, marginTop: '1px' }}>
                        precio de lista <s>{formatearPrecio(precio.precioRegular)}</s>
                      </div>
                    ) : (
                      <div className="tnum" style={{ fontSize: '11.8px', color: 'var(--gray)', fontWeight: 400, marginTop: '1px' }}>
                        venta al público
                      </div>
                    )}
                    <div style={{ marginTop: '3px' }}>
                      <FrescuraPill precio={precio} />
                    </div>
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
              ))}

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
                      const pos = dotPos(precio.precio)
                      // Dots cerca de los bordes: anclar el label hacia adentro para que
                      // nunca se corte fuera del viewport (en mobile la barra es angosta)
                      const anclaLabel: React.CSSProperties =
                        pos < 14 ? { left: '-6px' }
                        : pos > 86 ? { right: '-6px' }
                        : { left: '50%', transform: 'translateX(-50%)' }
                      return (
                        <span
                          key={precio.mayorista}
                          style={{
                            position: 'absolute', top: '50%', left: `${pos}%`,
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
                            ...anclaLabel,
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
                <p style={{ marginTop: '10px', marginBottom: 0, fontSize: '11px', fontWeight: 300, lineHeight: 1.5, color: 'var(--gray)' }}>
                  Precios finales con IVA. Pueden variar levemente según tu condición fiscal (percepciones) y sucursal.
                </p>
              </div>
            </section>

            {/* Calculadora de margen */}
            {precioBase && (
              <div className="det-calc det-anim" style={{
                animationDelay: '260ms',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                padding: '20px',
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--ink)', margin: 0 }}>
                  Calculadora de margen
                </h2>
                {/* Base a libre elección: cualquier competidor, mayorista o cadena */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {preciosTodos.map(p => {
                    const activo = p.mayorista === precioBase.mayorista
                    return (
                      <button
                        key={p.mayorista}
                        onClick={() => setFuenteSel(p.mayorista)}
                        style={{
                          border: activo ? '1.5px solid var(--ink)' : '1px solid var(--line)',
                          background: activo ? 'var(--ink)' : '#ffffff',
                          color: activo ? '#ffffff' : 'var(--ink)',
                          borderRadius: '999px', padding: '6px 12px',
                          fontSize: '11.5px', fontWeight: 600,
                          fontFamily: 'var(--font-sans)', cursor: 'pointer',
                        }}
                      >
                        {p.mayorista} <span className="tnum" style={{ fontWeight: 500 }}>{formatearPrecio(p.precio)}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="tnum" style={{ fontSize: '12.8px', color: 'var(--gray)', fontWeight: 400, marginTop: '10px' }}>
                  Comprando en {precioBase.mayorista} a <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{formatearPrecio(precioCompra)}</b>
                  {precioBase.tipoFuente === 'cadena' ? ' (precio góndola)' : ''}
                </div>
                {/* Referencia conservadora: la cadena MÁS BARATA (preciosGondola viene ordenado) */}
                {preciosGondola[0] && preciosGondola[0].precio > precioCompra && (
                  <div className="tnum" style={{ fontSize: '12.8px', color: 'var(--gray)', fontWeight: 400, marginTop: '4px' }}>
                    {preciosGondola[0].mayorista} lo vende al público a <b style={{ color: 'var(--ink)', fontWeight: 600 }}>{formatearPrecio(preciosGondola[0].precio)}</b> —
                    igualando la góndola tu margen es <b style={{ color: 'var(--green)', fontWeight: 600 }}>{Math.round(((preciosGondola[0].precio - precioCompra) / preciosGondola[0].precio) * 100)}%</b>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '18px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink)' }}>Tu margen</span>
                  <span className="tnum" style={{ fontSize: '18px', fontWeight: 600, color: margenEfectivo < 0 ? '#c0392b' : 'var(--gold)' }}>{margenEfectivo}%</span>
                </div>
                <input
                  type="range"
                  className="slider-brujula"
                  min={5} max={99} value={Math.min(99, Math.max(5, margenEfectivo))}
                  onChange={e => { setMargen(parseInt(e.target.value, 10)); setVentaManual(null) }}
                  aria-label="Margen de ganancia"
                  style={{ marginTop: '8px', '--slider-pct': `${((Math.min(99, Math.max(5, margenEfectivo)) - 5) / (99 - 5)) * 100}%` } as React.CSSProperties}
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '22px' }}>
                  <div style={{ flex: 1, background: 'var(--plate)', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray)', textTransform: 'uppercase' }}>
                      Precio venta · tocá y editá
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '3px' }}>
                      <span className="tnum" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)' }}>$&nbsp;</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="tnum"
                        value={Math.round(precioVentaCalc).toLocaleString('es-AR')}
                        onChange={e => {
                          const n = parseInt(e.target.value.replace(/[^\d]/g, ''), 10)
                          setVentaManual(Number.isNaN(n) ? null : n)
                        }}
                        aria-label="Precio de venta exacto"
                        style={{
                          fontSize: '24px', fontWeight: 600, color: 'var(--ink)',
                          background: 'transparent', border: 'none', outline: 'none',
                          borderBottom: '1.5px dashed var(--gray)',
                          width: '100%', minWidth: 0, padding: 0,
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--plate)', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--gray)', textTransform: 'uppercase' }}>
                      Ganancia
                    </div>
                    <ShuffleValue
                      value={formatearPrecio(Math.round(gananciaCalc))}
                      style={{ fontSize: '24px', fontWeight: 600, marginTop: '3px', color: gananciaCalc >= 0 ? 'var(--green)' : '#c0392b', display: 'block' }}
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
                <HScroll className="det-rel-scroll" arrowOffsetY={7}>
                  {relacionados.map(rel => (
                    <RelCard key={rel.id} producto={rel} onClick={() => onVerProducto?.(rel)} />
                  ))}
                </HScroll>
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
  // "Desde $X" = mejor precio de COMPRA (mayoristas); si solo hay góndola, mostrar esa
  const preciosMay = producto.precios.filter(p => p.precio > 0 && p.tipoFuente === 'mayorista')
  const preciosValidos = preciosMay.length ? preciosMay : producto.precios.filter(p => p.precio > 0)
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
