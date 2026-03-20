'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X } from 'lucide-react'
import { productos, sectores, Producto, formatearPrecio } from '@/lib/data'
import { Calculadora } from './calculadora'
import { ModalProducto } from './modal-producto'
import { useModalProducto } from '@/hooks/use-modal-producto'

interface VistaCompararProps {
  onGuardarEnLista?: (data: { producto: Producto; mayorista: string; precioCompra: number; margen: number; precioVenta: number; ganancia: number }) => void
  sectorInicial?: string
}

// Vista de comparación de precios con sidebar de categorías
export function VistaComparar({ onGuardarEnLista, sectorInicial }: VistaCompararProps) {
  const [sectorActivo, setSectorActivo] = useState(sectorInicial || 'Almacén')
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string | null>(null)
  const [subcategoriasAbiertas, setSubcategoriasAbiertas] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mayoristaFiltro, setMayoristaFiltro] = useState<'Todos' | 'Maxiconsumo' | 'Yaguar'>('Todos')
  const [menuAbierto, setMenuAbierto] = useState(false)
  
  const { isOpen, selectedProduct, origen, openModal, closeModal } = useModalProducto()

  // Sincronizar sector cuando el usuario navega desde un chip de vista-inicio
  useEffect(() => {
    if (sectorInicial) {
      setSectorActivo(sectorInicial)
      setSubcategoriaActiva(null)
    }
  }, [sectorInicial])

  // Estado para calculadora
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [mayoristaSelecc, setMayoristaSelecc] = useState('')
  const [precioSelecc, setPrecioSelecc] = useState(0)
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const PRODUCTOS_POR_PAGINA = 20

  // Reset a página 1 cuando cambia cualquier filtro
  useEffect(() => { setPaginaActual(1) }, [sectorActivo, subcategoriaActiva, busqueda, mayoristaFiltro])

  // Filtrar productos
  const productosFiltrados = productos.filter(p => {
    const matchSector = p.sector === sectorActivo
    const matchSubcat = !subcategoriaActiva || p.subcategoria === subcategoriaActiva
    const matchBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchMayorista = mayoristaFiltro === 'Todos' || p.precios.some(pr => pr.mayorista === mayoristaFiltro)
    return matchSector && matchSubcat && matchBusqueda && matchMayorista
  })

  // Paginar
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA))
  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA
  const productosPagina = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA)

  const sectorActual = sectores.find(s => s.nombre === sectorActivo)
  
  // Abrir calculadora con el producto seleccionado
  const handleSelectPrecio = (producto: Producto, mayorista: string, precio: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Evitar disparar el modal al tocar un precio directamente
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
      {/* Modal de Producto con efecto burbuja */}
      <ModalProducto 
        isOpen={isOpen}
        onClose={closeModal}
        product={selectedProduct}
        origen={origen}
        onCalcular={(prod, may, price) => {
          handleSelectPrecio(prod, may, price);
          closeModal();
        }}
      />

      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-44 fixed left-0 top-14 bottom-20 overflow-y-auto" style={{ backgroundColor: '#f2f4f6' }}>
        <div className="py-4">
          {sectores.map((sector) => (
            <div key={sector.nombre}>
              <motion.button
                onClick={() => {
                  if (sectorActivo === sector.nombre) {
                    setSubcategoriasAbiertas(prev => !prev)
                  } else {
                    setSectorActivo(sector.nombre)
                    setSubcategoriaActiva(null)
                    setSubcategoriasAbiertas(true)
                  }
                }}
                whileHover={sectorActivo !== sector.nombre ? { x: 4, backgroundColor: '#e8f0ee' } : { scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={`w-full text-left px-4 py-3 flex items-center gap-2 ${
                  sectorActivo === sector.nombre
                    ? 'font-heading font-semibold'
                    : 'font-body'
                }`}
                style={{
                  backgroundColor: sectorActivo === sector.nombre ? '#e8f5ee' : 'transparent',
                  borderLeft: sectorActivo === sector.nombre ? '3px solid #006d38' : '3px solid transparent',
                  color: sectorActivo === sector.nombre ? '#006d38' : '#0f172a',
                }}
              >
                <motion.span
                  whileHover={{ rotate: [0, -12, 12, 0], scale: 1.2 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: 'inline-block' }}
                >{sector.emoji}</motion.span>
                <span className="text-sm flex-1">{sector.nombre}</span>
                {sectorActivo === sector.nombre && (
                  <span
                    className="text-[10px] transition-transform duration-200"
                    style={{ transform: subcategoriasAbiertas ? 'rotate(0deg)' : 'rotate(-90deg)', opacity: 0.6 }}
                  >
                    ▾
                  </span>
                )}
              </motion.button>
              
              {/* Subcategorías colapsables */}
              {sectorActivo === sector.nombre && subcategoriasAbiertas && (
                <div className="pl-4">
                  {sector.subcategorias.map((sub) => (
                    <motion.button
                      key={sub}
                      onClick={() => setSubcategoriaActiva(subcategoriaActiva === sub ? null : sub)}
                      whileHover={{ x: 4, color: '#006d38' }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2"
                      style={{ color: subcategoriaActiva === sub ? '#006d38' : '#64748b' }}
                    >
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        animate={{ scale: subcategoriaActiva === sub ? 1.3 : 1 }}
                        style={{ backgroundColor: subcategoriaActiva === sub ? '#006d38' : '#94a3b8', display: 'inline-block' }}
                      />
                      <span className="font-body text-sm">{sub}</span>
                    </motion.button>
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
      <main className="flex-1 min-w-0 md:ml-44 pt-14 md:pt-4 px-4 w-full">
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

        {/* Filtro de Mayorista */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {(['Todos', 'Maxiconsumo', 'Yaguar'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMayoristaFiltro(m)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-heading font-black text-[11px] uppercase tracking-wider transition-all shadow-sm ${
                mayoristaFiltro === m 
                  ? 'bg-[#006d38] text-white shadow-[#006d38]/20' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        
        {/* Chips de subcategorías */}
        {sectorActual && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            <motion.button
              onClick={() => setSubcategoriaActiva(null)}
              whileHover={{ scale: 1.06, y: -1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-body text-sm ${
                !subcategoriaActiva ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: !subcategoriaActiva ? '#006d38' : '#f2f4f6',
                color: !subcategoriaActiva ? '#ffffff' : '#64748b'
              }}
            >
              Todos
            </motion.button>
            {sectorActual.subcategorias.map((sub) => (
              <motion.button
                key={sub}
                onClick={() => setSubcategoriaActiva(subcategoriaActiva === sub ? null : sub)}
                whileHover={{ scale: 1.06, y: -1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap font-body text-sm ${
                  subcategoriaActiva === sub ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: subcategoriaActiva === sub ? '#006d38' : '#f2f4f6',
                  color: subcategoriaActiva === sub ? '#ffffff' : '#64748b'
                }}
              >
                {sub}
              </motion.button>
            ))}
          </div>
        )}
        
        {/* Grilla de productos (cuadraditos) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {productosPagina.map((producto, index) => {
              const preciosFiltrados = mayoristaFiltro === 'Todos' 
                ? producto.precios 
                : producto.precios.filter(p => p.mayorista === mayoristaFiltro)
              
              const minPrecio = Math.min(...preciosFiltrados.map(p => p.precio))
              const ganador = preciosFiltrados.find(p => p.precio === minPrecio)
              
              return (
                <motion.div
                  key={producto.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ 
                    y: -12, 
                    rotateX: 2,
                    scale: 1.02,
                    transition: { duration: 0.3, ease: 'easeOut' } 
                  }}
                  transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                  className="flex flex-col bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] overflow-hidden group cursor-pointer hover:shadow-[0_32px_64px_rgba(0,0,0,0.14)] transition-all duration-500 relative"
                  style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  onClick={(e) => openModal(producto, e)}
                >

                  {/* Base 3D (Efecto de grosor) */}
                  <div className="absolute inset-0 rounded-[2rem] border-b-[6px] border-slate-200 pointer-events-none z-0" />
                  <div className="relative flex flex-col h-full bg-white rounded-[2rem] z-10">


                  {/* Foto del producto */}
                  <div className="h-[140px] sm:h-[160px] w-full shrink-0 bg-[#f8f9fb] flex items-center justify-center p-4 relative overflow-hidden">
                    {ganador?.tipo === 'oferta' && (
                      <div className="absolute top-3 left-3 bg-[#ff4700] text-white font-black text-[10px] px-2.5 py-1 rounded-full z-10 shadow-sm">
                        OFERTA
                      </div>
                    )}
                    
                    {(producto as any).imageUrl ? (
                      <img
                        src={(producto as any).imageUrl}
                        alt={producto.nombre}
                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="text-5xl">{producto.emoji}</div>
                    )}
                  </div>

                  {/* Info del producto */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="mb-2">
                      <span className="font-body text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        REF: {producto.id}
                      </span>
                      <h4 className="font-heading font-bold text-[13px] sm:text-[14px] text-slate-800 leading-tight line-clamp-2 min-h-[36px] group-hover:text-[#006d38] transition-colors">
                        {producto.nombre}
                      </h4>
                    </div>

                    <div className="mt-auto">
                      <div className="flex flex-col">
                        <span className="font-body text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {mayoristaFiltro === 'Todos' ? 'Mejor precio en' : 'Precio en'} {ganador?.mayorista}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-heading font-black text-2xl text-[#006d38]">
                            $ {formatearPrecio(minPrecio).replace('$\u00a0', '')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botones de acción rápidos (discretos) */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPrecio(producto, ganador?.mayorista || '', minPrecio, e);
                          }}
                          className="flex-1 py-2.5 bg-[#006d38] text-white rounded-xl font-heading font-black text-[10px] uppercase tracking-wider transition-all hover:bg-[#005a2e] active:scale-95 shadow-md shadow-[#006d38]/10"
                        >
                          Calcular
                        </button>
                      </div>
                    </div>
                  </div>
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

        {/* Controles de paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6 pb-8 flex-wrap">
            <button
              onClick={() => { setPaginaActual(p => Math.max(1, p - 1)); window.scrollTo(0,0) }}
              disabled={paginaActual === 1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#006d38', color: '#fff' }}
            >
              ← Anterior
            </button>

            <span className="font-body text-[13px] px-3 py-2 rounded-xl bg-white border border-slate-100 text-[#64748b] tabular-nums">
              {paginaActual} / {totalPaginas}
            </span>

            <button
              onClick={() => { setPaginaActual(p => Math.min(totalPaginas, p + 1)); window.scrollTo(0,0) }}
              disabled={paginaActual === totalPaginas}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#006d38', color: '#fff' }}
            >
              Siguiente →
            </button>
          </div>
        )}
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

