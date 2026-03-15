'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X } from 'lucide-react'
import { productos, sectores, Producto, formatearPrecio } from '@/lib/data'
import { Calculadora } from './calculadora'

interface VistaCompararProps {
  onGuardarEnLista?: (data: { producto: Producto; mayorista: string; precioCompra: number; margen: number; precioVenta: number; ganancia: number }) => void
}

// Vista de comparación de precios con sidebar de categorías
export function VistaComparar({ onGuardarEnLista }: VistaCompararProps) {
  const [sectorActivo, setSectorActivo] = useState('Almacén')
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)
  
  // Estado para calculadora
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [mayoristaSelecc, setMayoristaSelecc] = useState('')
  const [precioSelecc, setPrecioSelecc] = useState(0)
  
  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const matchSector = p.sector === sectorActivo
    const matchSubcat = !subcategoriaActiva || p.subcategoria === subcategoriaActiva
    const matchBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return matchSector && matchSubcat && matchBusqueda
  })
  
  const sectorActual = sectores.find(s => s.nombre === sectorActivo)
  
  // Abrir calculadora con el producto seleccionado
  const handleSelectPrecio = (producto: Producto, mayorista: string, precio: number) => {
    setProductoSeleccionado(producto)
    setMayoristaSelecc(mayorista)
    setPrecioSelecc(precio)
  }
  
  const handleGuardar = (data: { precioCompra: number; margen: number; precioVenta: number; ganancia: number }) => {
    if (productoSeleccionado) {
      onGuardarEnLista?.({
        producto: productoSeleccionado,
        mayorista: mayoristaSelecc,
        ...data
      })
    }
    setProductoSeleccionado(null)
  }
  
  return (
    <div className="flex min-h-screen pb-24">
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-44 fixed left-0 top-14 bottom-20 overflow-y-auto" style={{ backgroundColor: '#f2f4f6' }}>
        <div className="py-4">
          {sectores.map((sector) => (
            <div key={sector.nombre}>
              <button
                onClick={() => {
                  setSectorActivo(sector.nombre)
                  setSubcategoriaActiva(null)
                }}
                className={`w-full text-left px-4 py-3 transition-all duration-200 flex items-center gap-2 ${
                  sectorActivo === sector.nombre 
                    ? 'font-heading font-semibold' 
                    : 'font-body'
                }`}
                style={{
                  backgroundColor: sectorActivo === sector.nombre ? '#e8f5ee' : 'transparent',
                  borderLeft: sectorActivo === sector.nombre ? '3px solid #006d38' : '3px solid transparent',
                  color: sectorActivo === sector.nombre ? '#006d38' : '#0f172a',
                  transform: sectorActivo === sector.nombre ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <span>{sector.emoji}</span>
                <span className="text-sm">{sector.nombre}</span>
              </button>
              
              {/* Subcategorías */}
              {sectorActivo === sector.nombre && (
                <div className="pl-4">
                  {sector.subcategorias.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSubcategoriaActiva(subcategoriaActiva === sub ? null : sub)}
                      className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors"
                      style={{
                        color: subcategoriaActiva === sub ? '#006d38' : '#64748b'
                      }}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: subcategoriaActiva === sub ? '#006d38' : '#94a3b8' }}
                      />
                      <span className="font-body text-sm">{sub}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>
      
      {/* Botón menú mobile */}
      <button
        onClick={() => setMenuAbierto(true)}
        className="md:hidden fixed top-16 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-xl shadow-sm"
        style={{ backgroundColor: '#ffffff' }}
      >
        <Menu className="w-5 h-5 text-[#0f172a]" />
        <span className="font-body text-sm text-[#0f172a]">Categorías</span>
      </button>
      
      {/* Panel móvil de categorías */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuAbierto(false)}
              className="md:hidden fixed inset-0 bg-black/30 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] overflow-auto"
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-[#d1d5db]" />
              </div>
              <button
                onClick={() => setMenuAbierto(false)}
                className="absolute top-4 right-4 p-2"
              >
                <X className="w-5 h-5 text-[#64748b]" />
              </button>
              
              <div className="px-4 pb-8">
                <h3 className="font-heading font-bold text-lg mb-4">Categorías</h3>
                {sectores.map((sector) => (
                  <button
                    key={sector.nombre}
                    onClick={() => {
                      setSectorActivo(sector.nombre)
                      setSubcategoriaActiva(null)
                      setMenuAbierto(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl mb-2 flex items-center gap-3 transition-all ${
                      sectorActivo === sector.nombre ? 'font-heading font-semibold' : 'font-body'
                    }`}
                    style={{
                      backgroundColor: sectorActivo === sector.nombre ? '#e8f5ee' : '#f2f4f6',
                      color: sectorActivo === sector.nombre ? '#006d38' : '#0f172a'
                    }}
                  >
                    <span className="text-xl">{sector.emoji}</span>
                    <span>{sector.nombre}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Contenido principal */}
      <main className="flex-1 md:ml-44 pt-14 md:pt-4 px-4">
        {/* Buscador */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#006d38]"
            style={{ backgroundColor: '#f2f4f6' }}
          />
        </div>
        
        {/* Chips de subcategorías */}
        {sectorActual && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <button
              onClick={() => setSubcategoriaActiva(null)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-body text-sm transition-all ${
                !subcategoriaActiva ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: !subcategoriaActiva ? '#006d38' : '#f2f4f6',
                color: !subcategoriaActiva ? '#ffffff' : '#64748b'
              }}
            >
              Todos
            </button>
            {sectorActual.subcategorias.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubcategoriaActiva(subcategoriaActiva === sub ? null : sub)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap font-body text-sm transition-all ${
                  subcategoriaActiva === sub ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: subcategoriaActiva === sub ? '#006d38' : '#f2f4f6',
                  color: subcategoriaActiva === sub ? '#ffffff' : '#64748b'
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
        
        {/* Lista de productos */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {productosFiltrados.map((producto, index) => {
              // Encontrar el mejor precio
              const precios = producto.precios.map(p => p.precio)
              const minPrecio = Math.min(...precios)
              
              return (
                <motion.div
                  key={producto.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4"
                >
                  {/* Nombre y timestamp */}
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-heading font-semibold text-[15px] text-[#0f172a]">
                      {producto.nombre}
                    </h4>
                    <span className="font-body text-[11px] text-[#64748b]">
                      Hace 2h
                    </span>
                  </div>
                  
                  {/* Chips de precios */}
                  <div className="flex flex-wrap gap-2">
                    {producto.precios.map((precio) => {
                      const esGanador = precio.precio === minPrecio
                      const esOferta = precio.tipo === 'oferta'
                      
                      return (
                        <button
                          key={precio.mayorista}
                          onClick={() => handleSelectPrecio(producto, precio.mayorista, precio.precio)}
                          className="flex flex-col items-start px-3 py-2 rounded-xl transition-transform active:scale-95"
                          style={{
                            backgroundColor: esGanador ? '#e8f5ee' : esOferta ? '#fff8ed' : '#f2f4f6',
                            border: esOferta ? '1.5px solid #fea619' : 'none'
                          }}
                        >
                          <span 
                            className={`font-heading text-[11px] ${esGanador || esOferta ? 'font-semibold' : ''}`}
                            style={{ color: '#64748b' }}
                          >
                            {precio.mayorista}
                          </span>
                          <span 
                            className={`font-heading font-bold ${esGanador ? 'text-lg' : 'text-base'}`}
                            style={{ color: esGanador ? '#006d38' : '#0f172a' }}
                          >
                            {formatearPrecio(precio.precio)}
                          </span>
                          {esGanador && (
                            <span className="font-body text-[9px]" style={{ color: '#006d38' }}>
                              ✓ Mejor precio
                            </span>
                          )}
                          {esOferta && !esGanador && (
                            <span 
                              className="font-body font-bold text-[9px]"
                              style={{ color: '#fea619' }}
                            >
                              OFERTA
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          
          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <span className="font-body text-[#64748b]">
                No hay productos en esta categoría
              </span>
            </div>
          )}
        </div>
      </main>
      
      {/* Calculadora */}
      <Calculadora
        producto={productoSeleccionado}
        mayorista={mayoristaSelecc}
        precioInicial={precioSelecc}
        isOpen={!!productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
        onGuardar={handleGuardar}
      />
    </div>
  )
}
