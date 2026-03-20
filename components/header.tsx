'use client'

import { motion, useScroll, useVelocity, useTransform, useSpring } from 'framer-motion'

// Header sticky con blur, badge "En vivo" y efecto Scroll Velocity
export function Header() {
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  
  // Transformamos la velocidad en un valor de skew (inclinación) para el logo
  const skewXRaw = useTransform(scrollVelocity, [-1000, 1000], [-10, 10])
  const skewX = useSpring(skewXRaw, { stiffness: 400, damping: 30 })

  // También un ligero desplazamiento horizontal basado en la velocidad
  const xRaw = useTransform(scrollVelocity, [-1000, 1000], [-15, 15])
  const x = useSpring(xRaw, { stiffness: 400, damping: 30 })

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo / Nombre con Velocity Effect */}
        <motion.div 
          style={{ skewX, x }}
          className="flex flex-col"
        >
          <h1 className="font-heading font-black text-lg text-[#0f172a] tracking-tight leading-none">
            BRÚJULA <span className="text-[#006d38]">DE PRECIOS</span>
          </h1>
        </motion.div>
        
        {/* Removed Sincronizado badge per user request */}
      </div>
    </header>
  )
}

