'use client'

import { motion } from 'framer-motion'
import { cambiosRecientes } from '@/lib/data'

// Sección de cambios recientes de precios
export function CambiosRecientes() {
  return (
    <div className="px-4 mt-6">
      <h3 
        className="font-body text-[11px] uppercase tracking-wider mb-3"
        style={{ color: '#94a3b8' }}
      >
        Cambios recientes
      </h3>
      
      <div className="flex flex-col gap-2">
        {cambiosRecientes.map((cambio, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-3 py-2"
          >
            {/* Placeholder circular gris */}
            <div 
              className="w-8 h-8 rounded-lg flex-shrink-0"
              style={{ backgroundColor: '#f2f4f6' }}
            />
            
            {/* Info del cambio */}
            <div className="flex-1 min-w-0">
              <p className="font-heading font-medium text-sm text-[#0f172a] truncate">
                {cambio.producto}
              </p>
              <p className="font-body text-[11px] text-[#64748b]">
                {cambio.mayorista} · {cambio.fecha}
              </p>
            </div>
            
            {/* Badge de cambio */}
            <div 
              className="px-2 py-1 rounded-md"
              style={{ 
                backgroundColor: cambio.cambio < 0 ? '#e8f5ee' : '#fff8ed',
              }}
            >
              <span 
                className="font-heading font-bold text-xs"
                style={{ color: cambio.cambio < 0 ? '#006d38' : '#fea619' }}
              >
                {cambio.cambio < 0 ? '↓' : '↑'}{Math.abs(cambio.cambio)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
