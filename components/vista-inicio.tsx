'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { calcularBombas, productos, sectores, Producto } from '@/lib/data'
import { BombaListItem } from '@/components/bomba-list-item'
import { LogoLoop } from '@/components/LogoLoop'
import BlurText from '@/components/reactbits/TextAnimations/BlurText/BlurText'
import CountUp from '@/components/reactbits/TextAnimations/CountUp/CountUp'
import SpotlightCard from '@/components/reactbits/Components/SpotlightCard/SpotlightCard'
import { btnHover } from '@/lib/motion-variants'

interface VistaInicioProps {
  onIrACompararConSector: (sector: string) => void
  onIrAlCatalogoConMayorista: (mayorista: string) => void
  onIrAlCatalogo: () => void
  onVerProducto: (producto: Producto) => void
  favoritos: Set<string>
  onToggleFavorito: (id: string) => void
  onGuardar?: (producto: Producto) => void
}

const MAYORISTAS_LOOP = [
  { src: '/mayoristas/maxiconsumo.webp', alt: 'Maxiconsumo',   url: 'https://www.maxiconsumo.com' },
  { src: '/mayoristas/yaguar.png',       alt: 'Yaguar',        url: 'https://www.yaguar.com.ar' },
  { src: '/mayoristas/maxicarrefour.jpg',alt: 'MaxiCarrefour', url: 'https://comerciante.carrefour.com.ar/' },
]

const SECTOR_IMAGES: Record<string, string> = {
  'Almacén':          '/categories/Almacen.png',
  'Bebidas':          '/categories/bebidas_real.png',
  'Limpieza':         '/categories/limpieza_real.png',
  'Frescos':          '/categories/frescos.png',
  'Cuidado Personal': '/categories/perfumeria_real.png',
  'Mascotas':         '/categories/mascotas.png',
}

export function VistaInicio({
  onVerProducto,
  onIrACompararConSector,
  onGuardar,
}: VistaInicioProps) {
  const bombas = useMemo(() => calcularBombas().slice(0, 50), [])
  const comparacionesCount = useMemo(() => productos.filter(p => p.precios.length >= 2).length, [])
  const ahorroMax = useMemo(() => Math.max(0, ...bombas.map(b => b.ahorroEnPlata)), [bombas])
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [nombreNegocio, setNombreNegocio] = useState('')
  useEffect(() => {
    setMounted(true)
    const savedPerfil = localStorage.getItem('brujula_perfil')
    if (savedPerfil) {
      try { setNombreNegocio(JSON.parse(savedPerfil).nombre ?? '') } catch {}
    }
  }, [])

  const [heroBomba, ...restoBombas] = bombas
  const bombasSecundarias = mostrarTodas ? restoBombas : restoBombas.slice(0, 3)

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100%', paddingBottom: '40px' }}>
      <style>{`
        .inicio-wrapper { padding: 32px 24px; }
        .inicio-h1 { display: flex !important; flex-wrap: wrap !important; margin: 0 0 4px !important; }
        .inicio-h1 span {
          font-family: var(--font-sans) !important;
          font-size: var(--fs-section) !important; font-weight: 700 !important;
          text-transform: none !important; letter-spacing: 0 !important;
          color: #f7f7f7 !important; line-height: var(--lh-section) !important;
        }
        .stats-bar { display: flex; gap: 28px; margin-bottom: 28px; flex-wrap: wrap; }
        .stat-item { display: flex; flex-direction: column; gap: 2px; }
        .stat-val {
          font-family: var(--font-display);
          font-size: var(--fs-h1); font-weight: 800;
          color: #d4a574; line-height: 1;
        }
        .stat-label { font-size: var(--fs-xs); color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
        .hero-spotlight {
          border-radius: 12px !important;
          border: 1px solid #2a2a2a !important;
          overflow: hidden !important;
          margin-bottom: 8px;
        }
        .seccion-label {
          font-size: 11px; font-weight: 700; color: #6b7280;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 24px; display: block;
        }
        @media (max-width: 700px) {
          .inicio-wrapper { padding: 20px 16px; }
          .inicio-h1 span { font-size: var(--fs-product) !important; }
          .stat-val { font-size: var(--fs-section); }
          .stats-bar { gap: 20px; }
        }
        @media (min-width: 700px) {
          .categoria-grid-desktop { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>

      <div className="inicio-wrapper">

        {/* Saludo personalizado */}
        {nombreNegocio && (
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
            Hola, <strong style={{ color: '#d4a574' }}>{nombreNegocio}</strong>
          </p>
        )}

        {/* Título animado */}
        <BlurText
          text="TOP Bombas Semanal"
          animateBy="words"
          direction="top"
          delay={80}
          stepDuration={0.3}
          className="inicio-h1"
        />

        <p style={{ fontSize: 'var(--fs-body)', color: '#6b7280', margin: '0 0 20px', lineHeight: 'var(--lh-body)' }}>
          Los productos con mayor diferencia de precio entre mayoristas
        </p>

        {/* Stats bar */}
        {bombas.length > 0 && (
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-val">
                {mounted
                  ? <CountUp from={0} to={comparacionesCount} duration={1.8} separator="." />
                  : comparacionesCount.toLocaleString('es-AR')}
              </div>
              <div className="stat-label">comparaciones disponibles</div>
            </div>
            {ahorroMax > 0 && (
              <div className="stat-item">
                <div className="stat-val">
                  {mounted
                    ? <CountUp from={0} to={ahorroMax} duration={1.8} prefix="$" separator="." />
                    : `$${ahorroMax.toLocaleString('es-AR')}`}
                </div>
                <div className="stat-label">maximo ahorro por producto</div>
              </div>
            )}
          </div>
        )}

        {/* Logo Loop */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#6b7280',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px',
          }}>
            MAYORISTAS DISPONIBLES
          </div>
          <LogoLoop items={MAYORISTAS_LOOP} />
        </div>

        {/* Hero bomba #1 con SpotlightCard */}
        {heroBomba && (
          <div style={{ marginBottom: '4px' }}>
            <SpotlightCard
              className="hero-spotlight"
              spotlightColor="rgba(212, 165, 116, 0.15)"
            >
              <BombaListItem
                bomba={heroBomba}
                rank={1}
                onVerProducto={() => onVerProducto(heroBomba)}
                onGuardar={() => onGuardar?.(heroBomba)}
              />
            </SpotlightCard>
          </div>
        )}

        {/* Resto de bombas */}
        <div>
          {bombasSecundarias.map((bomba, idx) => (
            <BombaListItem
              key={bomba.id}
              bomba={bomba}
              rank={idx + 2}
              onVerProducto={() => onVerProducto(bomba)}
              onGuardar={() => onGuardar?.(bomba)}
            />
          ))}
          {bombas.length === 0 && (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', color: '#2a2a2a' }}>📦</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f7f7f7', marginBottom: '8px' }}>
                Actualizando precios
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                Los datos se cargan en los proximos minutos
              </div>
              <motion.button
                {...btnHover}
                style={{
                  background: '#d4a574', color: '#0a0a0a',
                  border: 'none', borderRadius: '8px',
                  padding: '12px 24px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ver catalogo completo
              </motion.button>
            </div>
          )}
        </div>

        {/* Botón "Ver más" */}
        {!mostrarTodas && bombas.length > 4 && (
          <motion.button
            onClick={() => setMostrarTodas(true)}
            {...btnHover}
            style={{
              width: '100%', padding: '14px',
              background: 'transparent', color: '#d4a574',
              border: '1.5px solid #d4a574', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Ver todas las ofertas
          </motion.button>
        )}

        {/* Categorias clickeables — carrusel horizontal */}
        <div style={{ marginTop: '52px' }}>
          <span className="seccion-label">EXPLORAR POR CATEGORIA</span>
          <div style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {sectores.map(sector => {
              const img = SECTOR_IMAGES[sector.nombre]
              return (
                <button
                  key={sector.nombre}
                  onClick={() => onIrACompararConSector(sector.nombre)}
                  style={{
                    position: 'relative',
                    flexShrink: 0,
                    width: '110px',
                    height: '140px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #2a2a2a',
                    cursor: 'pointer',
                    background: '#1a1a1a',
                    padding: 0,
                  }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={sector.nombre}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '32px',
                    }}>
                      {sector.emoji}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
                  }} />
                  <span style={{
                    position: 'absolute', bottom: '10px', left: '8px', right: '8px',
                    fontSize: '12px', fontWeight: 700, color: '#f7f7f7',
                    textAlign: 'left', lineHeight: 1.2,
                    textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  }}>
                    {sector.nombre}
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
