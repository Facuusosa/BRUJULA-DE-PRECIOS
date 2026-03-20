'use client'

import { motion } from 'framer-motion'
import Particles from './reactbits/Backgrounds/Particles/Particles'
import CountUp from './reactbits/TextAnimations/CountUp/CountUp'

interface ImpactCardProps {
  ahorroTotal: number
  cantidadBombas: number
}

// Card de impacto verde con animación de contador y partículas
export function ImpactCard({ ahorroTotal, cantidadBombas }: ImpactCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-4 mt-4 p-5 rounded-3xl relative overflow-hidden"
      style={{ backgroundColor: '#006d38' }}
    >
      {/* Patrón decorativo y partículas */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleCount={50}
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          speed={0.2}
          particleSpread={5}
          sizeRandomness={1}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={80}
        />
      </div>
      
      <div className="relative z-10 flex items-start justify-between">
        {/* Contenido izquierdo */}
        <div>
          {/* Label */}
          <span className="font-body text-xs text-white/75">
            Ahorro potencial hoy
          </span>
          
          {/* Número grande animado */}
          <motion.div className="mt-1 flex items-center">
            <CountUp
              from={0}
              to={47200}
              duration={2}
              separator="."
              prefix="$"
              className="font-heading font-extrabold text-white"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)' }}
            />
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
