'use client'

import { motion } from 'framer-motion'

// Header sticky con blur y badge "En vivo"
export function Header() {
  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo / Nombre */}
        <h1 className="font-heading font-bold text-lg text-[#0f172a]">
          BRÚJULA MAYORISTA
        </h1>
        
        {/* Badge En Vivo con animación */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: '#e8f5ee' }}
        >
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#006d38' }}
          />
          <span 
            className="font-body text-xs font-medium"
            style={{ color: '#006d38' }}
          >
            En vivo
          </span>
        </motion.div>
      </div>
    </header>
  )
}
