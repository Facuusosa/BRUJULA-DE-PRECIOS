'use client'

import { useEffect, useMemo, useState } from 'react'
import { calcularBombas, esBombaFijada, productos, sectores, Producto, ProductoBomba, FUENTES, diasDesdeScrapingDe } from '@/lib/data'
import { BombaDeal } from '@/components/bomba-list-item'
import { LogoLoop } from '@/components/LogoLoop'
import { HScroll } from '@/components/h-scroll'
import { CategoriaCard } from '@/components/categoria-card'
import { CATEGORIA_FOTOS } from '@/lib/categoria-fotos'

interface VistaInicioProps {
  onIrACompararConSector: (sector: string) => void
  onIrAlCatalogoConMayorista: (mayorista: string) => void
  onIrAlCatalogo: () => void
  onVerProducto: (producto: Producto) => void
  favoritos: Set<string>
  onToggleFavorito: (id: string) => void
  onGuardar?: (producto: Producto) => void
}

const MAYORISTAS = FUENTES.map(f => ({ src: f.logo, alt: f.nombre, url: f.url }))

const TOP_TOTAL = 20
const VISIBLES_INICIAL = 6
const VISIBLES_PASO = 6

/* Categorías con menos productos que esto no se muestran: un recuadro
   con "3 productos" vende pobreza, no catálogo */
const MIN_PRODUCTOS_CATEGORIA = 10

const fmt = new Intl.NumberFormat('es-AR')

function mezclar<T>(items: T[]): T[] {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/* Top 20 de cada entrada a Inicio: el fijado (Fernet) siempre primero, el resto
   rotado al azar dentro del pool ya curado por calcularBombas (ABC=A, mayor
   ahorro) — así se ve variedad real sin bajar la calidad de lo destacado. Se
   recalcula solo al montar VistaInicio (useMemo en el componente), o sea que
   cambia cada vez que Facu vuelve a la pestaña Inicio, no en cada render. */
function rankearTop(bombas: ProductoBomba[]): ProductoBomba[] {
  const fijadas = bombas.filter(b => esBombaFijada(b.id))
  const resto = bombas.filter(b => !esBombaFijada(b.id))
  const necesarios = TOP_TOTAL - fijadas.length
  return [...fijadas, ...mezclar(resto).slice(0, necesarios)]
}

export function VistaInicio({
  onVerProducto,
  onIrACompararConSector,
  onIrAlCatalogo,
  onGuardar,
}: VistaInicioProps) {
  const bombas = useMemo(() => calcularBombas(), [])
  // Valor inicial SIN random (mismo orden en servidor y en cliente, evita error de
  // hidratación) — el shuffle real se aplica recién en el navegador, después de montar.
  const [top, setTop] = useState<ProductoBomba[]>(() => bombas.slice(0, TOP_TOTAL))
  useEffect(() => {
    setTop(rankearTop(bombas))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const categorias = useMemo(() => (
    sectores
      .map(sector => {
        const count = productos.filter(p => p.sector === sector.nombre).length
        // mejor ahorro real del sector, mismo criterio que las bombas (cap 60%, sin sospechosos)
        const pct = bombas
          .filter(b => b.sector === sector.nombre)
          .reduce((m, b) => Math.max(m, b.ahorroVsMaximo), 0)
        return { sector, count, pct, fotos: CATEGORIA_FOTOS[sector.nombre] ?? [] }
      })
      .filter(c => c.count >= MIN_PRODUCTOS_CATEGORIA && c.fotos.length > 0)
  ), [bombas])
  const [visibles, setVisibles] = useState(VISIBLES_INICIAL)
  const deals = top.slice(0, visibles)
  const hayMas = visibles < top.length

  // Título honesto: "de hoy" solo si TODOS los precios mayoristas mostrados son
  // de hoy. Si alguno es más viejo (ej. un scraper que falló), el título lo dice —
  // antes decía "Bombas de hoy" siempre, aunque Perfil mostrara fuentes atrasadas.
  const tituloSeccion = useMemo(() => {
    let peor = 0
    for (const b of deals) {
      for (const p of b.precios) {
        if (p.tipoFuente !== 'mayorista' || p.precio <= 0) continue
        const dias = diasDesdeScrapingDe(p)
        if (dias !== null && dias > peor) peor = dias
      }
    }
    if (peor === 0) return 'Bombas de hoy'
    if (peor === 1) return 'Bombas de ayer'
    return `Bombas actualizadas hace ${peor} días`
  }, [deals])

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
          .catcard .catcard-fotos { transition: transform 450ms var(--ease-out); }
          .catcard:hover .catcard-fotos { transform: scale(1.05); }
        }
      `}</style>

      <div className="inicio-wrap">

        {/* Título de sección */}
        <h2 className="inicio-anim" style={{
          fontSize: 'var(--fs-section)', fontWeight: 600, letterSpacing: '-0.3px',
          padding: '10px 20px 0', margin: 0, color: 'var(--ink)',
        }}>
          {tituloSeccion}
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
          <HScroll className="scrollbar-hide" style={{ display: 'flex', gap: '12px', padding: '16px 20px 0', overflowX: 'auto' }} arrowOffsetY={8}>
            {categorias.map(({ sector, count, pct, fotos }) => (
              <CategoriaCard
                key={sector.nombre}
                nombre={sector.nombre}
                count={fmt.format(count)}
                ahorroPct={pct}
                fotos={fotos}
                onClick={() => onIrACompararConSector(sector.nombre)}
              />
            ))}
          </HScroll>
        </div>
      </div>
    </div>
  )
}
