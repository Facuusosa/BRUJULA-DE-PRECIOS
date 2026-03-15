'use client'

import { motion } from 'framer-motion'
import { ProductoBomba, formatearPrecio } from '@/lib/data'

interface BombaCardProps {
  bomba: ProductoBomba
  index: number
  onClick?: () => void
}

// Componente de card de bomba - diseñado para GRITAR que es una oportunidad
export function BombaCard({ bomba, index, onClick }: BombaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-white cursor-pointer"
      style={{
        // Borde izquierdo naranja bomba de 4px + sombra con tinte naranja sutil
        boxShadow: 'inset 4px 0 0 0 #ff4700, 0 4px 20px rgba(255,71,0,0.12), 0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      <div className="p-4">
        {/* Fila superior: emoji + info + badge bomba */}
        <div className="flex items-start gap-3">
          {/* Emoji del producto con fondo del sector */}
          <div 
            className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: bomba.colorSector }}
          >
            <span className="text-3xl">{bomba.emoji}</span>
          </div>
          
          {/* Info del producto */}
          <div className="flex-1 min-w-0">
            <span 
              className="text-[10px] font-heading font-semibold uppercase tracking-wider"
              style={{ color: '#64748b' }}
            >
              {bomba.sector}
            </span>
            <h3 className="font-heading font-semibold text-[15px] text-[#0f172a] leading-tight mt-0.5 line-clamp-2">
              {bomba.nombre}
            </h3>
            <p className="text-[12px] font-body text-[#64748b] mt-0.5">
              en {bomba.mayoristaMejorPrecio}
            </p>
          </div>
          
          {/* Badge BOMBA con animación de pulso */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg"
            style={{ backgroundColor: '#ff4700' }}
          >
            <span className="font-body font-bold text-[10px] text-white whitespace-nowrap">
              BOMBA 🔥
            </span>
          </motion.div>
        </div>
        
        {/* Fila inferior: precio + ahorro */}
        <div className="flex items-end justify-between mt-3">
          {/* Precio ganador */}
          <span 
            className="font-heading font-extrabold text-2xl"
            style={{ color: '#006d38' }}
          >
            {formatearPrecio(bomba.precioMinimo)}
          </span>
          
          {/* Badge de ahorro porcentual */}
          <div 
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#ff4700' }}
          >
            <span className="font-body font-bold text-[11px] text-white">
              -{bomba.ahorroVsMaximo}% vs más caro
            </span>
          </div>
        </div>
        
        {/* Mensaje de ahorro en plata */}
        <div className="mt-2">
          <span 
            className="font-body text-[11px]"
            style={{ color: '#006d38' }}
          >
            + Ahorrás {formatearPrecio(bomba.ahorroEnPlata)} comprando acá
          </span>
        </div>
        
        {/* Indicador de oferta si aplica */}
        {bomba.tipoMejorPrecio === 'oferta' && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.08 }}
            className="absolute top-3 right-24 px-1.5 py-0.5 rounded text-[9px] font-bold"
            style={{ 
              backgroundColor: '#fff8ed', 
              color: '#fea619',
              border: '1.5px solid #fea619'
            }}
          >
            OFERTA
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
