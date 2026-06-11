'use client'

import { motion } from 'framer-motion'
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react'
import type { Vista } from '@/app/page'

interface BottomNavProps {
  vistaActiva: Vista
  onChange: (vista: Vista) => void
  listaCount?: number
}

const items: { id: Vista; label: string; Icon: typeof Home }[] = [
  { id: 'inicio',       label: 'Para Ti',   Icon: Home },
  { id: 'catalogo',     label: 'Catálogo',  Icon: LayoutGrid },
  { id: 'herramientas', label: 'Mi Lista',  Icon: ShoppingBag },
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
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const isActive = activeId === id
        return (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 4px 8px',
              minHeight: '56px',
              color: isActive ? 'var(--ink)' : 'var(--gray)',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon size={22} strokeWidth={1.8} />
              {id === 'herramientas' && listaCount > 0 && (
                <span className="tnum" style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  background: 'var(--green)', color: '#ffffff',
                  fontSize: '9px', fontWeight: 700,
                  minWidth: '16px', height: '16px',
                  borderRadius: '8px', padding: '0 3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                  border: '2px solid #ffffff',
                }}>
                  {listaCount > 9 ? '9+' : listaCount}
                </span>
              )}
            </div>

            <span style={{
              fontSize: '10.5px',
              fontWeight: 500,
              letterSpacing: '0.01em',
            }}>
              {label}
            </span>

            {/* Puntito dorado bajo el item activo */}
            <span style={{ height: '4px', display: 'flex', alignItems: 'center' }}>
              {isActive && (
                <motion.span
                  layoutId="nav-dot"
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '99px',
                    background: 'var(--gold)',
                    display: 'block',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
