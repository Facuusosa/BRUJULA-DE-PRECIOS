'use client'

import { useState } from 'react'
import {
  X, ChevronDown,
  LayoutGrid, ShoppingBasket, CupSoda, Milk, SprayCan, Droplet, CookingPot,
  Snowflake, Carrot, CakeSlice, Candy, PawPrint, Coffee, PlugZap, Shirt,
  BookOpen, Blocks, Lightbulb, Flame, Egg, Package,
  type LucideIcon,
} from 'lucide-react'
import type { Vista } from '@/app/page'
import { productos, sectores } from '@/lib/data'

interface CategoryDrawerProps {
  open: boolean
  onClose: () => void
  onSectorChange: (sector: string) => void
  onSubcategoriaChange?: (sub: string) => void
  onNavegar: (vista: Vista) => void
}

// Icono de línea + tinte atenuado por sector (paleta apagada: suma escaneo sin gritar)
type SectorIcon = { Icon: LucideIcon; bg: string; fg: string }
const NEUTRO: SectorIcon = { Icon: Package, bg: '#eef0f2', fg: '#455a64' }
const SECTOR_ICONS: Record<string, SectorIcon> = {
  'Almacén':            { Icon: ShoppingBasket, bg: '#e9f3ea', fg: '#4a7c50' },
  'Bebidas':            { Icon: CupSoda,        bg: '#faf0e4', fg: '#b56a2e' },
  'Frescos':            { Icon: Milk,           bg: '#f1eaf3', fg: '#7a5a83' },
  'Limpieza':           { Icon: SprayCan,       bg: '#e8f0f7', fg: '#416c98' },
  'Cuidado Personal':   { Icon: Droplet,        bg: '#f7e9ef', fg: '#a85877' },
  'Bazar':              { Icon: CookingPot,     bg: '#f1eaf3', fg: '#7a5a83' },
  'Congelados':         { Icon: Snowflake,      bg: '#e7f0f6', fg: '#3f7490' },
  'Verdulería':         { Icon: Carrot,         bg: '#e9f3ea', fg: '#4a7c50' },
  'Quesos':             { Icon: CakeSlice,      bg: '#faf0e4', fg: '#b56a2e' },
  'Kiosco':             { Icon: Candy,          bg: '#f7e9ef', fg: '#a85877' },
  'Mascotas':           { Icon: PawPrint,       bg: '#e9f3ea', fg: '#4a7c50' },
  'Desayuno y Merienda':{ Icon: Coffee,         bg: '#f7f1de', fg: '#977a2e' },
  'Electrónica':        { Icon: PlugZap,        bg: '#e8f0f7', fg: '#416c98' },
  'Textil':             { Icon: Shirt,          bg: '#f7e9ef', fg: '#a85877' },
  'Librería':           { Icon: BookOpen,       bg: '#faf0e4', fg: '#b56a2e' },
  'Juguetería':         { Icon: Blocks,         bg: '#e7f0f6', fg: '#3f7490' },
  'Iluminación':        { Icon: Lightbulb,      bg: '#f7f1de', fg: '#977a2e' },
  'Parrilla':           { Icon: Flame,          bg: '#f6e8e8', fg: '#a85252' },
  'Granja':             { Icon: Egg,            bg: '#e9f3ea', fg: '#4a7c50' },
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
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            background: NEUTRO.bg, color: NEUTRO.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LayoutGrid size={20} strokeWidth={1.9} />
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
          const ic = SECTOR_ICONS[s.nombre] ?? NEUTRO
          const SectorIco = ic.Icon
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
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: ic.bg, color: ic.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <SectorIco size={20} strokeWidth={1.9} />
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
