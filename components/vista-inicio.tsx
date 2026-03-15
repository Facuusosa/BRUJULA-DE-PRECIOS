'use client'

import { motion } from 'framer-motion'
import { ImpactCard } from './impact-card'
import { BombaCard } from './bomba-card'
import { CambiosRecientes } from './cambios-recientes'
import { calcularBombas, calcularAhorroTotal, ProductoBomba } from '@/lib/data'

interface VistaInicioProps {
  onSelectBomba?: (bomba: ProductoBomba) => void
}

// Vista principal de Inicio con bombas del día
export function VistaInicio({ onSelectBomba }: VistaInicioProps) {
  const bombas = calcularBombas()
  const ahorroTotal = calcularAhorroTotal()
  
  // Animación stagger para el título
  const palabras = ['🔥', 'Top', 'bombas', 'de', 'hoy']
  
  return (
    <div className="pb-24">
      {/* Card de impacto */}
      <ImpactCard ahorroTotal={ahorroTotal} cantidadBombas={bombas.length} />
      
      {/* Sección Bombas del día */}
      <div className="px-4 mt-6">
        {/* Título animado palabra por palabra */}
        <h2 className="font-heading font-semibold text-xl text-[#0f172a] mb-4 flex flex-wrap gap-1">
          {palabras.map((palabra, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.2 + index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {palabra}
            </motion.span>
          ))}
        </h2>
        
        {/* Lista de bombas */}
        <div className="flex flex-col gap-3">
          {bombas.map((bomba, index) => (
            <BombaCard 
              key={bomba.id} 
              bomba={bomba} 
              index={index}
              onClick={() => onSelectBomba?.(bomba)}
            />
          ))}
        </div>
      </div>
      
      {/* Cambios recientes */}
      <CambiosRecientes />
    </div>
  )
}
