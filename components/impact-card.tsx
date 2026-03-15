'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

interface ImpactCardProps {
  ahorroTotal: number
  cantidadBombas: number
}

// Card de impacto verde con animación de contador
export function ImpactCard({ ahorroTotal, cantidadBombas }: ImpactCardProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  
  useEffect(() => {
    const animation = animate(count, ahorroTotal, {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    })
    
    return animation.stop
  }, [ahorroTotal, count])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-4 mt-4 p-5 rounded-3xl relative overflow-hidden"
      style={{ backgroundColor: '#006d38' }}
    >
      {/* Patrón decorativo sutil */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)'
        }}
      />
      
      <div className="relative flex items-start justify-between">
        {/* Contenido izquierdo */}
        <div>
          {/* Label */}
          <span className="font-body text-xs text-white/75">
            Ahorro potencial hoy
          </span>
          
          {/* Número grande animado */}
          <motion.div className="mt-1">
            <span 
              className="font-heading font-extrabold text-white"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)' }}
            >
              $<motion.span>{rounded}</motion.span>
            </span>
          </motion.div>
          
          {/* Subtítulo */}
          <span className="font-body text-[11px] text-white/60 mt-1 block">
            vs comprar todo en el mayorista más caro
          </span>
        </div>
        
        {/* Badge bombas */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="px-3 py-2 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <span className="font-heading font-bold text-white text-sm whitespace-nowrap">
            🔥 {cantidadBombas} bombas hoy
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}
