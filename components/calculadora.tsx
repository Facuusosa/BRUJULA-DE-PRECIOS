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

export function Calculadora({ producto, mayorista, precioInicial, isOpen, onClose, onGuardar }: CalculadoraProps) {
  const [precioCompra, setPrecioCompra] = useState<string>(
    (Math.round(precioInicial * 100) / 100).toString()
  )
  const [margen, setMargen] = useState(35)
  const [mayoristaActual, setMayoristaActual] = useState(mayorista)

  useEffect(() => {
    setPrecioCompra((Math.round(precioInicial * 100) / 100).toString())
    setMayoristaActual(mayorista)
  }, [precioInicial, mayorista])

  const numPrecioCompra = Number(precioCompra) || 0
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[480px] rounded-2xl z-[100] max-h-[90vh] overflow-y-auto pt-6"
            style={{ background: '#141414', border: '1px solid #2a2a2a' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <X className="w-5 h-5" style={{ color: '#6b7280' }} />
            </button>

            <div className="px-5 pb-8">
              <div className="mb-6">
                <h3 className="font-heading font-bold text-lg pr-8" style={{ color: '#f7f7f7' }}>
                  {producto?.nombre}
                </h3>

                {producto?.precios && producto.precios.length > 0 ? (
                  <div className="mt-3">
                    <span className="font-body text-xs block mb-2 font-medium" style={{ color: '#6b7280' }}>
                      Comparar precios en:
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {producto.precios.map(p => {
                        const isSelected = p.mayorista === mayoristaActual
                        return (
                          <button
                            key={p.mayorista}
                            onClick={() => {
                              setMayoristaActual(p.mayorista)
                              setPrecioCompra((Math.round(p.precio * 100) / 100).toString())
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '6px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                              border: `1.5px solid ${isSelected ? '#d4a574' : '#2a2a2a'}`,
                              background: isSelected ? '#d4a574' : '#222222',
                              color: isSelected ? '#0a0a0a' : '#f7f7f7',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            <span style={{ fontSize: '11px', fontWeight: isSelected ? 700 : 500 }}>
                              {p.mayorista}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 800 }}>
                              ${Math.round(p.precio)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="font-body text-sm mt-1" style={{ color: '#6b7280' }}>
                    Comprando en {mayoristaActual}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="font-body text-sm block mb-2" style={{ color: '#6b7280' }}>
                  Precio de compra
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-heading font-bold text-lg" style={{ color: '#f7f7f7' }}>
                    $
                  </span>
                  <input
                    type="number"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="w-full h-14 pl-8 pr-4 rounded-xl font-heading font-bold text-lg focus:outline-none"
                    style={{
                      backgroundColor: '#1a1a1a', color: '#f7f7f7',
                      border: '1px solid #2a2a2a',
                    }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-body text-sm" style={{ color: '#6b7280' }}>
                    Margen de ganancia
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={margen}
                      onChange={(e) => setMargen(Math.min(100, Math.max(10, Number(e.target.value))))}
                      className="w-16 h-10 px-2 rounded-lg font-heading font-bold text-center focus:outline-none"
                      style={{ backgroundColor: '#1a1a1a', color: '#d4a574', border: '1px solid #2a2a2a' }}
                    />
                    <span className="font-heading font-bold" style={{ color: '#d4a574' }}>%</span>
                  </div>
                </div>
                <Slider
                  value={[margen]}
                  onValueChange={(value) => setMargen(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="[&_[data-slot=slider-thumb]]:bg-[#d4a574] [&_[data-slot=slider-thumb]]:border-[#d4a574] [&_[data-slot=slider-range]]:bg-[#d4a574]"
                />
              </div>

              <div className="p-4 rounded-2xl mb-6" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-body text-sm" style={{ color: '#6b7280' }}>
                    Precio de venta sugerido
                  </span>
                  <motion.span
                    key={precioVenta}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-heading font-extrabold text-2xl sm:text-3xl text-right"
                    style={{ color: '#d4a574' }}
                  >
                    {formatearPrecio(precioVenta)}
                  </motion.span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-body text-sm" style={{ color: '#6b7280' }}>
                    Tu ganancia por unidad
                  </span>
                  <motion.span
                    key={ganancia}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-heading font-bold text-xl"
                    style={{ color: '#f7f7f7' }}
                  >
                    {formatearPrecio(ganancia)}
                  </motion.span>
                </div>
              </div>

              <button
                onClick={handleGuardar}
                className="w-full h-14 rounded-xl font-heading font-bold transition-transform active:scale-95"
                style={{ backgroundColor: '#d4a574', color: '#0a0a0a' }}
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
