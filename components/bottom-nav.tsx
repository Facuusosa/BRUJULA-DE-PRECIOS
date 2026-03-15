'use client'

import { Home, GitCompare, ListChecks, User } from 'lucide-react'
import { motion } from 'framer-motion'

export type Vista = 'inicio' | 'comparar' | 'lista' | 'cuenta'

interface BottomNavProps {
  vistaActiva: Vista
  onChange: (vista: Vista) => void
}

const items: { id: Vista; label: string; icon: typeof Home }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'comparar', label: 'Comparar', icon: GitCompare },
  { id: 'lista', label: 'Mi Lista', icon: ListChecks },
  { id: 'cuenta', label: 'Cuenta', icon: User },
]

// Bottom navigation con efecto glassmorphism
export function BottomNav({ vistaActiva, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-bottom">
      <div className="flex items-center justify-around py-2 pb-4">
        {items.map((item) => {
          const isActive = vistaActiva === item.id
          const Icon = item.icon
          
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="flex flex-col items-center gap-1 px-4 py-2 relative"
            >
              {/* Indicador activo */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: '#e8f5ee' }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <Icon 
                className="w-5 h-5 relative z-10 transition-colors duration-200"
                style={{ color: isActive ? '#006d38' : '#64748b' }}
              />
              <span 
                className="font-body text-[11px] font-medium relative z-10 transition-colors duration-200"
                style={{ color: isActive ? '#006d38' : '#64748b' }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
