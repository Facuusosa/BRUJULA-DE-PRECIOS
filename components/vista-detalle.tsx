'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, Heart, Share2, ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import { Producto, Precio, productos, formatearPrecio, fuentePorNombre, frescuraDe } from '@/lib/data'
import { HScroll } from '@/components/h-scroll'
import { ElegiTuPrecio } from '@/components/elegi-tu-precio'
import { compartirProducto } from '@/lib/compartir'

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
  enLista?: boolean
}

// Rediseño aprobado por Facu 12/10/2026 (maqueta "Pantalla 1", artifact 1EGubwve…):
// el precio más barato arriba con la foto chica al costado, mayoristas y súper separados,
// fecha del precio en todas las filas. "Elegí tu precio" (pantalla 2) reemplaza a la
// vieja calculadora de margen.
export function VistaDetalle({
  producto,
  onBack,
  onGuardar,
  esFavorito,
  onToggleFavorito,
  onVerProducto,
  enLista,
}: VistaDetalleProps) {
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

  // Mayoristas = precio de compra; cadenas = lo que paga el cliente en góndola
  const preciosValidos = producto.precios
    .filter(p => p.precio > 0 && p.tipoFuente === 'mayorista')
    .sort((a, b) => a.precio - b.precio)
  const preciosGondola = producto.precios
    .filter(p => p.precio > 0 && p.tipoFuente === 'cadena')
    .sort((a, b) => a.precio - b.precio)

  // "Lo más barato" es una afirmación objetiva: gana el precio más bajo de TODA la
  // ficha, sea mayorista o súper (bug 22/07: siempre ganaba el mayorista)
  const mejorGlobal = [preciosValidos[0], preciosGondola[0]]
    .filter((p): p is Precio => !!p)
    .reduce<Precio | undefined>((a, b) => (!a || b.precio < a.precio ? b : a), undefined)
  // Con una sola fuente no hay con qué comparar: "más barato" sería una afirmación vacía
  const hayComparacion = preciosValidos.length + preciosGondola.length >= 2
  const ahorroVsSuper = mejorGlobal?.tipoFuente === 'mayorista' && preciosGondola[0]
    ? preciosGondola[0].precio - mejorGlobal.precio
    : 0

  // El 72% del catálogo no tiene subcategoría cargada — filtrar SOLO por
  // subcategoría dejaba a la mayoría sin relacionados. Con subcategoría y
  // volumen suficiente (>=4) se usa esa (más específica: Gaseosas, no todo
  // Bebidas); si no, cae a sector, igual que antes.
  const relacionados = useMemo(() => {
    const ordenar = (lista: Producto[]) => lista
      .sort((a, b) => {
        const abcOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
        const aAbc = abcOrder[a.abc ?? ''] ?? 4
        const bAbc = abcOrder[b.abc ?? ''] ?? 4
        if (aAbc !== bAbc) return aAbc - bAbc
        return b.precios.filter(p => p.precio > 0).length - a.precios.filter(p => p.precio > 0).length
      })
      .slice(0, 10)
    const porSubcategoria = producto.subcategoria
      ? productos.filter(p => p.subcategoria === producto.subcategoria && p.id !== producto.id && p.precios.some(pr => pr.precio > 0))
      : []
    if (porSubcategoria.length >= 4) return ordenar(porSubcategoria)
    return ordenar(productos.filter(p => p.sector === producto.sector && p.id !== producto.id && p.precios.some(pr => pr.precio > 0)))
  }, [producto.sector, producto.subcategoria, producto.id])
  const relacionadosPorSubcategoria = !!producto.subcategoria
    && relacionados.every(r => r.subcategoria === producto.subcategoria)

  const guardar = (eleccion: { mayorista: string; precioCompra: number; precioVenta: number }) => {
    if (enLista) return
    const { mayorista, precioCompra, precioVenta } = eleccion
    onGuardar({
      producto,
      mayorista,
      precioCompra,
      precioVenta,
      margen: precioVenta > 0 ? Math.round((1 - precioCompra / precioVenta) * 100) : 0,
      ganancia: precioVenta - Math.round(precioCompra),
    })
  }

  // El botón de arriba guarda con lo más barato y el precio del súper del medio como venta
  // sugerida (el mismo default de "Elegí tu precio"); abajo se guarda lo que el usuario eligió.
  const guardarRapido = () => {
    if (!mejorGlobal) {
      toast.error('Este producto no tiene precio disponible para comprar')
      return
    }
    const venta = preciosGondola[Math.floor(preciosGondola.length / 2)]?.precio ?? 0
    guardar({ mayorista: mejorGlobal.mayorista, precioCompra: mejorGlobal.precio, precioVenta: Math.round(venta) })
  }

  const handleCompartir = () => compartirProducto(producto.nombre)

  return (
    <div style={{ background: '#ffffff', minHeight: '100%', paddingBottom: '40px' }}>
      <style>{`
        @keyframes det-rise { to { opacity: 1; transform: translateY(0); } }
        .det-anim { opacity: 0; transform: translateY(10px); animation: det-rise 380ms var(--ease-out) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .det-anim { transform: none; animation-duration: 150ms; }
        }
        .det-wrap { max-width: 1120px; margin: 0 auto; }
        .det-top { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px 4px; }
        .det-top button { background: none; border: none; cursor: pointer; color: var(--ink); font-family: var(--font-sans); display: flex; align-items: center; }
        .det-cols { display: grid; gap: 22px; padding: 0 20px; }
        .det-col { display: grid; gap: 22px; align-content: start; min-width: 0; }
        .det-nombre { font-size: 26px; font-weight: 600; letter-spacing: -0.4px; line-height: 1.15; margin: 0; color: var(--ink); }
        .det-sub { font-size: 15px; color: var(--gray); margin-top: 2px; }
        .det-hero { display: grid; grid-template-columns: 120px 1fr; gap: 16px; align-items: center; }
        .det-foto { position: relative; background: var(--plate); border-radius: 16px; aspect-ratio: 4 / 5; display: grid; place-items: center; padding: 8px; overflow: hidden; }
        .det-foto img { width: 100%; height: 100%; object-fit: contain; }
        .det-top-ventas { position: absolute; top: 6px; left: 6px; background: var(--gold); color: #fff; font-size: 9.5px; font-weight: 600; letter-spacing: 0.08em; border-radius: 999px; padding: 3px 8px; }
        .det-etq { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray); }
        .det-precio { font-size: 36px; font-weight: 700; letter-spacing: -1px; line-height: 1.05; color: var(--ink); }
        .det-precio small { font-size: 22px; font-weight: 600; }
        .det-donde { display: flex; align-items: center; gap: 8px; font-size: 15px; margin-top: 4px; color: var(--ink); flex-wrap: wrap; }
        .det-donde img { max-width: 90px; object-fit: contain; }
        .det-vs { margin-top: 10px; font-size: 22px; line-height: 1.15; background: var(--green-bg); color: var(--green); border-radius: 12px; padding: 10px 12px; font-weight: 800; letter-spacing: -.01em; }
        .det-vs span { display: block; font-size: 13px; font-weight: 500; margin-top: 2px; }
        .det-acciones { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .det-btn { border-radius: 999px; padding: 13px 16px; font-family: var(--font-sans); font-weight: 500; font-size: 15px; border: 1.5px solid var(--line); background: #fff; color: var(--ink); cursor: pointer; }
        .det-btn.negro { background: var(--ink); color: #fff; border-color: var(--ink); font-weight: 600; }
        .det-btn.ok { background: var(--green); border-color: var(--green); color: #fff; cursor: default; font-weight: 600; }
        .det-btn:focus-visible, .det-ver:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .det-grupo h2 { font-size: 20px; font-weight: 600; margin: 0 0 2px; color: var(--ink); letter-spacing: -0.2px; }
        .det-grupo .ayuda { margin: 0 0 6px; font-size: 14px; color: var(--gray); }
        .det-fila { display: grid; grid-template-columns: minmax(0, 1fr) auto 96px; gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); }
        .det-fila:last-child { border-bottom: none; }
        .det-logo { height: 32px; width: 76px; object-fit: contain; object-position: left center; }
        .det-fila .pr { font-weight: 600; color: var(--ink); }
        .det-fila.mejor .pr { color: var(--green); }
        .det-det { font-size: 14px; color: var(--gray); display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-top: 1px; }
        .det-mejor, .det-oferta { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; }
        .det-mejor { background: var(--green); color: #fff; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
        .det-oferta { color: #b45309; }
        .det-fila.mejor { background: var(--green-bg); border-radius: 14px; padding-left: 12px; padding-right: 12px; margin: 0 -12px; border-bottom-color: transparent; }
        .det-nota { font-size: 12.5px; color: var(--gray); margin-top: 2px; }
        .det-fecha { font-size: 13px; display: inline-flex; align-items: center; gap: 5px; color: var(--gray); }
        .det-fecha::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--dot); }
        .det-ver { border: 1.5px solid var(--ink); border-radius: 999px; padding: 7px 14px; font-size: 14px; font-weight: 500; color: var(--ink); text-decoration: none; display: flex; align-items: center; gap: 4px; background: #fff; }
        .det-sincuenta { font-size: 13px; color: var(--gray); text-align: right; max-width: 70px; line-height: 1.2; }
        .det-fila .quien { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .det-fila .det-logo { width: 62px; flex: none; }
        .det-fila .nom { font-size: 14.5px; font-weight: 500; color: var(--ink); line-height: 1.2; overflow-wrap: anywhere; }
        .det-fila .der { max-width: 150px; text-align: right; display: grid; justify-items: end; gap: 2px; }
        .det-fila .pr { font-size: 19px; }
        .det-fila .det-ver, .det-fila .det-sincuenta { justify-self: end; }
        .det-legal { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--gray); }
        .det-rel { padding: 30px 0 40px; }
        .det-rel h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.2px; color: var(--ink); margin: 0; padding: 0 20px; }
        .det-rel-scroll { display: flex; gap: 12px; padding: 14px 20px 0; overflow-x: auto; scrollbar-width: none; }
        .det-rel-scroll::-webkit-scrollbar { display: none; }
        @media (min-width: 1000px) {
          .det-wrap { padding: 0 44px; }
          .det-top { padding: 16px 0 8px; }
          .det-cols { grid-template-columns: minmax(0, 1fr) minmax(0, 440px); gap: 56px; padding: 0; align-items: start; }
          .det-col.der { position: sticky; top: 16px; }
          .det-hero { grid-template-columns: 180px 1fr; gap: 24px; }
          .det-rel h2, .det-rel-scroll { padding-left: 0; padding-right: 0; }
          .det-rel-card { width: 150px !important; }
        }
        @media (hover: hover) and (pointer: fine) {
          .det-rel-card .ph img { transition: transform 450ms var(--ease-out); }
          .det-rel-card:hover .ph img { transform: scale(1.05); }
          .det-ver:hover { background: var(--plate); }
        }
      `}</style>

      <div className="det-wrap">
        <div className="det-top det-anim">
          <button onClick={onBack} style={{ gap: '6px', fontSize: '15px', fontWeight: 500, padding: '6px 0' }}>
            <ChevronLeft size={22} strokeWidth={2} />
            Volver
          </button>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onToggleFavorito} aria-label="Favorito" style={{ padding: '4px', color: esFavorito ? 'var(--gold)' : 'var(--ink)' }}>
              <Heart size={22} strokeWidth={1.8} fill={esFavorito ? 'var(--gold)' : 'none'} />
            </button>
            <button onClick={handleCompartir} aria-label="Compartir" style={{ padding: '4px' }}>
              <Share2 size={22} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="det-cols">
          <div className="det-col">
            <div className="det-anim" style={{ animationDelay: '50ms' }}>
              <h1 className="det-nombre">{producto.nombre}</h1>
              {producto.subcategoria && <div className="det-sub">{producto.subcategoria}</div>}
            </div>

            <div className="det-hero det-anim" style={{ animationDelay: '100ms' }}>
              <div className="det-foto">
                {/* "Clase A" es jerga interna de volumen de ventas: se traduce a algo que dice algo real */}
                {producto.abc === 'A' && <span className="det-top-ventas">TOP VENTAS</span>}
                {imgSrc ? (
                  <Image src={imgSrc} alt={producto.nombre} width={240} height={300} className="img-plate" unoptimized onError={handleImageError} />
                ) : (
                  <span style={{ color: 'var(--line)', fontSize: '40px' }}>?</span>
                )}
              </div>
              {mejorGlobal ? (
                <div>
                  <div className="det-etq">{hayComparacion ? 'Lo más barato' : 'Precio'}</div>
                  <PrecioGrande valor={mejorGlobal.precio} />
                  <div className="det-donde">
                    <LogoFuente nombre={mejorGlobal.mayorista} alto={22} />
                    {mejorGlobal.tipoFuente === 'mayorista' ? 'mayorista' : 'súper'}
                  </div>
                  <div style={{ marginTop: '4px' }}><Fecha precio={mejorGlobal} larga /></div>
                  {!hayComparacion && <div className="det-nota">Solo lo encontramos en {mejorGlobal.mayorista}</div>}
                  {ahorroVsSuper > 0 && <div className="det-vs tnum">Ahorrás {formatearPrecio(Math.round(ahorroVsSuper))} <span>vs. comprar en el súper</span></div>}
                </div>
              ) : (
                <div className="det-nota">Sin precio disponible hoy.</div>
              )}
            </div>

            <div className="det-acciones det-anim" style={{ animationDelay: '140ms' }}>
              <button className={`det-btn ${enLista ? 'ok' : 'negro'}`} onClick={guardarRapido} aria-label={enLista ? 'Ya en tu lista' : 'Guardar en mi lista'}>
                {enLista ? 'En tu lista' : 'Guardar'}
              </button>
              <button className="det-btn" onClick={handleCompartir}>Compartir</button>
            </div>

            {preciosValidos.length > 0 && (
              <section className="det-grupo det-anim" style={{ animationDelay: '180ms' }}>
                <h2>Dónde comprarlo</h2>
                <p className="ayuda">Mayoristas: precio de compra</p>
                {preciosValidos.map(precio => {
                  const esMejor = hayComparacion && mejorGlobal?.mayorista === precio.mayorista
                  return (
                    <div key={precio.mayorista} className={`det-fila${esMejor ? ' mejor' : ''}`}>
                      <div className="quien"><LogoFuente nombre={precio.mayorista} /><span className="nom">{precio.mayorista}</span></div>
                      <div className="der">
                        <div className="pr tnum">{formatearPrecio(precio.precio)}</div>
                        {esMejor && <span className="det-mejor">MÁS BARATO</span>}
                        {precio.oferta && <span className="det-oferta">OFERTA {precio.oferta}</span>}
                        {precio.oferta && precio.precioRegular && precio.precioRegular > precio.precio && (
                          <span className="det-nota tnum">de lista <s>{formatearPrecio(precio.precioRegular)}</s></span>
                        )}
                        {/* El portal de MaxiCarrefour suma percepciones IIBB (~3%) según el CUIT:
                            sin este aviso el comerciante cree que nuestro precio está mal */}
                        {precio.mayorista === 'MaxiCarrefour' && (
                          <span className="det-nota tnum">≈ {formatearPrecio(Math.round(precio.precio * 1.03))} en tu portal con percepciones</span>
                        )}
                        <Fecha precio={precio} hace />
                      </div>
                      <BotonVer precio={precio} />
                    </div>
                  )
                })}
              </section>
            )}

            {preciosGondola.length > 0 && (
              <section className="det-grupo det-anim" style={{ animationDelay: '220ms' }}>
                <h2>Precio en el súper</h2>
                <p className="ayuda">Cadenas: lo que paga tu cliente en góndola</p>
                {preciosGondola.map(precio => {
                  const esMejor = hayComparacion && mejorGlobal?.mayorista === precio.mayorista
                  return (
                    <div key={precio.mayorista} className={`det-fila${esMejor ? ' mejor' : ''}`}>
                      <div className="quien"><LogoFuente nombre={precio.mayorista} /><span className="nom">{precio.mayorista}</span></div>
                      <div className="der">
                        <div className="pr tnum">{formatearPrecio(precio.precio)}</div>
                        {esMejor && <span className="det-mejor">MÁS BARATO</span>}
                        {precio.oferta && <span className="det-oferta">OFERTA {precio.oferta}</span>}
                        {precio.oferta && precio.precioRegular && precio.precioRegular > precio.precio && (
                          <span className="det-nota tnum">de lista <s>{formatearPrecio(precio.precioRegular)}</s></span>
                        )}
                        <Fecha precio={precio} hace />
                      </div>
                      <BotonVer precio={precio} />
                    </div>
                  )
                })}
              </section>
            )}

            <p className="det-legal">Precios finales con IVA. Pueden variar levemente según tu condición fiscal (percepciones) y sucursal.</p>
          </div>

          {mejorGlobal && (
            <div className="det-col der det-anim" style={{ animationDelay: '260ms' }}>
              <ElegiTuPrecio
                key={producto.id}
                producto={producto}
                mayoristas={preciosValidos}
                cadenas={preciosGondola}
                enLista={enLista}
                onGuardar={guardar}
              />
            </div>
          )}
        </div>

        {relacionados.length > 0 && (
          <div className="det-rel det-anim" style={{ animationDelay: '300ms' }}>
            <h2>{relacionadosPorSubcategoria ? `Más en ${producto.subcategoria}` : 'De la misma categoría'}</h2>
            <HScroll className="det-rel-scroll" arrowOffsetY={7}>
              {relacionados.map(rel => (
                <RelCard key={rel.id} producto={rel} onClick={() => onVerProducto?.(rel)} />
              ))}
            </HScroll>
          </div>
        )}
      </div>
    </div>
  )
}

// $15.943 con los centavos chicos, como en la maqueta
function PrecioGrande({ valor }: { valor: number }) {
  const [entero, centavos] = formatearPrecio(valor).split(',')
  return <div className="det-precio tnum">{entero}{centavos && <small>,{centavos}</small>}</div>
}

function LogoFuente({ nombre, alto }: { nombre: string; alto?: number }) {
  const logo = fuentePorNombre(nombre)?.logo
  if (!logo) return <span style={{ fontSize: '13px', fontWeight: 600 }}>{nombre}</span>
  return alto
    ? <Image src={logo} alt={nombre} width={90} height={alto} style={{ height: alto, width: 'auto' }} unoptimized />
    : <Image src={logo} alt={nombre} width={76} height={32} className="det-logo" unoptimized />
}

// Fecha del precio en TODAS las filas (pedido Facu 12/10): punto verde si es fresco, dorado/rojo si es viejo
function Fecha({ precio, larga, hace }: { precio: Precio; larga?: boolean; hace?: boolean }) {
  const f = frescuraDe(precio)
  if (!f) return null
  const reciente = f.label === 'Hoy' || f.label === 'Ayer'
  const texto = larga
    ? `Precio ${f.label === 'Hoy' ? 'de hoy' : f.label === 'Ayer' ? 'de ayer' : `de hace ${f.label}`}`
    : hace && !reciente ? `hace ${f.label}` : f.label
  return (
    <span className="det-fecha" style={{ '--dot': f.color } as React.CSSProperties} title={precio.fechaScraping ? `Precio del ${precio.fechaScraping}` : undefined}>
      {texto}
    </span>
  )
}

// "Ver" igual en todas las filas. Nini no tiene ficha pública (todo vive detrás del
// login de una cuenta prestada): se dice eso en vez de un botón que no lleva a nada.
function BotonVer({ precio }: { precio: Precio }) {
  if (precio.link) {
    return (
      <a className="det-ver" href={precio.link} target="_blank" rel="noopener noreferrer">
        Ver <ArrowUpRight size={13} strokeWidth={2.5} />
      </a>
    )
  }
  if (precio.mayorista === 'Nini') return <span className="det-sincuenta">Solo con cuenta</span>
  return <span />
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
