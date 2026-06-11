'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronDown } from 'lucide-react'
import type { Vista } from '@/app/page'
import { productos, sectores } from '@/lib/data'

interface CategoryDrawerProps {
  open: boolean
  onClose: () => void
  onSectorChange: (sector: string) => void
  onSubcategoriaChange?: (sub: string) => void
  onNavegar: (vista: Vista) => void
}

const SECTOR_IMAGES: Record<string, string> = {
  'Almacén':          '/categories/almacen.png',
  'Bebidas':          '/categories/bebidas_real.png',
  'Limpieza':         '/categories/limpieza_real.png',
  'Frescos':          '/categories/frescos.png',
  'Cuidado Personal': '/categories/perfumeria_real.png',
  'Mascotas':         '/categories/mascotas.png',
}

const fmt = new Intl.NumberFormat('es-AR')

export function CategoryDrawer({ open, onClose, onSectorChange, onSubcategoriaChange, onNavegar }: CategoryDrawerProps) {
  const [expandido, setExpandido] = useState<string | null>(null)

  const irACategoria = (sector: string, subcategoria?: string) => {
    onSectorChange(sector)
    if (subcategoria) onSubcategoriaChange?.(subcategoria)
    onNavegar('catalogo')
    onClose()
    setExpandido(null)
  }

  const irAVista = (vista: Vista) => {
    onNavegar(vista)
    onClose()
    setExpandido(null)
  }

  return (
    <>
      <style>{`
        .cdrawer-row { transition: background 140ms ease; }
        @media (hover: hover) and (pointer: fine) {
          .cdrawer-row:hover { background: var(--plate); }
        }
        .cdrawer-row:active { background: var(--plate); }
        /* Accordion de subcategorías: grid-rows 0fr→1fr anima height sin medirlo */
        .cdrawer-subs {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 300ms var(--ease-out);
        }
        .cdrawer-subs.open { grid-template-rows: 1fr; }
        .cdrawer-subs > div { overflow: hidden; }
        .cdrawer-chev { transition: transform 250ms var(--ease-out); }
        .cdrawer-chev.open { transform: rotate(180deg); }
        @media (prefers-reduced-motion: reduce) {
          .cdrawer-subs { transition: none; }
          .cdrawer-chev { transition: none; }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(10,10,10,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
      />
      {/* Panel — curva iOS (emil-design-eng) */}
      <aside
        aria-hidden={!open}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 201,
          width: '320px', background: '#ffffff',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 400ms var(--ease-drawer)',
          display: 'flex', flexDirection: 'column',
          padding: '20px 0',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 12px' }}>
          <span style={{ fontSize: '21.4px', fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--ink)' }}>Categorías</span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--ink)' }}
          >
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        {/* Todas las categorías */}
        <button
          className="cdrawer-row"
          onClick={() => irACategoria('Todos')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            width: '100%', padding: '12px 20px',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{
            width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
            background: 'var(--pill)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 700,
          }}>
            ⌂
          </span>
          <span style={{ flex: 1, fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)' }}>
            Todas las categorías
          </span>
          <span className="tnum" style={{
            fontSize: '11px', fontWeight: 500, color: 'var(--gray)',
            background: 'var(--plate)', borderRadius: '999px', padding: '4px 10px',
          }}>
            {fmt.format(productos.length)}
          </span>
        </button>

        <div style={{ height: '1px', background: 'var(--line)', margin: '8px 20px' }} />

        {/* Sectores con thumbnail + drill-down de subcategorías */}
        {sectores.map(s => {
          const count = productos.filter(p => p.sector === s.nombre).length
          const img = SECTOR_IMAGES[s.nombre]
          const abierto = expandido === s.nombre
          const subcats = s.subcategorias ?? []
          return (
            <div key={s.nombre}>
              <button
                className="cdrawer-row"
                onClick={() => subcats.length > 0 ? setExpandido(abierto ? null : s.nombre) : irACategoria(s.nombre)}
                aria-expanded={abierto}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '9px 20px',
                  background: abierto ? 'var(--plate)' : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{
                  width: '40px', height: '40px', borderRadius: '8px', flexShrink: 0,
                  background: 'var(--plate)', overflow: 'hidden', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {img ? (
                    <Image src={img} alt="" fill sizes="40px" style={{ objectFit: 'cover' }} unoptimized />
                  ) : (
                    <span style={{ fontSize: '18px' }}>{s.emoji}</span>
                  )}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '14.5px', fontWeight: abierto ? 600 : 500, color: 'var(--ink)' }}>
                    {s.nombre}
                  </span>
                  <span className="tnum" style={{ display: 'block', fontSize: '11px', fontWeight: 300, color: 'var(--gray)', marginTop: '1px' }}>
                    {fmt.format(count)} productos
                  </span>
                </span>
                {subcats.length > 0 && (
                  <ChevronDown size={16} strokeWidth={2} color="var(--gray)" className={`cdrawer-chev${abierto ? ' open' : ''}`} />
                )}
              </button>

              {/* Subcategorías */}
              {subcats.length > 0 && (
                <div className={`cdrawer-subs${abierto ? ' open' : ''}`}>
                  <div>
                    <button
                      className="cdrawer-row"
                      onClick={() => irACategoria(s.nombre)}
                      style={{
                        display: 'block', width: '100%', padding: '9px 20px 9px 72px',
                        fontSize: '13.5px', fontWeight: 600, color: 'var(--ink)',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Ver todo {s.nombre}
                    </button>
                    {subcats.map(sub => (
                      <button
                        key={sub}
                        className="cdrawer-row"
                        onClick={() => irACategoria(s.nombre, sub)}
                        style={{
                          display: 'block', width: '100%', padding: '9px 20px 9px 72px',
                          fontSize: '13.5px', fontWeight: 400, color: 'var(--ink)',
                          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'var(--font-sans)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                    <div style={{ height: '6px' }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div style={{ height: '1px', background: 'var(--line)', margin: '8px 20px' }} />

        <div style={{
          padding: '10px 20px 6px',
          fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.14em',
          color: 'var(--gray)', textTransform: 'uppercase',
        }}>
          Mi cuenta
        </div>
        <button
          className="cdrawer-row"
          onClick={() => irAVista('herramientas')}
          style={{
            display: 'flex', alignItems: 'center',
            width: '100%', padding: '12px 20px',
            fontSize: '14.5px', fontWeight: 400, color: 'var(--ink)',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Mi Lista
        </button>
        <button
          className="cdrawer-row"
          onClick={() => irAVista('perfil')}
          style={{
            display: 'flex', alignItems: 'center',
            width: '100%', padding: '12px 20px',
            fontSize: '14.5px', fontWeight: 400, color: 'var(--ink)',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Perfil
        </button>
      </aside>
    </>
  )
}
