'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Plus, TrendingDown, Check } from 'lucide-react'
import { Producto, formatearPrecio, Precio } from '@/lib/data'

interface ModalProductoProps {
  isOpen: boolean
  onClose: () => void
  product: Producto | null
  origen: { x: number; y: number }
  onCalcular?: (producto: Producto, mayorista: string, precio: number) => void
}

export function ModalProducto({ isOpen, onClose, product, origen, onCalcular }: ModalProductoProps) {
  const [selectedWholesaler, setSelectedWholesaler] = useState<string>('')
  
  // Reset selected wholesaler when product changes
  useEffect(() => {
    if (product) {
      const bestPrice = [...product.precios].sort((a, b) => a.precio - b.precio)[0]
      setSelectedWholesaler(bestPrice.mayorista)
    }
  }, [product])

  if (!product) return null

  const selectedPrice = product.precios.find(p => p.mayorista === selectedWholesaler) || product.precios[0]
  const otherPrices = product.precios.filter(p => p.mayorista !== selectedWholesaler)
  const isBestPrice = selectedPrice.precio === Math.min(...product.precios.map(p => p.precio))

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-all"
          />

          {/* Bubble Animation Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{
                x: origen.x - (typeof window !== 'undefined' ? window.innerWidth : 0) / 2,
                y: origen.y - (typeof window !== 'undefined' ? window.innerHeight : 0) / 2,
                width: 40,
                height: 40,
                borderRadius: '50%',
                opacity: 0,
                scale: 0.5
              }}
              animate={{
                x: 0,
                y: 0,
                width: '100%',
                maxWidth: '440px',
                height: 'auto',
                borderRadius: '24px',
                opacity: 1,
                scale: 1,
                pointerEvents: 'auto'
              }}
              exit={{
                scale: 1.15,
                opacity: 0,
                transition: { duration: 0.3, ease: 'easeIn' }
              }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] // Custom easeOut for premium feel
              }}
              className="bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <span className="font-heading font-bold text-slate-400 text-[10px] uppercase tracking-widest">
                  Detalle del Producto
                </span>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                >
                  <X size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                </button>
              </div>

              {/* Contenido Scrollable */}
              <div className="px-6 py-4 overflow-y-auto max-h-[75vh] custom-scrollbar">
                
                {/* Foto enfocada */}
                <div className="relative aspect-square w-full max-w-[220px] mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center p-4 border border-slate-100 group">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.nombre}
                      className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-7xl">{product.emoji}</span>
                  )}
                  
                  {isBestPrice && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 bg-[#006d38] text-white px-2 py-0.5 rounded-full text-[8px] font-black shadow-lg flex items-center gap-1"
                    >
                      <Check size={9} strokeWidth={4} /> MEJOR PRECIO
                    </motion.div>
                  )}
                </div>

                {/* Info Simplificada */}
                <div className="mb-6">
                  <span className="font-body text-[10px] text-slate-400 font-bold tracking-widest uppercase block mb-0.5">
                    SKU: {product.id}
                  </span>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 leading-[1.1] tracking-tight mb-4">
                    {product.nombre.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h2>
                </div>

                {/* Selector de precios (Tabs) */}
                <div className="flex p-0.5 bg-slate-100 rounded-lg mb-4">
                  {product.precios.map((p) => (
                    <button
                      key={p.mayorista}
                      onClick={() => setSelectedWholesaler(p.mayorista)}
                      className={`flex-1 py-2 rounded-md text-[10px] font-black uppercase tracking-tighter transition-all ${
                        selectedWholesaler === p.mayorista 
                          ? 'bg-white text-[#006d38] shadow-sm' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {p.mayorista}
                    </button>
                  ))}
                </div>

                {/* Precio simple - Premium Clean Look */}
                <div 
                  className={`p-6 rounded-[1.5rem] border transition-all duration-500 overflow-hidden relative ${
                    isBestPrice 
                      ? 'bg-[#ecfdf5] border-[#10b981]/20' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isBestPrice && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#10b981]/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                  )}
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-slate-500 font-body text-[10px] font-black uppercase tracking-wider">Precio {selectedWholesaler}</span>
                    {selectedPrice.tipo === 'oferta' && (
                      <span className="bg-[#ff4700] text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm shadow-[#ff4700]/15">
                        <span className="animate-pulse">🔥</span> OFERTA
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 relative z-10">
                    <span className="font-heading font-black text-4xl text-slate-900 tracking-tighter">
                      $ {formatearPrecio(selectedPrice.precio).replace('$\u00a0', '')}
                    </span>
                    {isBestPrice && (
                      <span className="text-[#059669] font-black text-[10px] uppercase ml-1 flex items-center gap-1">
                        <Check size={12} strokeWidth={3} /> RECOMENDADO
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción (fijos abajo) */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex gap-2 sm:gap-3">
                <button 
                  className="flex-1 bg-[#ff4700] text-white h-11 sm:h-12 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-normal sm:tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-[#e64000] shadow-lg shadow-[#ff4700]/15 transition-all active:scale-[0.98]"
                  onClick={() => onCalcular?.(product, selectedWholesaler, selectedPrice.precio)}
                >
                  <span className="text-xs sm:text-sm">🔥</span> Calcular
                </button>
                <button className="flex-[1.5] bg-[#006d38] text-white h-11 sm:h-12 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-normal sm:tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-[#005a2e] shadow-lg shadow-[#006d38]/15 transition-all active:scale-[0.98]">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} /> Agregar lista
                </button>
              </div>


            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
