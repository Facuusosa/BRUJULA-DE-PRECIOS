'use client'

import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'
import type { Vista } from '@/app/page'

interface DesktopSidebarProps {
  vistaActiva: Vista
  onChange: (vista: Vista) => void
}

const NAV_ITEMS = [
  { id: 'inicio'       as Vista, label: 'Para Ti',  Icon: Home },
  { id: 'catalogo'     as Vista, label: 'Catálogo', Icon: LayoutGrid },
  { id: 'herramientas' as Vista, label: 'Mi Lista', Icon: ShoppingBag },
  { id: 'perfil'       as Vista, label: 'Perfil',   Icon: User },
]

export function DesktopSidebar({ vistaActiva, onChange }: DesktopSidebarProps) {
  return (
    <>
      <style>{`
        .desktop-sidebar { display: none; }
        @media (min-width: 700px) {
          .desktop-sidebar {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex-shrink: 0;
            width: 240px;
            padding: 24px 16px 24px 28px;
          }
          .desktop-sidebar button:hover { background: var(--plate); }
        }
      `}</style>
      <aside className="desktop-sidebar">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = vistaActiva === id
          return (
            <button
              key={id}
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
          )
        })}
      </aside>
    </>
  )
}
