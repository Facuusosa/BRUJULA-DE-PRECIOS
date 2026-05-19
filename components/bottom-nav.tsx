'use client'

import { motion } from 'framer-motion'
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
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #2a2a2a',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const isActive = activeId === id
        return (
          <motion.button
            key={id}
            onClick={() => onChange(id)}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
              padding: '0 4px',
              height: '56px',
              minHeight: '56px',
              color: isActive ? '#d4a574' : '#6b7280',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.6} />

              {/* Punto indicador bajo el ícono cuando activo */}
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '2px',
                    background: '#d4a574',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {id === 'herramientas' && listaCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-8px',
                  background: '#16a34a', color: '#fff',
                  fontSize: '9px', fontWeight: 700,
                  minWidth: '16px', height: '16px',
                  borderRadius: '8px', padding: '0 3px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  lineHeight: 1,
                  border: '2px solid #0a0a0a',
                }}>
                  {listaCount > 9 ? '9+' : listaCount}
                </span>
              )}
            </div>

            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? 700 : 400,
              letterSpacing: '0.01em',
              color: isActive ? '#d4a574' : '#6b7280',
            }}>
              {label}
            </span>
          </motion.button>
        )
      })}
    </nav>
  )
}
