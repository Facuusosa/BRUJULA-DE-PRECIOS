'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { calcularBombas, productos, sectores, Producto, ProductoBomba } from '@/lib/data'
import { BombaDeal } from '@/components/bomba-list-item'
import { LogoLoop } from '@/components/LogoLoop'

interface VistaInicioProps {
  onIrACompararConSector: (sector: string) => void
  onIrAlCatalogoConMayorista: (mayorista: string) => void
  onIrAlCatalogo: () => void
  onVerProducto: (producto: Producto) => void
  favoritos: Set<string>
  onToggleFavorito: (id: string) => void
  onGuardar?: (producto: Producto) => void
}

const MAYORISTAS = [
  { src: '/mayoristas/maxicarrefour.jpg', alt: 'MaxiCarrefour', url: 'https://comerciante.carrefour.com.ar/' },
  { src: '/mayoristas/yaguar.png',        alt: 'Yaguar',        url: 'https://www.yaguar.com.ar' },
  { src: '/mayoristas/maxiconsumo.webp',  alt: 'Maxiconsumo',   url: 'https://www.maxiconsumo.com' },
]

const SECTOR_IMAGES: Record<string, string> = {
  'Almacén':          '/categories/almacen.png',
  'Bebidas':          '/categories/bebidas_real.png',
  'Limpieza':         '/categories/limpieza_real.png',
  'Frescos':          '/categories/frescos.png',
  'Cuidado Personal': '/categories/perfumeria_real.png',
  'Mascotas':         '/categories/mascotas.png',
}

const TOP_TOTAL = 20
const VISIBLES_INICIAL = 6
const VISIBLES_PASO = 6

const fmt = new Intl.NumberFormat('es-AR')

/* Top 20 del día: primero clase A con 3 precios (los productos que el comerciante
   repone siempre), después clase A con 2, después el resto — siempre por mayor ahorro */
function rankearTop(bombas: ProductoBomba[]): ProductoBomba[] {
  const score = (b: ProductoBomba) => {
    const numPrecios = b.precios.filter(p => p.precio > 0).length
    return (b.abc === 'A' ? 2 : 0) + (numPrecios >= 3 ? 1 : 0)
  }
  return [...bombas]
    .sort((a, b) => {
      const sa = score(a)
      const sb = score(b)
      if (sa !== sb) return sb - sa
      return b.ahorroEnPlata - a.ahorroEnPlata
    })
    .slice(0, TOP_TOTAL)
}

export function VistaInicio({
  onVerProducto,
  onIrACompararConSector,
  onIrAlCatalogo,
  onGuardar,
}: VistaInicioProps) {
  const top = useMemo(() => rankearTop(calcularBombas()), [])
  const [visibles, setVisibles] = useState(VISIBLES_INICIAL)
  const deals = top.slice(0, visibles)
  const hayMas = visibles < top.length

  return (
    <div className="inicio" style={{ background: '#ffffff', minHeight: '100%' }}>
      <style>{`
        /* Entrada: stagger 60ms, translateY corto + fade, <400ms, ease-out fuerte (emil) */
        @keyframes inicio-rise { to { opacity: 1; transform: translateY(0); } }
        .inicio-anim { opacity: 0; transform: translateY(10px); animation: inicio-rise 380ms var(--ease-out) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .inicio-anim { transform: none; animation-duration: 150ms; }
        }
        .inicio-wrap { max-width: 720px; margin: 0 auto; }
        .inicio-cta { padding: 28px 20px 0; }
        @media (min-width: 1000px) {
          /* Ancho del bloque de deals de Trolley: ~1062px + padding */
          .inicio-wrap { max-width: 1100px; padding: 0 20px; }
          .inicio-cta { max-width: 480px; }
        }
        @media (hover: hover) and (pointer: fine) {
          .cat-card .cat-img { transition: transform 450ms var(--ease-out); }
          .cat-card:hover .cat-img { transform: scale(1.06); }
        }
      `}</style>

      <div className="inicio-wrap">

        {/* Título de sección */}
        <h2 className="inicio-anim" style={{
          fontSize: 'var(--fs-section)', fontWeight: 600, letterSpacing: '-0.3px',
          padding: '10px 20px 0', margin: 0, color: 'var(--ink)',
        }}>
          Bombas de hoy
        </h2>

        {/* Mayoristas — LogoLoop infinito (efecto aprobado, en todas las resoluciones) */}
        <div className="inicio-anim" style={{ animationDelay: '60ms' }}>
          <LogoLoop items={MAYORISTAS} />
        </div>

        {/* Top 20 — deals completos estilo Trolley */}
        {deals.map((bomba, idx) => (
          <div key={bomba.id} className={idx < VISIBLES_INICIAL ? 'inicio-anim' : undefined} style={idx < VISIBLES_INICIAL ? { animationDelay: `${120 + idx * 60}ms` } : undefined}>
            <BombaDeal
              bomba={bomba}
              rank={idx + 1}
              onVerProducto={() => onVerProducto(bomba)}
              onGuardar={() => onGuardar?.(bomba)}
            />
          </div>
        ))}

        {top.length === 0 && (
          <div style={{ padding: '64px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              Actualizando precios
            </div>
            <div style={{ fontSize: '14px', color: 'var(--gray)' }}>
              Los datos se cargan en los próximos minutos
            </div>
          </div>
        )}

        {/* Ver más / Ver catálogo completo */}
        {top.length > 0 && (
          <div className="inicio-cta">
            <button
              onClick={() => hayMas ? setVisibles(v => Math.min(v + VISIBLES_PASO, top.length)) : onIrAlCatalogo()}
              style={{
                width: '100%',
                background: hayMas ? '#ffffff' : 'var(--pill)',
                color: hayMas ? 'var(--ink)' : '#ffffff',
                border: hayMas ? '1.5px solid var(--ink)' : 'none',
                borderRadius: '999px',
                fontFamily: 'var(--font-sans)',
                fontSize: '15px', fontWeight: 500,
                padding: '15px 0', cursor: 'pointer',
              }}
            >
              {hayMas ? `Ver más bombas (${top.length - visibles} restantes)` : 'Ver catálogo completo'}
            </button>
          </div>
        )}

        {/* Categorías — foto con overlay */}
        <div className="inicio-anim" style={{ animationDelay: '300ms', padding: '40px 0 44px' }}>
          <h2 style={{
            fontSize: 'var(--fs-section)', fontWeight: 600, letterSpacing: '-0.3px',
            padding: '0 20px', margin: 0, color: 'var(--ink)',
          }}>
            Explorá por categoría
          </h2>
          <div className="scrollbar-hide" style={{ display: 'flex', gap: '12px', padding: '16px 20px 0', overflowX: 'auto' }}>
            {sectores.map(sector => {
              const img = SECTOR_IMAGES[sector.nombre]
              const count = productos.filter(p => p.sector === sector.nombre).length
              return (
                <button
                  key={sector.nombre}
                  className="cat-card"
                  onClick={() => onIrACompararConSector(sector.nombre)}
                  style={{
                    position: 'relative', flexShrink: 0,
                    width: '132px', height: '168px',
                    borderRadius: '10px', overflow: 'hidden',
                    border: 'none', cursor: 'pointer', padding: 0,
                    background: 'var(--plate)',
                  }}
                >
                  {img ? (
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="132px"
                      className="cat-img"
                      style={{ objectFit: 'cover', filter: 'contrast(1.05) saturate(0.9)' }}
                      unoptimized
                    />
                  ) : (
                    <span style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '32px',
                    }}>
                      {sector.emoji}
                    </span>
                  )}
                  <span style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 48%, rgba(10,10,10,0) 100%)',
                  }} />
                  {/* Columna flex: el nombre a 2 líneas empuja el count hacia arriba sin pisarlo */}
                  <span style={{
                    position: 'absolute', bottom: '11px', left: '13px', right: '13px', zIndex: 1,
                    display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left',
                  }}>
                    <span className="tnum" style={{ fontSize: '10.5px', fontWeight: 400, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
                      {fmt.format(count)} productos
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
                      {sector.nombre}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
