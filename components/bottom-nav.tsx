'use client'

import { Home, LayoutGrid, Briefcase, User } from 'lucide-react'
import type { Vista } from '@/app/page'

interface BottomNavProps {
  vistaActiva: Vista
  onChange: (vista: Vista) => void
  listaCount?: number
}

const items: { id: Vista; label: string; Icon: typeof Home }[] = [
  { id: 'inicio',       label: 'Para Ti',   Icon: Home },
  { id: 'catalogo',     label: 'Catálogo',  Icon: LayoutGrid },
  { id: 'herramientas', label: 'Mi Lista',  Icon: Briefcase },
  { id: 'perfil',       label: 'Perfil',    Icon: User },
]

const NAV_IDS = items.map(i => i.id)

export function BottomNav({ vistaActiva, onChange, listaCount = 0 }: BottomNavProps) {
  const activeId = NAV_IDS.includes(vistaActiva) ? vistaActiva : 'inicio'

  return (
    <nav
      className="flex md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#ffffff',
        borderTop: '1px solid #afafaf',
        paddingTop: '12px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const isActive = activeId === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 4px',
              minHeight: '48px',
              color: isActive ? '#0a0a0a' : '#9ca3af',
              transition: 'color 0.15s ease',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />
              {id === 'herramientas' && listaCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  background: '#16a34a', color: '#fff',
                  fontSize: '9px', fontWeight: 700,
                  minWidth: '16px', height: '16px',
                  borderRadius: '8px', padding: '0 3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                }}>
                  {listaCount > 9 ? '9+' : listaCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', fontWeight: isActive ? 700 : 400, letterSpacing: '0.01em' }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
