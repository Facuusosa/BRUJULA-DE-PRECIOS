'use client'

import { useState } from 'react'
import { Home, LayoutGrid, ShoppingBag, User, ChevronDown } from 'lucide-react'
import type { Vista } from '@/app/page'
import { sectores } from '@/lib/data'

interface DesktopSidebarProps {
  vistaActiva: Vista
  sectorActivo: string
  subcategoriaActiva: string
  onChange: (vista: Vista) => void
  onCategoria: (sector: string, subcategoria?: string) => void
}

const NAV_ITEMS = [
  { id: 'inicio'       as Vista, label: 'Para Ti',  Icon: Home },
  { id: 'catalogo'     as Vista, label: 'Catálogo', Icon: LayoutGrid },
  { id: 'herramientas' as Vista, label: 'Mi Lista', Icon: ShoppingBag },
  { id: 'perfil'       as Vista, label: 'Perfil',   Icon: User },
]

export function DesktopSidebar({ vistaActiva, sectorActivo, subcategoriaActiva, onChange, onCategoria }: DesktopSidebarProps) {
  const [expandido, setExpandido] = useState<string | null>(null)
  const enCatalogo = vistaActiva === 'catalogo'

  return (
    <>
      <style>{`
        .desktop-sidebar { display: none; }
        @media (min-width: 700px) {
          .desktop-sidebar {
            display: flex;
            flex-direction: column;
            gap: 2px;
            flex-shrink: 0;
            width: 240px;
            padding: 24px 16px 24px 28px;
            overflow-y: auto;
          }
          .desktop-sidebar button:hover { background: var(--plate); }
        }
        /* Accordion: mismo patrón grid-rows del drawer — anima height sin medirlo */
        .dsb-cats {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 300ms var(--ease-out);
        }
        .dsb-cats.open { grid-template-rows: 1fr; }
        .dsb-cats > div { overflow: hidden; }
        .dsb-chev { transition: transform 250ms var(--ease-out); }
        .dsb-chev.open { transform: rotate(180deg); }
        @media (prefers-reduced-motion: reduce) {
          .dsb-cats { transition: none; }
          .dsb-chev { transition: none; }
        }
      `}</style>
      <aside className="desktop-sidebar">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = vistaActiva === id
          return (
            <div key={id}>
              <button
                onClick={() => onChange(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '11px 12px',
                  fontSize: '14.5px',
                  fontWeight: isActive ? 600 : 400,
                  color: 'var(--ink)',
                  background: 'none', border: 'none',
                  borderRadius: '8px', cursor: 'pointer',
                  textAlign: 'left', width: '100%',
                  transition: 'background 140ms ease',
                }}
              >
                <Icon size={21} strokeWidth={isActive ? 2.1 : 1.8} />
                {label}
              </button>

              {/* Categorías bajo Catálogo — visibles mientras se navega el catálogo */}
              {id === 'catalogo' && (
                <div className={`dsb-cats${enCatalogo ? ' open' : ''}`}>
                  <div>
                    <button
                      onClick={() => { onCategoria('Todos'); setExpandido(null) }}
                      style={{
                        display: 'block', width: '100%', padding: '7px 12px 7px 47px',
                        fontSize: '13px',
                        fontWeight: enCatalogo && sectorActivo === 'Todos' && !subcategoriaActiva ? 600 : 400,
                        color: 'var(--ink)',
                        background: 'none', border: 'none', borderRadius: '8px',
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'var(--font-sans)',
                        transition: 'background 140ms ease',
                      }}
                    >
                      Todas las categorías
                    </button>
                    {sectores.map(s => {
                      const abierto = expandido === s.nombre
                      const subcats = s.subcategorias ?? []
                      const sectorEsActivo = sectorActivo === s.nombre
                      return (
                        <div key={s.nombre}>
                          <button
                            onClick={() => {
                              onCategoria(s.nombre)
                              setExpandido(abierto ? null : subcats.length > 0 ? s.nombre : null)
                            }}
                            aria-expanded={abierto}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '8px',
                              width: '100%', padding: '7px 12px 7px 47px',
                              fontSize: '13px',
                              fontWeight: sectorEsActivo && !subcategoriaActiva ? 600 : 400,
                              color: 'var(--ink)',
                              background: 'none', border: 'none', borderRadius: '8px',
                              cursor: 'pointer', textAlign: 'left',
                              fontFamily: 'var(--font-sans)',
                              transition: 'background 140ms ease',
                            }}
                          >
                            <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.nombre}
                            </span>
                            {subcats.length > 0 && (
                              <ChevronDown size={14} strokeWidth={2} color="var(--gray)" className={`dsb-chev${abierto ? ' open' : ''}`} />
                            )}
                          </button>
                          {subcats.length > 0 && (
                            <div className={`dsb-cats${abierto ? ' open' : ''}`}>
                              <div>
                                {subcats.map(sub => (
                                  <button
                                    key={sub}
                                    onClick={() => onCategoria(s.nombre, sub)}
                                    style={{
                                      display: 'block', width: '100%', padding: '6px 12px 6px 62px',
                                      fontSize: '12.5px',
                                      fontWeight: sectorEsActivo && subcategoriaActiva === sub ? 600 : 400,
                                      color: sectorEsActivo && subcategoriaActiva === sub ? 'var(--ink)' : 'var(--gray)',
                                      background: 'none', border: 'none', borderRadius: '8px',
                                      cursor: 'pointer', textAlign: 'left',
                                      fontFamily: 'var(--font-sans)',
                                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                      transition: 'background 140ms ease',
                                    }}
                                  >
                                    {sub}
                                  </button>
                                ))}
                                <div style={{ height: '4px' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    <div style={{ height: '6px' }} />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </aside>
    </>
  )
}
