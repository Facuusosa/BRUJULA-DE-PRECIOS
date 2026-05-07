'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { Search, X, Heart, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { productos, sectores, Producto, formatearPrecio, extraerTamano, calcularPrecioPorUnidad } from '@/lib/data'
import { AnimatedList } from '@/components/AnimatedList'
import SpotlightCard from '@/components/reactbits/Components/SpotlightCard/SpotlightCard'

const ITEMS_POR_PAGINA = 24

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
  { nombre: 'Maxiconsumo',   logo: '/mayoristas/maxiconsumo.webp' },
  { nombre: 'Yaguar',        logo: '/mayoristas/yaguar.png' },
  { nombre: 'MaxiCarrefour', logo: '/mayoristas/maxicarrefour.jpg' },
]

function normalizar(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function VistaCatalogo({
  sectorActivo: sectorInicial = 'Todos',
  mayoristaBuscado: mayoristaBuscadoInicial = '',
  textoBusquedaInicial = '',
  subcategoriaActiva: subcategoriaInicial = '',
  onVerProducto,
  favoritos,
  onToggleFavorito,
  onSectorChange,
  onSubcategoriaChange,
  onAgregarALista,
  listaIds = new Set(),
}: VistaCatalogoProps) {
  const [busqueda, setBusqueda] = useState(textoBusquedaInicial)
  const [mayoristaSel, setMayoristaSel] = useState(mayoristaBuscadoInicial || '')
  const [sectorSel, setSectorSel] = useState(sectorInicial !== 'Todos' ? sectorInicial : '')
  const [paginaActual, setPaginaActual] = useState(0)

  const handleSector = (s: string) => {
    const nuevo = sectorSel === s ? '' : s
    setSectorSel(nuevo)
    onSectorChange?.(nuevo || 'Todos')
    onSubcategoriaChange?.('')
  }

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
    if (busqueda.trim()) {
      const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean)
      lista = lista.filter(p => {
        const texto = `${normalizar(p.nombre)} ${normalizar(p.subcategoria)} ${normalizar(p.sector)}`
        return palabras.every(w => texto.includes(w))
      })
    }

    return lista.sort((a, b) => {
      const abcOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
      const aAbc = abcOrder[a.abc ?? 'D'] ?? 3
      const bAbc = abcOrder[b.abc ?? 'D'] ?? 3
      if (aAbc !== bAbc) return aAbc - bAbc
      const aPrecios = a.precios.filter(p => p.precio > 0).length
      const bPrecios = b.precios.filter(p => p.precio > 0).length
      return bPrecios - aPrecios
    })
  }, [busqueda, mayoristaSel, sectorSel, subcategoriaInicial])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA)
  const productosVisibles = productosFiltrados.slice(
    paginaActual * ITEMS_POR_PAGINA,
    (paginaActual + 1) * ITEMS_POR_PAGINA
  )

  const filterKey = `${mayoristaSel}-${sectorSel}-${subcategoriaInicial}-${busqueda}`

  useEffect(() => {
    setPaginaActual(0)
  }, [filterKey])

  const sectoresDisponibles = useMemo(() =>
    sectores.filter(s => productos.some(p => p.sector === s.nombre && p.precios.some(pr => pr.precio > 0))),
    []
  )

  const subcatsDisponibles = useMemo(() => {
    if (!sectorSel) return []
    const sectorData = sectores.find(s => s.nombre === sectorSel)
    return sectorData?.subcategorias ?? []
  }, [sectorSel])

  const tituloActivo = subcategoriaInicial || sectorSel || mayoristaSel || ''

  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: '60px' }}>
      <style>{`
        .catalogo-main { padding: 24px 20px; }
        .deals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .deal-card {
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
          border-radius: 12px !important;
          border: 1px solid #ebebeb;
          background: #fff;
          overflow: hidden;
        }
        .deal-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.10) !important;
          transform: translateY(-3px);
        }
        .mayoristas-logos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
        .pill-sector { padding: 9px 16px; border-radius: 20px; white-space: nowrap; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 40px; border: 1.5px solid transparent; }
        .pill-subcat { padding: 8px 14px; border-radius: 20px; white-space: nowrap; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 40px; border: 1.5px solid transparent; }

        /* Pills — wrapper con gradiente de fade-out a la derecha */
        .pills-wrapper { position: relative; }
        .pills-wrapper::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 52px;
          background: linear-gradient(to left, #ffffff 0%, transparent 100%);
          pointer-events: none;
          z-index: 1;
        }
        .pills-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          padding-right: 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .pills-row::-webkit-scrollbar { display: none; }

        /* En mobile: wrap en lugar de scroll — todas visibles */
        @media (max-width: 700px) {
          .pills-row { flex-wrap: wrap; overflow-x: visible; padding-right: 0; }
          .pills-wrapper::after { display: none; }
          .pill-sector { min-height: 36px; font-size: 12px; padding: 7px 13px; }
          .pill-subcat { min-height: 36px; font-size: 12px; padding: 6px 12px; }
        }

        @media (max-width: 860px) {
          .deals-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
        @media (max-width: 600px) {
          .catalogo-main { padding: 16px 12px; }
          .deals-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .mayoristas-logos { gap: 8px; }
        }
      `}</style>

      <div className="catalogo-main">

        {/* Buscador */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#f5f5f5', borderRadius: '12px',
          padding: '12px 14px', marginBottom: '20px',
          minHeight: '48px',
        }}>
          <Search size={18} color="#888" strokeWidth={2} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '16px', color: '#0a0a0a', outline: 'none',
            }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
              <X size={16} color="#888" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Filtrar por mayorista */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#555',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px',
          }}>
            FILTRAR POR MAYORISTA
          </div>
          <div className="mayoristas-logos">
            {MAYORISTAS_FILTER.map(m => {
              const isActive = mayoristaSel === m.nombre
              return (
                <button
                  key={m.nombre}
                  onClick={() => setMayoristaSel(isActive ? '' : m.nombre)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px 12px', height: '88px',
                    border: `2px solid ${isActive ? '#0a0a0a' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: isActive ? '#f7f7f7' : '#fff',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 0 0 2px #0a0a0a22' : 'none',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '48px' }}>
                    <Image src={m.logo} alt={m.nombre} fill style={{ objectFit: 'contain' }} unoptimized />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Pills de sector */}
        <div className="pills-wrapper" style={{ marginBottom: subcatsDisponibles.length > 0 ? '8px' : '20px' }}>
          <div className="pills-row">
            <button
              onClick={() => { setSectorSel(''); onSectorChange?.('Todos'); onSubcategoriaChange?.('') }}
              className="pill-sector"
              style={{
                border: `1.5px solid ${!sectorSel ? '#0a0a0a' : '#e5e7eb'}`,
                background: !sectorSel ? '#0a0a0a' : '#fff',
                color: !sectorSel ? '#fff' : '#555',
              }}
            >
              Todos
            </button>
            {sectoresDisponibles.map(s => (
              <button
                key={s.nombre}
                onClick={() => handleSector(s.nombre)}
                className="pill-sector"
                style={{
                  border: `1.5px solid ${sectorSel === s.nombre ? '#0a0a0a' : '#e5e7eb'}`,
                  background: sectorSel === s.nombre ? '#0a0a0a' : '#fff',
                  color: sectorSel === s.nombre ? '#fff' : '#555',
                }}
              >
                {s.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Pills de subcategoría */}
        {subcatsDisponibles.length > 0 && (
          <div className="pills-wrapper" style={{ marginBottom: '20px' }}>
            <div className="pills-row" style={{ gap: '6px' }}>
              <button
                onClick={() => onSubcategoriaChange?.('')}
                className="pill-subcat"
                style={{
                  border: `1.5px solid ${!subcategoriaInicial ? '#6366f1' : '#e5e7eb'}`,
                  background: !subcategoriaInicial ? '#6366f1' : '#fff',
                  color: !subcategoriaInicial ? '#fff' : '#777',
                }}
              >
                Todas
              </button>
              {subcatsDisponibles.map(sub => (
                <button
                  key={sub}
                  onClick={() => onSubcategoriaChange?.(subcategoriaInicial === sub ? '' : sub)}
                  className="pill-subcat"
                  style={{
                    border: `1.5px solid ${subcategoriaInicial === sub ? '#6366f1' : '#e5e7eb'}`,
                    background: subcategoriaInicial === sub ? '#6366f1' : '#fff',
                    color: subcategoriaInicial === sub ? '#fff' : '#777',
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Header de resultados */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px', fontWeight: 800,
            textTransform: 'uppercase', color: '#0a0a0a', margin: 0,
          }}>
            {tituloActivo || 'Ofertas del dia'}
          </h2>
          <span style={{ fontSize: '13px', color: '#888' }}>
            {productosFiltrados.length} productos
          </span>
        </div>

        {/* Grid de deals con AnimatedList */}
        {productosVisibles.length > 0 ? (
          <>
            <AnimatedList key={filterKey} className="deals-grid">
              {productosVisibles.map(producto => (
                <DealCard
                  key={producto.id}
                  producto={producto}
                  mayoristaSel={mayoristaSel}
                  onClick={() => onVerProducto(producto)}
                  isFavorito={favoritos.has(producto.id)}
                  onToggleFavorito={(e) => { e.stopPropagation(); onToggleFavorito(producto.id) }}
                  enLista={listaIds.has(producto.id)}
                  onAgregar={onAgregarALista ? () => onAgregarALista(producto) : undefined}
                />
              ))}
            </AnimatedList>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '32px', paddingBottom: '16px' }}>
                <button
                  onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
                  disabled={paginaActual === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    border: '1.5px solid #e5e7eb', background: paginaActual === 0 ? '#f5f5f5' : '#fff',
                    color: paginaActual === 0 ? '#ccc' : '#0a0a0a',
                    cursor: paginaActual === 0 ? 'default' : 'pointer',
                  }}
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
                  Página {paginaActual + 1} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))}
                  disabled={paginaActual === totalPaginas - 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    border: '1.5px solid #e5e7eb', background: paginaActual === totalPaginas - 1 ? '#f5f5f5' : '#fff',
                    color: paginaActual === totalPaginas - 1 ? '#ccc' : '#0a0a0a',
                    cursor: paginaActual === totalPaginas - 1 ? 'default' : 'pointer',
                  }}
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#888' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>¿</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Sin resultados</div>
            <div style={{ fontSize: '13px' }}>Proba con otro filtro o busqueda</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Card de producto estilo Trolley ──────────────────────
interface DealCardProps {
  producto: Producto
  mayoristaSel: string
  onClick: () => void
  isFavorito?: boolean
  onToggleFavorito?: (e: React.MouseEvent) => void
  enLista?: boolean
  onAgregar?: () => void
}

const MAYORISTAS_ORDER = ['Yaguar', 'MaxiCarrefour', 'Maxiconsumo']

const LOGOS: Record<string, string> = {
  'Maxiconsumo':   '/mayoristas/maxiconsumo.webp',
  'Yaguar':        '/mayoristas/yaguar.png',
  'MaxiCarrefour': '/mayoristas/maxicarrefour.jpg',
}

function formatPrecio(p: number) {
  return '$' + p.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function DealCard({ producto, mayoristaSel, onClick, isFavorito, onToggleFavorito, enLista, onAgregar }: DealCardProps) {
  const preciosValidos = producto.precios
    .filter(p => p.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  if (preciosValidos.length === 0) return null

  const precioMin = preciosValidos[0].precio
  const mejorMayorista = preciosValidos[0].mayorista

  const tamano = extraerTamano(producto.nombre)
  const precioPorUnidad = tamano && precioMin ? calcularPrecioPorUnidad(precioMin, tamano) : null

  const precioResaltado = mayoristaSel
    ? preciosValidos.find(p => p.mayorista === mayoristaSel)?.precio ?? precioMin
    : precioMin

  return (
    <SpotlightCard
      className="deal-card"
      spotlightColor="rgba(10, 61, 31, 0.07)"
      onClick={onClick}
    >
      {/* Imagen */}
      <div style={{ height: '200px', background: '#f8f8f8', position: 'relative' }}>
        {producto.imageUrl ? (
          <Image
            src={producto.imageUrl}
            alt={producto.nombre}
            fill
            style={{ objectFit: 'contain', padding: '16px' }}
            unoptimized
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd', fontSize: '36px' }}>?</div>
        )}

        {/* Botón agregar a lista */}
        {onAgregar && (
          <button
            onClick={(e) => { e.stopPropagation(); if (!enLista) onAgregar() }}
            title={enLista ? 'Ya en tu lista' : 'Agregar a lista'}
            style={{
              position: 'absolute', top: '4px', left: '4px', zIndex: 3,
              width: '40px', height: '40px', borderRadius: '50%',
              border: `1.5px solid ${enLista ? '#16a34a' : '#e5e7eb'}`,
              background: enLista ? '#16a34a' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: enLista ? 'default' : 'pointer',
              touchAction: 'manipulation',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              transition: 'all 0.15s',
            }}
          >
            {enLista
              ? <Check size={16} strokeWidth={2.5} color="#fff" />
              : <Plus size={16} strokeWidth={2.5} color="#0a0a0a" />
            }
          </button>
        )}

        {/* Botón favorito */}
        <button
          onClick={onToggleFavorito}
          style={{
            position: 'absolute', top: '6px', right: '6px', zIndex: 3,
            width: '36px', height: '36px', borderRadius: '50%',
            border: '1.5px solid #e5e7eb', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Heart
            size={15}
            strokeWidth={2}
            fill={isFavorito ? '#0a0a0a' : 'none'}
            color={isFavorito ? '#0a0a0a' : '#9ca3af'}
          />
        </button>

        {/* Badge cantidad mayoristas */}
        {preciosValidos.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: '#0a0a0a', color: '#fff',
            fontSize: '10px', fontWeight: 700,
            padding: '2px 7px', borderRadius: '10px',
          }}>
            {preciosValidos.length} tiendas
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px' }}>
        {/* Nombre */}
        <div style={{
          fontSize: '14px', fontWeight: 600, color: '#0a0a0a',
          lineHeight: 1.4, marginBottom: '10px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: '39px',
        }}>
          {producto.nombre}
        </div>

        {/* Tabla de precios por mayorista — estilo Trolley */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {MAYORISTAS_ORDER.map(nombreM => {
            const entrada = preciosValidos.find(p => p.mayorista === nombreM)
            const esMejor = nombreM === mejorMayorista
            const esSeleccionado = mayoristaSel ? nombreM === mayoristaSel : esMejor
            return (
              <div key={nombreM} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                {/* Logo mayorista */}
                <div style={{
                  position: 'relative', width: '52px', height: '22px',
                  flexShrink: 0, opacity: entrada ? 1 : 0.3,
                }}>
                  <Image src={LOGOS[nombreM]} alt={nombreM} fill style={{ objectFit: 'contain' }} unoptimized />
                </div>
                {/* Precio */}
                <span style={{
                  fontSize: '15px',
                  fontWeight: esMejor ? 800 : 500,
                  color: entrada ? (esMejor ? '#16a34a' : '#9ca3af') : '#d1d5db',
                  letterSpacing: '-0.01em',
                }}>
                  {entrada ? formatPrecio(entrada.precio) : '—'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Precio por unidad */}
        {precioPorUnidad && (
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
            {precioPorUnidad}
          </div>
        )}
      </div>
    </SpotlightCard>
  )
}
