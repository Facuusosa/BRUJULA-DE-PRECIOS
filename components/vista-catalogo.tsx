'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Search, X, Check, Plus, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { productos, sectores, Producto, formatearPrecio, extraerTamano } from '@/lib/data'

const ITEMS_POR_PAGINA = 24

type Orden = 'relevancia' | 'ahorro' | 'precio-asc' | 'precio-desc'

const ORDEN_LABELS: Record<Orden, string> = {
  'relevancia':  'Relevancia',
  'ahorro':      'Mayor ahorro',
  'precio-asc':  'Menor precio',
  'precio-desc': 'Mayor precio',
}

interface VistaCatalogoProps {
  sectorActivo?: string
  mayoristaBuscado?: string
  textoBusquedaInicial?: string
  subcategoriaActiva?: string
  onVerProducto: (producto: Producto) => void
  onIrAHerramientas?: () => void
  favoritos: Set<string>
  onToggleFavorito: (id: string) => void
  onSectorChange?: (sector: string) => void
  onSubcategoriaChange?: (sub: string) => void
  onAgregarALista?: (producto: Producto) => void
  listaIds?: Set<string>
}

const MAYORISTAS_FILTER = [
  { nombre: 'MaxiCarrefour', logo: '/mayoristas/maxicarrefour.jpg' },
  { nombre: 'Yaguar',        logo: '/mayoristas/yaguar.png' },
  { nombre: 'Maxiconsumo',   logo: '/mayoristas/maxiconsumo.webp' },
]

const fmt = new Intl.NumberFormat('es-AR')

function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function ahorroPct(p: Producto): number {
  const validos = p.precios.filter(pr => pr.precio > 0)
  if (validos.length < 2) return 0
  const min = Math.min(...validos.map(v => v.precio))
  const max = Math.max(...validos.map(v => v.precio))
  return Math.round(((max - min) / max) * 100)
}

function precioMin(p: Producto): number {
  const validos = p.precios.filter(pr => pr.precio > 0)
  return validos.length ? Math.min(...validos.map(v => v.precio)) : 0
}

/* Click Spark (ReactBits) — chispa dorada al agregar a lista. Feedback, no decoración. */
function clickSpark(el: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const r = el.getBoundingClientRect()
  const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#c89055'
  for (let i = 0; i < 6; i++) {
    const s = document.createElement('span')
    const a = (i / 6) * Math.PI * 2
    s.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:4px;height:4px;border-radius:99px;background:${gold};pointer-events:none;z-index:99;`
    document.body.appendChild(s)
    s.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${Math.cos(a) * 24}px, ${Math.sin(a) * 24}px) scale(0.3)`, opacity: 0 },
    ], { duration: 320, easing: 'cubic-bezier(0.23,1,0.32,1)' }).onfinish = () => s.remove()
  }
}

export function VistaCatalogo({
  sectorActivo: sectorInicial = 'Todos',
  mayoristaBuscado: mayoristaBuscadoInicial = '',
  textoBusquedaInicial = '',
  subcategoriaActiva: subcategoriaInicial = '',
  onVerProducto,
  onSectorChange,
  onSubcategoriaChange,
  onAgregarALista,
  listaIds = new Set(),
}: VistaCatalogoProps) {
  const [busqueda, setBusqueda] = useState(textoBusquedaInicial)
  const [mayoristaSel, setMayoristaSel] = useState(mayoristaBuscadoInicial || '')
  const [sectorSel, setSectorSel] = useState(sectorInicial !== 'Todos' ? sectorInicial : '')
  const [soloComparables, setSoloComparables] = useState(false)
  const [orden, setOrden] = useState<Orden>('relevancia')
  const [dropdownAbierto, setDropdownAbierto] = useState<'orden' | 'mayorista' | null>(null)
  const [paginaActual, setPaginaActual] = useState(0)

  // El catálogo es navegable desde el drawer/sidebar: sincronizar el sector externo
  useEffect(() => {
    setSectorSel(sectorInicial !== 'Todos' ? sectorInicial : '')
  }, [sectorInicial])

  const handleQuitarSector = () => {
    setSectorSel('')
    onSectorChange?.('Todos')
    onSubcategoriaChange?.('')
  }

  const comparablesCount = useMemo(() =>
    productos.filter(p => p.precios.filter(pr => pr.precio > 0).length >= 2).length,
    []
  )

  const productosFiltrados = useMemo(() => {
    let lista = productos.filter(p => p.precios.some(pr => pr.precio > 0))

    if (mayoristaSel) {
      lista = lista.filter(p => p.precios.some(pr => pr.mayorista === mayoristaSel && pr.precio > 0))
    }
    if (sectorSel) {
      lista = lista.filter(p => p.sector === sectorSel)
    }
    if (subcategoriaInicial) {
      lista = lista.filter(p => p.subcategoria === subcategoriaInicial)
    }
    if (soloComparables) {
      lista = lista.filter(p => p.precios.filter(pr => pr.precio > 0).length >= 2)
    }
    if (busqueda.trim()) {
      const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean)
      lista = lista.filter(p => {
        const texto = `${normalizar(p.nombre)} ${normalizar(p.subcategoria)} ${normalizar(p.sector)}`
        return palabras.every(w => texto.includes(w))
      })
    }

    const porRelevancia = (a: Producto, b: Producto) => {
      const abcOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
      const aAbc = abcOrder[a.abc ?? 'D'] ?? 3
      const bAbc = abcOrder[b.abc ?? 'D'] ?? 3
      if (aAbc !== bAbc) return aAbc - bAbc
      return b.precios.filter(p => p.precio > 0).length - a.precios.filter(p => p.precio > 0).length
    }

    switch (orden) {
      case 'ahorro':      return [...lista].sort((a, b) => ahorroPct(b) - ahorroPct(a))
      case 'precio-asc':  return [...lista].sort((a, b) => precioMin(a) - precioMin(b))
      case 'precio-desc': return [...lista].sort((a, b) => precioMin(b) - precioMin(a))
      default:            return [...lista].sort(porRelevancia)
    }
  }, [busqueda, mayoristaSel, sectorSel, subcategoriaInicial, soloComparables, orden])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA)
  const productosVisibles = productosFiltrados.slice(
    paginaActual * ITEMS_POR_PAGINA,
    (paginaActual + 1) * ITEMS_POR_PAGINA
  )

  const filterKey = `${mayoristaSel}-${sectorSel}-${subcategoriaInicial}-${busqueda}-${soloComparables}-${orden}`

  useEffect(() => {
    setPaginaActual(0)
  }, [filterKey])

  const tituloActivo = subcategoriaInicial || sectorSel || mayoristaSel || 'Ofertas del día'

  const chipStyle = (activo: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '7px',
    border: `1px solid ${activo ? 'var(--pill)' : 'var(--line)'}`,
    borderRadius: '999px',
    padding: '9px 16px',
    fontSize: '13.5px', fontWeight: 500,
    whiteSpace: 'nowrap',
    background: activo ? 'var(--pill)' : '#ffffff',
    color: activo ? '#ffffff' : 'var(--ink)',
    cursor: 'pointer',
    flexShrink: 0,
  })

  return (
    <div className="catalogo" style={{ background: '#ffffff', minHeight: '100%', paddingBottom: '60px' }} onClick={() => setDropdownAbierto(null)}>
      <style>{`
        @keyframes cat-rise { to { opacity: 1; transform: translateY(0); } }
        .cat-anim { opacity: 0; transform: translateY(10px); animation: cat-rise 380ms var(--ease-out) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .cat-anim { transform: none; animation-duration: 150ms; }
        }

        .cat-content { max-width: 1500px; margin: 0 auto; }
        .cat-search { margin: 4px 20px 0; }
        .cat-filters { display: flex; gap: 9px; padding: 14px 20px 0; overflow-x: auto; scrollbar-width: none; }
        .cat-filters::-webkit-scrollbar { display: none; }
        .cat-meta { padding: 16px 20px 4px; display: flex; align-items: baseline; justify-content: space-between; }
        .cat-meta h2 { font-size: 20px; font-weight: 600; letter-spacing: -0.3px; margin: 0; color: var(--ink); }
        .cat-stores { display: none; }

        /* Grid 2 col — celdas divididas por hairlines, sin cards */
        .cat-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 10px; }
        .cat-cell {
          padding: 18px 16px 20px;
          border-top: 1px solid var(--line);
          position: relative;
          cursor: pointer;
        }
        .cat-cell:nth-child(odd) { border-right: 1px solid var(--line); }
        .cat-ph {
          height: 130px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
        }

        @media (hover: hover) and (pointer: fine) {
          .cat-cell { transition: background 150ms ease; }
          .cat-cell:hover { background: #fafafa; }
        }

        /* Desktop estilo Trolley /deals/: grid de placas con aire */
        @media (min-width: 1000px) {
          .cat-search { margin: 4px 0 0; max-width: 640px; }
          .cat-content { padding: 0 44px; }
          .cat-stores { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 26px; }
          .cat-filters { padding: 22px 0 0; }
          .cat-meta { padding: 28px 0 4px; }
          .cat-meta h2 { font-size: 25.7px; }
          .cat-grid { grid-template-columns: repeat(4, 1fr); gap: 34px 24px; margin-top: 18px; }
          .cat-cell { border: none !important; padding: 0; }
          .cat-cell:hover { background: transparent; }
          .cat-ph {
            background: var(--plate); border-radius: 4px;
            height: 280px; margin-bottom: 16px;
            position: relative;
          }
        }
        @media (max-width: 999px) {
          .cat-content { padding: 0; }
        }
      `}</style>

      <div className="cat-content">

        {/* Búsqueda — UNA sola */}
        <div className="cat-search cat-anim" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--plate)',
          borderRadius: '999px',
          padding: '13px 18px',
        }}>
          <Search size={17} color="var(--gray)" strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder={`Buscar entre ${fmt.format(productos.length)} productos`}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '14px', color: 'var(--ink)', outline: 'none', minWidth: 0,
              fontFamily: 'var(--font-sans)',
            }}
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: 'var(--gray)' }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Cards de mayoristas — solo desktop, "Filter by store" */}
        <div className="cat-stores cat-anim" style={{ animationDelay: '90ms' }}>
          {MAYORISTAS_FILTER.map(m => {
            const activo = mayoristaSel === m.nombre
            return (
              <button
                key={m.nombre}
                onClick={() => setMayoristaSel(activo ? '' : m.nombre)}
                style={{
                  border: `1px solid ${activo ? 'var(--ink)' : 'var(--line)'}`,
                  borderRadius: '4px',
                  height: '110px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#ffffff', cursor: 'pointer',
                }}
              >
                <Image
                  src={m.logo}
                  alt={m.nombre}
                  width={150}
                  height={48}
                  style={{ maxWidth: '150px', maxHeight: '48px', objectFit: 'contain', width: 'auto', height: 'auto' }}
                  unoptimized
                />
              </button>
            )
          })}
        </div>

        {/* Filtros — chips dropdown estilo Trolley */}
        <div className="cat-filters cat-anim" style={{ animationDelay: '120ms' }}>
          {/* Ordenar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              style={chipStyle(orden !== 'relevancia')}
              onClick={(e) => { e.stopPropagation(); setDropdownAbierto(dropdownAbierto === 'orden' ? null : 'orden') }}
            >
              {orden === 'relevancia' ? 'Ordenar' : ORDEN_LABELS[orden]}
              <ChevronDown size={13} strokeWidth={2.5} />
            </button>
            {dropdownAbierto === 'orden' && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30,
                background: '#ffffff', border: '1px solid var(--line)', borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px', minWidth: '170px',
              }}>
                {(Object.keys(ORDEN_LABELS) as Orden[]).map(o => (
                  <button
                    key={o}
                    onClick={(e) => { e.stopPropagation(); setOrden(o); setDropdownAbierto(null) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '9px 12px', borderRadius: '8px',
                      fontSize: '13.5px', fontWeight: orden === o ? 600 : 400,
                      background: orden === o ? 'var(--plate)' : 'transparent',
                      color: 'var(--ink)', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {ORDEN_LABELS[o]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sector activo (con X para quitar) */}
          {sectorSel && (
            <button style={chipStyle(true)} onClick={handleQuitarSector}>
              {subcategoriaInicial || sectorSel}
              <X size={13} strokeWidth={2.5} />
            </button>
          )}

          {/* Mayorista */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              style={chipStyle(!!mayoristaSel)}
              onClick={(e) => { e.stopPropagation(); setDropdownAbierto(dropdownAbierto === 'mayorista' ? null : 'mayorista') }}
            >
              {mayoristaSel || 'Mayorista'}
              {mayoristaSel
                ? <X size={13} strokeWidth={2.5} onClick={(e) => { e.stopPropagation(); setMayoristaSel(''); setDropdownAbierto(null) }} />
                : <ChevronDown size={13} strokeWidth={2.5} />}
            </button>
            {dropdownAbierto === 'mayorista' && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 30,
                background: '#ffffff', border: '1px solid var(--line)', borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px', minWidth: '170px',
              }}>
                {MAYORISTAS_FILTER.map(m => (
                  <button
                    key={m.nombre}
                    onClick={(e) => { e.stopPropagation(); setMayoristaSel(mayoristaSel === m.nombre ? '' : m.nombre); setDropdownAbierto(null) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '9px 12px', borderRadius: '8px',
                      fontSize: '13.5px', fontWeight: mayoristaSel === m.nombre ? 600 : 400,
                      background: mayoristaSel === m.nombre ? 'var(--plate)' : 'transparent',
                      color: 'var(--ink)', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {m.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Solo comparables */}
          <button style={chipStyle(soloComparables)} onClick={() => setSoloComparables(v => !v)}>
            Solo comparables
          </button>
        </div>

        {/* Meta línea */}
        <div className="cat-meta cat-anim" style={{ animationDelay: '180ms' }}>
          <h2>{tituloActivo}</h2>
          <span className="tnum" style={{ fontSize: '12px', color: 'var(--gray)', fontWeight: 400 }}>
            {soloComparables
              ? `${fmt.format(productosFiltrados.length)} comparables`
              : `${fmt.format(productosFiltrados.length)} productos`}
          </span>
        </div>

        {/* Grid de celdas */}
        {productosVisibles.length > 0 ? (
          <>
            <div className="cat-grid cat-anim" style={{ animationDelay: '220ms' }} key={filterKey}>
              {productosVisibles.map(producto => (
                <CatalogoCell
                  key={producto.id}
                  producto={producto}
                  onClick={() => onVerProducto(producto)}
                  enLista={listaIds.has(producto.id)}
                  onAgregar={onAgregarALista ? () => onAgregarALista(producto) : undefined}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '32px', paddingBottom: '16px' }}>
                <button
                  onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
                  disabled={paginaActual === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '9px 16px', borderRadius: '999px', fontSize: '13.5px', fontWeight: 500,
                    border: '1px solid var(--line)',
                    background: '#ffffff',
                    color: paginaActual === 0 ? 'var(--line)' : 'var(--ink)',
                    cursor: paginaActual === 0 ? 'default' : 'pointer',
                  }}
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <span className="tnum" style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: 400 }}>
                  {paginaActual + 1} / {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))}
                  disabled={paginaActual === totalPaginas - 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '9px 16px', borderRadius: '999px', fontSize: '13.5px', fontWeight: 500,
                    border: '1px solid var(--line)',
                    background: '#ffffff',
                    color: paginaActual === totalPaginas - 1 ? 'var(--line)' : 'var(--ink)',
                    cursor: paginaActual === totalPaginas - 1 ? 'default' : 'pointer',
                  }}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              Nada por acá
            </div>
            <div style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '20px' }}>
              Probá con otro filtro o búsqueda
            </div>
            <button
              onClick={() => { setBusqueda(''); setMayoristaSel(''); handleQuitarSector(); setSoloComparables(false) }}
              style={{
                padding: '11px 22px', borderRadius: '999px',
                background: 'var(--pill)', color: '#ffffff',
                border: 'none', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Celda de producto — sin logos de mayoristas: solo mejor precio + ahorro ──
interface CatalogoCellProps {
  producto: Producto
  onClick: () => void
  enLista?: boolean
  onAgregar?: () => void
}

function CatalogoCell({ producto, onClick, enLista, onAgregar }: CatalogoCellProps) {
  const plusRef = useRef<HTMLButtonElement>(null)
  const preciosValidos = producto.precios
    .filter(p => p.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  const [imgSrc, setImgSrc] = useState(producto.imageUrl || '')
  const [fallbackIdx, setFallbackIdx] = useState(0)

  useEffect(() => {
    setImgSrc(producto.imageUrl || '')
    setFallbackIdx(0)
  }, [producto.id, producto.imageUrl])

  const handleImageError = () => {
    const fallbacks = producto.imagenFallbacks || []
    if (fallbackIdx < fallbacks.length) {
      setImgSrc(fallbacks[fallbackIdx])
      setFallbackIdx(prev => prev + 1)
    } else {
      setImgSrc('')
    }
  }

  if (preciosValidos.length === 0) return null

  const mejorPrecio = preciosValidos[0].precio
  const pct = ahorroPct(producto)
  const tamano = extraerTamano(producto.nombre)

  const handleAgregar = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (enLista || !onAgregar) return
    if (plusRef.current) clickSpark(plusRef.current)
    onAgregar()
  }

  return (
    <div className="cat-cell" onClick={onClick}>
      {/* Botón + (agregar a lista) con ClickSpark dorado */}
      {onAgregar && (
        <button
          ref={plusRef}
          onClick={handleAgregar}
          aria-label={enLista ? 'Ya en tu lista' : 'Agregar a lista'}
          style={{
            position: 'absolute', top: '14px', right: '12px', zIndex: 2,
            width: '30px', height: '30px', borderRadius: '999px',
            border: `1.5px solid ${enLista ? 'var(--green)' : 'var(--ink)'}`,
            background: enLista ? 'var(--green)' : '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: enLista ? 'default' : 'pointer',
            color: enLista ? '#ffffff' : 'var(--ink)',
          }}
        >
          {enLista ? <Check size={14} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
        </button>
      )}

      {/* Placa de imagen */}
      <div className="cat-ph">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={producto.nombre}
            width={124}
            height={124}
            className="img-plate"
            style={{ maxHeight: '124px', maxWidth: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
            unoptimized
            onError={handleImageError}
          />
        ) : (
          <span style={{ color: 'var(--line)', fontSize: '32px' }}>?</span>
        )}
      </div>

      {/* Tamaño */}
      {tamano && (
        <span className="tnum" style={{
          display: 'inline-block',
          background: 'var(--pill)', color: '#ffffff',
          fontSize: '10.7px', fontWeight: 600,
          borderRadius: '999px', padding: '3px 10px',
          marginBottom: '7px',
        }}>
          {tamano}
        </span>
      )}

      {/* Nombre */}
      <div className="line-clamp-2" style={{
        fontSize: '13.9px', fontWeight: 400, lineHeight: 1.35,
        minHeight: '38px', color: 'var(--ink)',
      }}>
        {producto.nombre}
      </div>

      {/* Mejor precio */}
      <div className="tnum" style={{ fontSize: '20px', fontWeight: 600, marginTop: '8px', color: 'var(--ink)' }}>
        {formatearPrecio(mejorPrecio)}
      </div>

      {/* Comparativa */}
      <div className="tnum" style={{ fontSize: '11.8px', marginTop: '2px', color: 'var(--gray)', fontWeight: 400 }}>
        {pct > 0
          ? <><b style={{ color: 'var(--green)', fontWeight: 600 }}>Ahorrás {pct}%</b> · {preciosValidos.length} precios</>
          : preciosValidos.length === 1 ? '1 precio' : `${preciosValidos.length} precios`}
      </div>
    </div>
  )
}
