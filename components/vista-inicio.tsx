'use client'

import { useMemo, useState, useEffect } from 'react'
import { calcularBombas, Producto } from '@/lib/data'
import { BombaListItem } from '@/components/bomba-list-item'
import CircularGallery from '@/components/CircularGallery'
import { LogoLoop } from '@/components/LogoLoop'
import BlurText from '@/components/reactbits/TextAnimations/BlurText/BlurText'
import CountUp from '@/components/reactbits/TextAnimations/CountUp/CountUp'
import SpotlightCard from '@/components/reactbits/Components/SpotlightCard/SpotlightCard'

interface VistaInicioProps {
  onIrACompararConSector: (sector: string) => void
  onIrAlCatalogoConMayorista: (mayorista: string) => void
  onIrAlCatalogo: () => void
  onVerProducto: (producto: Producto) => void
  favoritos: Set<string>
  onToggleFavorito: (id: string) => void
}

const MAYORISTAS_LOOP = [
  { src: '/mayoristas/maxiconsumo.webp', alt: 'Maxiconsumo',   url: 'https://www.maxiconsumo.com' },
  { src: '/mayoristas/yaguar.png',       alt: 'Yaguar',        url: 'https://www.yaguar.com.ar' },
  { src: '/mayoristas/maxicarrefour.jpg',alt: 'MaxiCarrefour', url: 'https://www.carrefour.com.ar' },
]

const SECTORES_GALLERY = [
  { image: '/categories/Almacen.png',         text: 'Almacen' },
  { image: '/categories/bebidas_real.png',    text: 'Bebidas' },
  { image: '/categories/limpieza_real.png',   text: 'Limpieza' },
  { image: '/categories/frescos.png',         text: 'Frescos' },
  { image: '/categories/perfumeria_real.png', text: 'Cuidado' },
  { image: '/categories/mascotas.png',        text: 'Mascotas' },
]

export function VistaInicio({
  onVerProducto,
}: VistaInicioProps) {
  const bombas = useMemo(() => calcularBombas().slice(0, 20), [])
  const ahorroMax = useMemo(() => Math.max(0, ...bombas.map(b => b.ahorroEnPlata)), [bombas])
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [heroBomba, ...restoBombas] = bombas
  const bombasSecundarias = mostrarTodas ? restoBombas : restoBombas.slice(0, 3)

  return (
    <div style={{ background: '#fff', minHeight: '100%', paddingBottom: '40px' }}>
      <style>{`
        .inicio-wrapper { padding: 32px 24px; }
        .inicio-h1 { display: flex !important; flex-wrap: wrap !important; margin: 0 0 4px !important; }
        .inicio-h1 span {
          font-family: var(--font-sans) !important;
          font-size: var(--fs-section) !important; font-weight: 600 !important;
          text-transform: none !important; letter-spacing: 0 !important;
          color: #0a0a0a !important; line-height: var(--lh-section) !important;
        }
        .stats-bar { display: flex; gap: 28px; margin-bottom: 28px; flex-wrap: wrap; }
        .stat-item { display: flex; flex-direction: column; gap: 2px; }
        .stat-val { font-size: var(--fs-h1); font-weight: 700; color: #0a0a0a; line-height: 1; }
        .stat-label { font-size: var(--fs-xs); color: #888; font-weight: 500; }
        .hero-spotlight {
          border-radius: 12px !important;
          border: 1px solid #e5e7eb !important;
          overflow: hidden !important;
          margin-bottom: 8px;
        }
        .seccion-label {
          font-size: 11px; font-weight: 700; color: #555;
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 24px; display: block;
        }
        @media (max-width: 700px) {
          .inicio-wrapper { padding: 20px 16px; }
          .inicio-h1 span { font-size: var(--fs-product) !important; }
          .stat-val { font-size: var(--fs-section); }
          .stats-bar { gap: 20px; }
        }
      `}</style>

      <div className="inicio-wrapper">

        {/* Título animado con BlurText */}
        <BlurText
          text="Las mejores ofertas de hoy"
          animateBy="words"
          direction="top"
          delay={80}
          stepDuration={0.3}
          className="inicio-h1"
        />

        <p style={{ fontSize: 'var(--fs-body)', color: '#555', margin: '0 0 20px', lineHeight: 'var(--lh-body)' }}>
          Productos con mayor diferencia de precio entre mayoristas
        </p>

        {/* Stats bar con CountUp */}
        {bombas.length > 0 && (
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-val">
                {mounted
                  ? <CountUp from={0} to={3018} duration={1.8} separator="." />
                  : '3.018'}
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

        {/* Logo Loop — mayoristas animados */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: '#555',
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
              spotlightColor="rgba(212, 165, 116, 0.12)"
            >
              <BombaListItem
                bomba={heroBomba}
                rank={1}
                onVerProducto={() => onVerProducto(heroBomba)}
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
            />
          ))}
          {bombas.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '15px', fontWeight: 600 }}>Sin ofertas disponibles</div>
            </div>
          )}
        </div>

        {/* Botón "Ver más" */}
        {!mostrarTodas && bombas.length > 4 && (
          <button
            onClick={() => setMostrarTodas(true)}
            style={{
              width: '100%', padding: '14px',
              background: '#f5f5f5', color: '#0a0a0a',
              border: '1.5px solid #0a0a0a', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Ver las 20 mejores ofertas
          </button>
        )}

        {/* CircularGallery — sectores */}
        <div style={{ marginTop: '52px' }}>
          <BlurText
            text="EXPLORA POR SECTOR"
            animateBy="words"
            direction="top"
            delay={100}
            stepDuration={0.25}
            className="seccion-label"
          />
          <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
            <CircularGallery
              items={SECTORES_GALLERY}
              bend={3}
              textColor="#0a0a0a"
              borderRadius={0.05}
              font="bold 24px Poppins, sans-serif"
              scrollSpeed={2}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
