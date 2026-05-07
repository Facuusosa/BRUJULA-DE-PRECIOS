'use client'

import { Home, Tag, Briefcase, User } from 'lucide-react'
import type { Vista } from '@/app/page'
import { sectores } from '@/lib/data'
import Magnet from '@/components/reactbits/Animations/Magnet/Magnet'

interface DesktopSidebarProps {
  vistaActiva: Vista
  onChange: (vista: Vista) => void
  sectorActivo?: string
  onSectorChange?: (sector: string) => void
  subcategoriaActiva?: string
  onSubcategoriaChange?: (sub: string) => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

const NAV_ITEMS = [
  { id: 'inicio'       as Vista, label: 'Para Ti',  Icon: Home },
  { id: 'catalogo'     as Vista, label: 'Catálogo', Icon: Tag },
  { id: 'herramientas' as Vista, label: 'Mi Lista', Icon: Briefcase },
  { id: 'perfil'       as Vista, label: 'Perfil',   Icon: User },
]

export function DesktopSidebar({
  vistaActiva,
  onChange,
  sectorActivo,
  onSectorChange,
  subcategoriaActiva,
  onSubcategoriaChange,
  collapsed = false,
  onToggleCollapsed,
}: DesktopSidebarProps) {
  const sectorData = sectores.find(s => s.nombre === sectorActivo)
  const subcats = sectorData?.subcategorias ?? []

  return (
    <>
      <style>{`
        .desktop-sidebar-wrap { display: none !important; }
        @media (min-width: 700px) {
          .desktop-sidebar-wrap {
            display: flex !important;
            position: relative;
            flex-shrink: 0;
          }
          .desktop-sidebar {
            display: flex;
            flex-direction: column;
            width: 200px;
            border-right: 1px solid #e5e7eb;
            box-shadow: 4px 0 16px rgba(0,0,0,0.05);
            padding: 16px 0;
            background: #fafafa;
            overflow-y: auto;
            overflow-x: hidden;
            transition: width 0.22s ease, padding 0.22s ease, border 0.22s ease;
          }
          .desktop-sidebar.collapsed {
            width: 0;
            padding: 0;
            border-right: none;
            box-shadow: none;
          }
          .sidebar-tab-wrap {
            position: absolute;
            top: 50%;
            right: -18px;
            transform: translateY(-50%);
            z-index: 20;
          }
          .sidebar-tab {
            width: 18px;
            height: 52px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-left: none;
            border-radius: 0 8px 8px 0;
            box-shadow: 3px 2px 10px rgba(0,0,0,0.10);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.15s, width 0.15s;
          }
          .sidebar-tab:hover {
            background: #f3f4f6;
            width: 22px;
          }
          .sidebar-tab-dots {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .sidebar-tab-dot {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: #9ca3af;
            transition: background 0.15s;
          }
          .sidebar-tab:hover .sidebar-tab-dot { background: #374151; }
        }
      `}</style>
      <div className="desktop-sidebar-wrap">
        <aside className={`desktop-sidebar${collapsed ? ' collapsed' : ''}`}>

          {/* Logo */}
          <div style={{ padding: '8px 16px 24px', borderBottom: '1px solid #e5e7eb', marginBottom: '8px', whiteSpace: 'nowrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: '#0a0a0a', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(10,61,31,0.25)', flexShrink: 0,
              }}>
                <span style={{ color: '#d4a574', fontSize: '15px', fontWeight: 800 }}>B</span>
              </div>
              <span style={{
                fontSize: '16px', fontWeight: 800, color: '#0a0a0a',
                fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                letterSpacing: '0.02em', textTransform: 'uppercase',
              }}>Brújula</span>
            </div>
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = vistaActiva === id
            const showSubmenu = id === 'catalogo' && vistaActiva === 'catalogo'

            return (
              <div key={id}>
                <button
                  onClick={() => onChange(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', margin: '1px 8px',
                    background: isActive ? '#0a0a0a' : 'transparent',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    width: 'calc(100% - 16px)', textAlign: 'left',
                    transition: 'background 0.15s', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#e8f5e9' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? '#d4a574' : '#6b7280'} />
                  <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, color: isActive ? '#ffffff' : '#374151' }}>
                    {label}
                  </span>
                </button>

                {/* Submenu sectores */}
                {showSubmenu && (
                  <div>
                    {/* Todos */}
                    <button
                      onClick={() => { onSectorChange?.('Todos'); onSubcategoriaChange?.('') }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '6px 16px 6px 32px', fontSize: '12px',
                        background: !sectorActivo || sectorActivo === 'Todos' ? '#d1d5db' : 'transparent',
                        color: !sectorActivo || sectorActivo === 'Todos' ? '#111827' : '#6b7280',
                        fontWeight: !sectorActivo || sectorActivo === 'Todos' ? 700 : 400,
                        border: 'none',
                        borderLeft: !sectorActivo || sectorActivo === 'Todos' ? '2px solid #374151' : '2px solid transparent',
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      Todos
                    </button>

                    {/* Sectores */}
                    {sectores.map(s => {
                      const isActiveSector = sectorActivo === s.nombre
                      return (
                        <div key={s.nombre}>
                          <button
                            onClick={() => {
                              if (isActiveSector) {
                                onSectorChange?.('Todos')
                                onSubcategoriaChange?.('')
                              } else {
                                onSectorChange?.(s.nombre)
                                onSubcategoriaChange?.('')
                              }
                            }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '6px 16px 6px 32px', fontSize: '12px',
                              background: isActiveSector ? '#d1d5db' : 'transparent',
                              color: isActiveSector ? '#111827' : '#6b7280',
                              fontWeight: isActiveSector ? 700 : 400,
                              border: 'none',
                              borderLeft: isActiveSector ? '2px solid #374151' : '2px solid transparent',
                              cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => { if (!isActiveSector) (e.currentTarget as HTMLButtonElement).style.background = '#ebebeb' }}
                            onMouseLeave={e => { if (!isActiveSector) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                          >
                            {s.nombre}
                          </button>

                          {/* Subcategorías */}
                          {isActiveSector && subcats.length > 0 && (
                            <div>
                              {subcats.map(sub => {
                                const isActiveSub = subcategoriaActiva === sub
                                return (
                                  <button
                                    key={sub}
                                    onClick={() => onSubcategoriaChange?.(isActiveSub ? '' : sub)}
                                    style={{
                                      display: 'block', width: '100%', textAlign: 'left',
                                      padding: '4px 16px 4px 44px', fontSize: '11px',
                                      background: isActiveSub ? '#e0e7ff' : 'transparent',
                                      color: isActiveSub ? '#3730a3' : '#9ca3af',
                                      fontWeight: isActiveSub ? 700 : 400,
                                      border: 'none',
                                      borderLeft: isActiveSub ? '2px solid #4f46e5' : '2px solid transparent',
                                      cursor: 'pointer', whiteSpace: 'nowrap',
                                      overflow: 'hidden', textOverflow: 'ellipsis',
                                    }}
                                    onMouseEnter={e => { if (!isActiveSub) (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6' }}
                                    onMouseLeave={e => { if (!isActiveSub) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                                  >
                                    · {sub}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </aside>

        {/* Pestaña toggle con Magnet */}
        <div className="sidebar-tab-wrap">
          <Magnet magnetStrength={4} padding={40}>
            <button
              className="sidebar-tab"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <div className="sidebar-tab-dots">
                <div className="sidebar-tab-dot" />
                <div className="sidebar-tab-dot" />
                <div className="sidebar-tab-dot" />
              </div>
            </button>
          </Magnet>
        </div>
      </div>
    </>
  )
}
