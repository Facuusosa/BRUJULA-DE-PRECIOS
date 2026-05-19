'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Producto, formatearPrecio } from '@/lib/data'
import { Slider } from '@/components/ui/slider'

interface CalculadoraProps {
  producto: Producto | null
  mayorista: string
  precioInicial: number
  isOpen: boolean
  onClose: () => void
  onGuardar?: (data: { precioCompra: number; margen: number; precioVenta: number; ganancia: number }) => void
}

// Panel calculadora que aparece desde abajo
export function Calculadora({ producto, mayorista, precioInicial, isOpen, onClose, onGuardar }: CalculadoraProps) {
  const [precioCompra, setPrecioCompra] = useState<string>(
    (Math.round(precioInicial * 100) / 100).toString()
  )
  const [margen, setMargen] = useState(35)
  const [mayoristaActual, setMayoristaActual] = useState(mayorista)
  
  // Actualizar precio cuando cambia el producto
  useEffect(() => {
    setPrecioCompra((Math.round(precioInicial * 100) / 100).toString())
    setMayoristaActual(mayorista)
  }, [precioInicial, mayorista])
  
  // Calcular precio de venta y ganancia
  const numPrecioCompra = Number(precioCompra) || 0;
  const precioVenta = Math.round(numPrecioCompra * (1 + margen / 100))
  const ganancia = precioVenta - numPrecioCompra
  
  const handleGuardar = () => {
    onGuardar?.({ precioCompra: numPrecioCompra, margen, precioVenta, ganancia })
    onClose()
  }
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[480px] bg-white rounded-[2rem] z-[100] max-h-[90vh] overflow-y-auto shadow-2xl pt-6"
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full"
              style={{ backgroundColor: '#f2f4f6' }}
            >
              <X className="w-5 h-5 text-[#64748b]" />
            </button>
            
            <div className="px-5 pb-8">
              {/* Info del producto */}
              <div className="mb-6">
                <h3 className="font-heading font-bold text-lg text-[#0f172a] pr-8">
                  {producto?.nombre}
                </h3>
                
                {/* Selector de Mayorista */}
                {producto?.precios && producto.precios.length > 0 ? (
                  <div className="mt-3">
                    <span className="font-body text-xs text-[#64748b] block mb-2 font-medium">Comparar precios en:</span>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {producto.precios.map(p => {
                        const isSelected = p.mayorista === mayoristaActual;
                        return (
                          <button
                            key={p.mayorista}
                            onClick={() => {
                              setMayoristaActual(p.mayorista);
                              setPrecioCompra((Math.round(p.precio * 100) / 100).toString());
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap border transition-all ${
                              isSelected 
                                ? 'bg-[#006d38] text-white border-[#006d38] shadow-md shadow-[#006d38]/20' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`font-body text-[11px] ${isSelected ? 'font-bold' : 'font-medium'}`}>
                              {p.mayorista}
                            </span>
                            <span className={`font-heading text-[12px] font-black ${isSelected ? 'text-white/90' : 'text-slate-800'}`}>
                              ${Math.round(p.precio)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-sm text-[#64748b] mt-1">
                    Comprando en {mayoristaActual}
                  </p>
                )}
              </div>
              
              {/* Campo precio de compra */}
              <div className="mb-6">
                <label className="font-body text-sm text-[#64748b] block mb-2">
                  Precio de compra
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-lg text-[#0f172a]">
                    $
                  </span>
                  <input
                    type="number"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="w-full h-14 pl-8 pr-4 rounded-xl font-heading font-bold text-lg text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#006d38]"
                    style={{ backgroundColor: '#f2f4f6' }}
                  />
                </div>
              </div>
              
              {/* Slider margen */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-body text-sm text-[#64748b]">
                    Margen de ganancia
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={margen}
                      onChange={(e) => setMargen(Math.min(100, Math.max(10, Number(e.target.value))))}
                      className="w-16 h-10 px-2 rounded-lg font-heading font-bold text-center text-[#006d38] focus:outline-none focus:ring-2 focus:ring-[#006d38]"
                      style={{ backgroundColor: '#e8f5ee' }}
                    />
                    <span className="font-heading font-bold text-[#006d38]">%</span>
                  </div>
                </div>
                <Slider
                  value={[margen]}
                  onValueChange={(value) => setMargen(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="[&_[data-slot=slider-thumb]]:bg-[#006d38] [&_[data-slot=slider-thumb]]:border-[#006d38] [&_[data-slot=slider-range]]:bg-[#006d38]"
                />
              </div>
              
              {/* Resultados animados */}
              <div className="p-4 rounded-2xl mb-6" style={{ backgroundColor: '#e8f5ee' }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-body text-sm text-[#64748b]">
                    Precio de venta sugerido
                  </span>
                  <motion.span
                    key={precioVenta}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-heading font-extrabold text-2xl sm:text-3xl text-right"
                    style={{ color: '#006d38' }}
                  >
                    {formatearPrecio(precioVenta)}
                  </motion.span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-[#64748b]">
                    Tu ganancia por unidad
                  </span>
                  <motion.span
                    key={ganancia}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-heading font-bold text-xl"
                    style={{ color: '#006d38' }}
                  >
                    {formatearPrecio(ganancia)}
                  </motion.span>
                </div>
              </div>
              
              {/* Botón guardar */}
              <button
                onClick={handleGuardar}
                className="w-full h-14 rounded-xl font-heading font-bold text-white transition-transform active:scale-98"
                style={{ backgroundColor: '#006d38' }}
              >
                Guardar en mi lista
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
