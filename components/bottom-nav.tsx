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

// Bottom navigation con efecto glassmorphism premium
export function BottomNav({ vistaActiva, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-fit">
      {/* Marco / Fondo de contraste */}
      <div className="p-1 bg-slate-900/5 backdrop-blur-3xl rounded-[2rem] border border-slate-200/40 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <nav 
          className="rounded-[1.6rem] border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] bg-white/95" 
          style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 py-0.5 px-1 min-w-[320px] sm:min-w-[360px]">
            {items.map((item) => {
              const isActive = vistaActiva === item.id
              const Icon = item.icon
              
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 relative flex-1 group"
                >
                  {/* Indicador activo con gradiente suave */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBottom"
                      className="absolute inset-x-1 inset-y-1 rounded-xl bg-gradient-to-b from-[#e8f5ee] to-[#d4ede0] border border-[#006d38]/10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <Icon 
                    className="w-[20px] h-[20px] relative z-10 transition-all duration-300 group-hover:scale-110"
                    strokeWidth={isActive ? 2.5 : 1.5}
                    style={{ color: isActive ? '#006d38' : '#64748b' }}
                  />
                  <span 
                    className={`font-body text-[10px] tracking-tight relative z-10 transition-colors duration-300 ${isActive ? 'font-black' : 'font-medium'}`}
                    style={{ color: isActive ? '#006d38' : '#64748b' }}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
