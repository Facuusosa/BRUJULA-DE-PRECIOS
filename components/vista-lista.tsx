'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, X, ArrowRight } from 'lucide-react'
import { ItemLista, formatearPrecio } from '@/lib/data'

interface VistaListaProps {
  items: ItemLista[]
  onEliminar: (index: number) => void
  onIrAComparar: () => void
}

// Vista de Mi Lista con productos guardados
export function VistaLista({ items, onEliminar, onIrAComparar }: VistaListaProps) {
  // Calcular ahorro total
  const ahorroTotal = items.reduce((acc, item) => acc + item.ganancia, 0)
  
  // Agrupar por sector
  const itemsPorSector = items.reduce((acc, item, index) => {
    const sector = item.producto.sector
    if (!acc[sector]) acc[sector] = []
    acc[sector].push({ ...item, originalIndex: index })
    return acc
  }, {} as Record<string, (ItemLista & { originalIndex: number })[]>)
  
  // Estado vacío
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: '#e8f5ee' }}
        >
          <ShoppingBag className="w-6 h-6" style={{ color: '#006d38' }} />
        </motion.div>
        
        <h3 className="font-heading font-semibold text-base text-[#0f172a] text-center mb-2">
          Todavía no guardaste nada
        </h3>
        
        <p className="font-body text-sm text-[#64748b] text-center mb-6">
          Compará precios y guardá los productos que te interesen
        </p>
        
        <button
          onClick={onIrAComparar}
          className="h-14 px-6 rounded-xl font-heading font-bold text-white flex items-center gap-2 transition-transform active:scale-95"
          style={{ backgroundColor: '#006d38' }}
        >
          Ir a comparar precios
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }
  
  return (
    <div className="pb-24 pt-4">
      {/* Card de ahorro total */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 p-4 rounded-2xl mb-6"
        style={{ backgroundColor: '#006d38' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-body text-xs text-white/75 block">
              Ganancia total estimada
            </span>
            <span className="font-heading font-extrabold text-2xl text-white">
              {formatearPrecio(ahorroTotal)}
            </span>
          </div>
          <span className="font-body text-sm text-white/75">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
      </motion.div>
      
      {/* Lista por sectores */}
      <div className="px-4">
        {Object.entries(itemsPorSector).map(([sector, sectorItems]) => (
          <div key={sector} className="mb-6">
            {/* Label del sector */}
            <span 
              className="font-body text-[10px] uppercase tracking-wider block mb-2"
              style={{ color: '#64748b' }}
            >
              {sector}
            </span>
            
            {/* Items del sector */}
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {sectorItems.map((item) => (
                  <motion.div
                    key={item.originalIndex}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="bg-white rounded-xl p-3 flex items-center gap-3"
                  >
                    {/* Emoji */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: item.producto.colorSector }}
                    >
                      <span className="text-xl">{item.producto.emoji}</span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-semibold text-sm text-[#0f172a] truncate">
                        {item.producto.nombre}
                      </h4>
                      <p className="font-body text-[11px] text-[#64748b]">
                        {item.mayorista}
                      </p>
                    </div>
                    
                    {/* Precio y ganancia */}
                    <div className="text-right flex-shrink-0">
                      <span 
                        className="font-heading font-bold text-sm block"
                        style={{ color: '#006d38' }}
                      >
                        {formatearPrecio(item.precioVenta)}
                      </span>
                      <span 
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold inline-block mt-0.5"
                        style={{ backgroundColor: '#e8f5ee', color: '#006d38' }}
                      >
                        +{formatearPrecio(item.ganancia)}
                      </span>
                    </div>
                    
                    {/* Botón eliminar */}
                    <button
                      onClick={() => onEliminar(item.originalIndex)}
                      className="p-2 rounded-lg flex-shrink-0 transition-colors hover:bg-red-50"
                    >
                      <X className="w-4 h-4 text-[#ef4444]" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
