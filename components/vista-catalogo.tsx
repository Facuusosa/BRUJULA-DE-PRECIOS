'use client'

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, X, Heart, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { productos, sectores, Producto, formatearPrecio, extraerTamano, calcularPrecioPorUnidad } from '@/lib/data'
import { AnimatedList } from '@/components/AnimatedList'
import SpotlightCard from '@/components/reactbits/Components/SpotlightCard/SpotlightCard'
import { iconTap, chipHover } from '@/lib/motion-variants'

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
    <div style={{ background: '#0a0a0a', minHeight: '100%', paddingBottom: '60px' }}>
      <style>{`
        .catalogo-main { padding: 24px 20px; }
        .deals-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #2a2a2a;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
          overflow: hidden;
        }
        .deal-card {
          cursor: pointer;
          border-radius: 0 !important;
          border: none !important;
          background: #141414 !important;
          overflow: hidden;
        }
        .mayoristas-logos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
        .pill-sector { padding: 9px 16px; border-radius: 20px; white-space: nowrap; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 40px; border: 1.5px solid transparent; }
        .pill-subcat { padding: 8px 14px; border-radius: 20px; white-space: nowrap; font-size: 13px; font-weight: 600; cursor: pointer; min-height: 40px; border: 1.5px solid transparent; }
        .pills-wrapper { position: relative; }
        .pills-row { display: flex; flex-wrap: wrap; gap: 10px; padding-bottom: 4px; }

        @media (max-width: 700px) {
          .pill-sector { min-height: 36px; font-size: 12px; padding: 7px 13px; }
          .pill-subcat { min-height: 36px; font-size: 12px; padding: 6px 12px; }
        }
        @media (max-width: 860px) {
          .deals-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .deals-grid { grid-template-columns: repeat(2, 1fr); }
          .catalogo-main { padding: 16px 12px; }
          .mayoristas-logos { gap: 8px; }
        }
      `}</style>

      <div className="catalogo-main">

        {/* Buscador */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: '#141414', borderRadius: '12px',
          padding: '12px 14px', marginBottom: '20px',
          minHeight: '48px', border: '1px solid #2a2a2a',
        }}>
          <Search size={18} color="#6b7280" strokeWidth={2} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar producto..."
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '16px', color: '#f7f7f7', outline: 'none',
            }}
          />
          {busqueda && (
            <motion.button
              onClick={() => setBusqueda('')}
              {...iconTap}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <X size={16} color="#6b7280" strokeWidth={2} />
            </motion.button>
          )}
        </div>

        {/* Filtrar por mayorista */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#6b7280',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px',
          }}>
            FILTRAR POR MAYORISTA
          </div>
          <div className="mayoristas-logos">
            {MAYORISTAS_FILTER.map(m => {
              const isActive = mayoristaSel === m.nombre
              return (
                <motion.button
                  key={m.nombre}
                  onClick={() => setMayoristaSel(isActive ? '' : m.nombre)}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '16px 12px', height: '88px',
                    border: `2px solid ${isActive ? '#d4a574' : '#2a2a2a'}`,
                    borderRadius: '8px',
                    background: isActive ? '#1a1a1a' : '#141414',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '48px' }}>
                    <Image src={m.logo} alt={m.nombre} fill style={{ objectFit: 'contain' }} unoptimized />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Pills de sector */}
        <div className="pills-wrapper" style={{ marginBottom: subcatsDisponibles.length > 0 ? '8px' : '16px' }}>
          <div className="pills-row">
            <motion.button
              onClick={() => { setSectorSel(''); onSectorChange?.('Todos'); onSubcategoriaChange?.('') }}
              {...chipHover}
              className="pill-sector"
              style={{
                border: `1.5px solid ${!sectorSel ? '#d4a574' : '#2a2a2a'}`,
                background: !sectorSel ? '#d4a574' : '#141414',
                color: !sectorSel ? '#0a0a0a' : '#6b7280',
              }}
            >
              Todos
            </motion.button>
            {sectoresDisponibles.map(s => (
              <motion.button
                key={s.nombre}
                onClick={() => handleSector(s.nombre)}
                {...chipHover}
                className="pill-sector"
                style={{
                  border: `1.5px solid ${sectorSel === s.nombre ? '#d4a574' : '#2a2a2a'}`,
                  background: sectorSel === s.nombre ? '#d4a574' : '#141414',
                  color: sectorSel === s.nombre ? '#0a0a0a' : '#6b7280',
                }}
              >
                {s.nombre}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pills de subcategoría */}
        {subcatsDisponibles.length > 0 && (
          <div className="pills-wrapper" style={{ marginBottom: '20px' }}>
            <div className="pills-row">
              <motion.button
                onClick={() => onSubcategoriaChange?.('')}
                {...chipHover}
                className="pill-subcat"
                style={{
                  border: `1.5px solid ${!subcategoriaInicial ? '#d4a574' : '#2a2a2a'}`,
                  background: !subcategoriaInicial ? '#d4a574' : '#141414',
                  color: !subcategoriaInicial ? '#0a0a0a' : '#6b7280',
                }}
              >
                Todas
              </motion.button>
              {subcatsDisponibles.map(sub => (
                <motion.button
                  key={sub}
                  onClick={() => onSubcategoriaChange?.(subcategoriaInicial === sub ? '' : sub)}
                  {...chipHover}
                  className="pill-subcat"
                  style={{
                    border: `1.5px solid ${subcategoriaInicial === sub ? '#d4a574' : '#2a2a2a'}`,
                    background: subcategoriaInicial === sub ? '#d4a574' : '#141414',
                    color: subcategoriaInicial === sub ? '#0a0a0a' : '#6b7280',
                  }}
                >
                  {sub}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Header de resultados */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px', fontWeight: 800,
            textTransform: 'uppercase', color: '#f7f7f7', margin: 0,
          }}>
            {tituloActivo || 'Ofertas del dia'}
          </h2>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            {productosFiltrados.length} productos
          </span>
        </div>

        {/* Grid de deals */}
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
                <motion.button
                  onClick={() => setPaginaActual(p => Math.max(0, p - 1))}
                  disabled={paginaActual === 0}
                  whileTap={paginaActual === 0 ? {} : { scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    border: '1.5px solid #2a2a2a',
                    background: paginaActual === 0 ? '#0a0a0a' : '#141414',
                    color: paginaActual === 0 ? '#2a2a2a' : '#f7f7f7',
                    cursor: paginaActual === 0 ? 'default' : 'pointer',
                  }}
                >
                  <ChevronLeft size={14} /> Anterior
                </motion.button>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
                  Pag {paginaActual + 1} / {totalPaginas}
                </span>
                <motion.button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))}
                  disabled={paginaActual === totalPaginas - 1}
                  whileTap={paginaActual === totalPaginas - 1 ? {} : { scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    border: '1.5px solid #2a2a2a',
                    background: paginaActual === totalPaginas - 1 ? '#0a0a0a' : '#141414',
                    color: paginaActual === totalPaginas - 1 ? '#2a2a2a' : '#f7f7f7',
                    cursor: paginaActual === totalPaginas - 1 ? 'default' : 'pointer',
                  }}
                >
                  Siguiente <ChevronRight size={14} />
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Search size={48} color="#2a2a2a" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f7f7f7', marginBottom: '8px' }}>
              Nada por acá
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
              Probá con otro filtro o búsqueda
            </div>
            <button
              onClick={() => { setBusqueda(''); setMayoristaSel(''); setSectorSel('') }}
              style={{
                padding: '10px 20px', borderRadius: '20px',
                background: '#d4a574', color: '#0a0a0a',
                border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
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

// ── Card de producto ──────────────────────────────────────
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

function DealCard({ producto, mayoristaSel, onClick, isFavorito, onToggleFavorito, enLista, onAgregar }: DealCardProps) {
  const preciosValidos = producto.precios
    .filter(p => p.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  const [imgSrc, setImgSrc] = useState(producto.imageUrl || '')
  const fallbackIdx = useState(0)

  useEffect(() => {
    setImgSrc(producto.imageUrl || '')
    fallbackIdx[1](0)
  }, [producto.id, producto.imageUrl])

  const handleImageError = () => {
    const fallbacks = producto.imagenFallbacks || []
    const idx = fallbackIdx[0]
    if (idx < fallbacks.length) {
      setImgSrc(fallbacks[idx])
      fallbackIdx[1](idx + 1)
    } else {
      setImgSrc('')
    }
  }

  if (preciosValidos.length === 0) return null

  const precioMin = preciosValidos[0].precio
  const mejorMayorista = preciosValidos[0].mayorista

  const tamano = extraerTamano(producto.nombre)
  const precioPorUnidad = tamano && precioMin ? calcularPrecioPorUnidad(precioMin, tamano) : null

  return (
    <SpotlightCard
      className="deal-card"
      spotlightColor="rgba(212, 165, 116, 0.08)"
      onClick={onClick}
    >
      {/* Imagen */}
      <div style={{ height: '140px', background: '#1a1a1a', position: 'relative' }}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={producto.nombre}
            fill
            style={{ objectFit: 'contain', padding: '12px' }}
            unoptimized
            onError={handleImageError}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '32px' }}>?</div>
        )}

        {/* Botón agregar a lista */}
        {onAgregar && (
          <motion.button
            onClick={(e) => { e.stopPropagation(); if (!enLista) onAgregar() }}
            {...iconTap}
            title={enLista ? 'Ya en tu lista' : 'Agregar a lista'}
            style={{
              position: 'absolute', top: '4px', left: '4px', zIndex: 3,
              width: '32px', height: '32px', borderRadius: '50%',
              border: `1.5px solid ${enLista ? '#16a34a' : '#2a2a2a'}`,
              background: enLista ? '#16a34a' : '#141414',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: enLista ? 'default' : 'pointer',
            }}
          >
            {enLista
              ? <Check size={13} strokeWidth={2.5} color="#fff" />
              : <Plus size={13} strokeWidth={2.5} color="#f7f7f7" />
            }
          </motion.button>
        )}

        {/* Botón favorito */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onToggleFavorito?.(e); }}
          {...iconTap}
          style={{
            position: 'absolute', top: '4px', right: '4px', zIndex: 3,
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid #2a2a2a', background: '#141414',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Heart
            size={13}
            strokeWidth={2}
            fill={isFavorito ? '#d4a574' : 'none'}
            color={isFavorito ? '#d4a574' : '#6b7280'}
          />
        </motion.button>

        {/* Badge cantidad mayoristas */}
        {preciosValidos.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '6px', right: '6px',
            background: '#d4a574', color: '#0a0a0a',
            fontSize: '11px', fontWeight: 800,
            padding: '3px 8px', borderRadius: '10px',
            letterSpacing: '0.03em',
          }}>
            {preciosValidos.length} precios
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px 12px 14px' }}>
        {/* Nombre */}
        <div style={{
          fontSize: '14px', fontWeight: 600, color: '#f7f7f7',
          lineHeight: 1.4, marginBottom: '8px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: '40px',
        }}>
          {producto.nombre}
        </div>

        {/* Tabla de precios */}
        <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {MAYORISTAS_ORDER.map(nombreM => {
            const entrada = preciosValidos.find(p => p.mayorista === nombreM)
            const esMejor = nombreM === mejorMayorista
            return (
              <div key={nombreM} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <div style={{ position: 'relative', width: '48px', height: '20px', flexShrink: 0, opacity: entrada ? 1 : 0.25 }}>
                  <Image src={LOGOS[nombreM]} alt={nombreM} fill style={{ objectFit: 'contain' }} unoptimized />
                </div>
                <span style={{
                  fontSize: esMejor ? '16px' : '13px',
                  fontFamily: esMejor ? 'var(--font-display)' : 'var(--font-sans)',
                  fontWeight: esMejor ? 800 : 400,
                  color: entrada ? (esMejor ? '#d4a574' : '#6b7280') : '#2a2a2a',
                  letterSpacing: '-0.01em',
                }}>
                  {entrada ? formatearPrecio(entrada.precio) : '—'}
                </span>
              </div>
            )
          })}
        </div>

        {precioPorUnidad && (
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
            {precioPorUnidad}
          </div>
        )}
      </div>
    </SpotlightCard>
  )
}
