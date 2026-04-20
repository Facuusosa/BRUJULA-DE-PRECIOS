'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BombaCard } from './bomba-card'
import { ModalProducto } from './modal-producto'
import { Calculadora } from './calculadora'
import { useModalProducto } from '@/hooks/use-modal-producto'
import { Producto, calcularBombas, ProductoBomba, productos } from '@/lib/data'
import BlurText from './reactbits/TextAnimations/BlurText/BlurText'
import CountUp from './reactbits/TextAnimations/CountUp/CountUp'

interface VistaInicioProps {
  onSelectBomba?: (bomba: ProductoBomba) => void
  onIrACompararConSector?: (sector: string) => void
  onGuardarEnLista?: (data: any) => void
}

export function VistaInicio({ onSelectBomba, onIrACompararConSector, onGuardarEnLista }: VistaInicioProps) {
  const bombas = calcularBombas()
  console.log('� Bombas cargadas:', bombas.length)
  const { isOpen, selectedProduct, origen, openModal, closeModal } = useModalProducto()
  const [mostrarMasVariaciones, setMostrarMasVariaciones] = useState(false)
  
  const [calcState, setCalcState] = useState<{
    isOpen: boolean
    producto: Producto | null
    mayorista: string
    precio: number
  }>({
    isOpen: false,
    producto: null,
    mayorista: '',
    precio: 0
  })

  const handleOpenCalcular = (producto: Producto, mayorista: string, precio: number) => {
    setCalcState({ isOpen: true, producto, mayorista, precio })
    closeModal()
  }

  // Stats globales reales (Usando el catálogo completo de lib/data)
  const cantidadMayoristas = 3 // Maxiconsumo, Yaguar y MaxiCarrefour
  const cantidadProductos = productos.length
  
  // El ahorro máximo lo sacamos de las bombas reales calculadas
  const maxAhorro = bombas.length > 0 ? Math.max(...bombas.map(b => b.ahorroVsMaximo)) : 0

  // Top 25 variaciones de precios (las más altas)
  const topVariaciones = useMemo(() => {
    return [...bombas]
      .sort((a, b) => b.ahorroVsMaximo - a.ahorroVsMaximo)
      .slice(0, 25)
      .map(b => ({
        producto: b.nombre,
        mayorista: b.mayoristaMejorPrecio,
        variacion: b.ahorroVsMaximo,
        sube: false, // diferencia vs max (siempre es ahorro = baja de precio)
      }))
  }, [bombas])
  
  const countsBySector = useMemo(() => {
    const counts: Record<string, number> = {}
    productos.forEach((p: Producto) => {
      counts[p.sector] = (counts[p.sector] || 0) + 1
    })
    return counts
  }, [])

  const variacionesVisibles = mostrarMasVariaciones ? topVariaciones : topVariaciones.slice(0, 5)

  return (
    <div className="pb-28 relative min-h-screen antialiased bg-[#f7f9fb] overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200 blur-[120px] rounded-full mix-blend-multiply animate-pulse" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-0 left-[20%] w-[60%] h-[30%] bg-orange-100 blur-[110px] rounded-full mix-blend-multiply" />
      </div>

      <ModalProducto 
        isOpen={isOpen}
        onClose={closeModal}
        product={selectedProduct}
        origen={origen}
        onCalcular={handleOpenCalcular}
      />

      <Calculadora 
        isOpen={calcState.isOpen}
        onClose={() => setCalcState(prev => ({ ...prev, isOpen: false }))}
        producto={calcState.producto}
        mayorista={calcState.mayorista}
        precioInicial={calcState.precio}
        onGuardar={onGuardarEnLista}
      />
      
      <div className="relative z-10 w-full md:max-w-4xl md:mx-auto pt-3 pb-32">
        
        {/* TITULAR PRINCIPAL con BlurText */}
        <div className="px-6 pt-4 pb-2">
          <BlurText
            text="Ahorrá hoy."
            delay={80}
            animateBy="words"
            direction="top"
            className="text-[#0f172a] font-heading font-black tracking-tight leading-none mb-1 text-[clamp(1.8rem,7vw,2.2rem)]"
          />
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#64748b] font-body text-sm font-medium"
          >
            Comparamos <span className="text-[#006d38] font-bold">{cantidadMayoristas} mayoristas</span> para tu negocio
          </motion.p>
        </div>

        {/* STATS BAR con CountUp */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-5 mb-5"
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] px-5 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-white/70 flex items-center justify-around gap-2">
            <div className="flex flex-col items-center">
              <span className="font-heading font-black text-[1.6rem] text-[#006d38] leading-none flex items-center">
                <CountUp to={cantidadMayoristas} duration={1.2} className="font-heading font-black text-[1.6rem] text-[#006d38]" />
              </span>
              <span className="font-body text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mayoristas</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="font-heading font-black text-[1.6rem] text-[#0f172a] leading-none">
                <CountUp to={cantidadProductos > 0 ? cantidadProductos : 480} duration={1.5} separator="." className="font-heading font-black text-[1.6rem] text-[#0f172a]" />
              </span>
              <span className="font-body text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Productos</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="font-heading font-black text-[1.6rem] text-[#ff4700] leading-none flex items-baseline gap-0.5">
                <CountUp to={maxAhorro > 0 ? maxAhorro : 42} duration={1.8} suffix="%" className="font-heading font-black text-[1.6rem] text-[#ff4700]" />
              </span>
              <span className="font-body text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Max. Ahorro</span>
            </div>
          </div>
        </motion.div>

        {/* VARIACIONES DE PRECIOS */}
        <div className="px-5 mb-10">
          <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/60">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-black text-[12px] text-[#0f172a] uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Variaciones de Precio
              </h3>
              <span className="text-[#006d38] font-bold text-[9px] bg-[#006d38]/10 px-2 py-1 rounded-full uppercase tracking-widest">Top {topVariaciones.length}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <AnimatePresence>
                {variacionesVisibles.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.04 }}
                    className="group flex items-center justify-between py-2.5 px-3 hover:bg-white/90 rounded-2xl transition-all duration-300 border border-transparent hover:border-[#006d38]/20 hover:shadow-md cursor-pointer"
                    onClick={(e) => {
                      const prod = productos.find(p => p.nombre === v.producto)
                      if (prod) openModal(prod, e as any)
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-bold text-[13px] text-[#0f172a] truncate tracking-tight group-hover:text-[#006d38] transition-colors">
                        {v.producto}
                      </p>
                      <p className="font-body text-[10px] text-[#94a3b8] font-medium flex items-center gap-1 group-hover:text-slate-500 transition-colors">
                        Mejor precio en <span className="text-[#006d38] font-bold">{v.mayorista}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-heading font-black text-[13px] px-3 py-1.5 rounded-xl shadow-sm bg-emerald-50 text-emerald-600 shrink-0 ml-3">
                      <span className="text-[10px]">▼</span> {v.variacion}%
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {topVariaciones.length > 5 && (
              <motion.button
                onClick={() => setMostrarMasVariaciones(!mostrarMasVariaciones)}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-4 py-2.5 rounded-2xl border border-slate-200 text-slate-500 font-heading font-black text-[11px] uppercase tracking-widest hover:bg-white/80 hover:text-[#006d38] hover:border-[#006d38]/30 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {mostrarMasVariaciones ? (
                  <><span>▲</span> Ver menos</>
                ) : (
                  <><span>▼</span> Ver más ({topVariaciones.length - 5} productos más)</>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* SECCIÓN BOMBAS */}
        <div className="flex justify-between items-end px-6 md:px-0 mt-2 mb-4">
          <h2 className="font-heading font-black text-[#0f172a] tracking-tight text-[1.4rem]">
            Top Bombas de Hoy
          </h2>
          <div className="flex items-center gap-1 bg-[#006d38]/10 px-2 py-0.5 rounded-full">
            <span className="font-heading font-bold text-[10px] text-[#006d38] uppercase">Ahorro Máximo</span>
          </div>
        </div>

        {/* BOMB CARDS */}
        <div className="px-4 md:px-0 mb-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          {bombas.map((bomba, index) => (
            <BombaCard
              key={bomba.id}
              bomba={bomba}
              index={index}
              onOpenModal={(prod, e) => {
                openModal(prod, e)
                onSelectBomba?.(prod)
              }}
            />
          ))}
        </div>

        {/* CATEGORÍAS */}
        <div className="px-5 md:px-0 mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-heading font-black text-[#0f172a] tracking-tight text-[1.6rem] sm:text-[2rem]">
              Explorar Sectores
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {[
              { label: 'Limpieza', sector: 'Limpieza', img: '/categories/limpieza_real.png', color: 'from-blue-50/40 to-indigo-100/40' },
              { label: 'Almacén', sector: 'Almacén', images: ['/categories/almacen_aceite.webp', '/categories/almacen_harina.webp', '/categories/almacen_azucar.webp', '/categories/almacen_mayo.webp'], color: 'from-orange-50/40 to-amber-100/40' },
              { label: 'Frescos', sector: 'Frescos', images: ['/categories/frescos_yogur.webp', '/categories/frescos_queso.webp', '/categories/frescos_manteca.webp'], color: 'from-emerald-50/40 to-teal-100/40' },
              { label: 'Perfumería', sector: 'Cuidado Personal', img: '/categories/perfumeria_real.png', color: 'from-pink-50/40 to-rose-100/40' },
              { label: 'Bebidas', sector: 'Bebidas', img: '/categories/bebidas_real.png', color: 'from-sky-50/40 to-blue-100/40' },
              { label: 'Mascotas', sector: 'Mascotas', img: '/categories/mascotas.png', color: 'from-yellow-50/40 to-amber-100/40' },
              { label: 'Bazar', sector: 'Bazar', img: '/categories/hogar.png', color: 'from-green-50/40 to-lime-100/40' },
              { label: 'Kiosco', sector: 'Kiosco', img: '/categories/bebidas_real.png', color: 'from-cyan-50/40 to-blue-100/40' },
            ].map(({ label, sector, img, images, color }: any) => (
              <motion.button
                key={sector}
                onClick={() => onIrACompararConSector?.(sector)}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative h-[220px] rounded-[2.5rem] overflow-hidden group shadow-md border border-white bg-gradient-to-br ${color} backdrop-blur-md transition-all duration-700`}
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                {/* Imagen de Categoría — más grande y centrada */}
                <div className="absolute top-0 left-0 right-0 bottom-[28%] flex items-center justify-center p-2 z-10 pointer-events-none">
                  {images ? (
                    <div className="relative w-full h-full flex items-center justify-center scale-110">
                      {images.length === 4 ? (
                        <>
                          {/* Almacén: 4 productos en composición más grande */}
                          <motion.img src={images[0]} className="absolute z-10 w-[45%] h-[60%] object-contain mix-blend-multiply opacity-90"
                            style={{ top: '0%', left: '27.5%' }} animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                          <motion.img src={images[1]} className="absolute z-20 w-[40%] h-[55%] object-contain mix-blend-multiply"
                            style={{ top: '15%', left: '0%' }} animate={{ rotate: -3, y: [0, 3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
                          <motion.img src={images[2]} className="absolute z-20 w-[40%] h-[55%] object-contain mix-blend-multiply"
                            style={{ top: '15%', right: '0%' }} animate={{ rotate: 3, y: [0, 3, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
                          <motion.img src={images[3]} className="absolute z-30 w-[38%] h-[45%] object-contain mix-blend-multiply drop-shadow-xl"
                            style={{ bottom: '0%', left: '31%' }} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
                        </>
                      ) : (
                        <>
                          {/* Frescos: 3 productos en composición más grande */}
                          <motion.img src={images[0]} className="absolute z-20 w-[48%] h-[95%] object-contain mix-blend-multiply"
                            style={{ top: '0%', left: '26%' }} animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                          <motion.img src={images[1]} className="absolute z-10 w-[42%] h-[80%] object-contain mix-blend-multiply opacity-85"
                            style={{ top: '10%', left: '0%' }} animate={{ rotate: -3, y: [0, 3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
                          <motion.img src={images[2]} className="absolute z-30 w-[40%] h-[80%] object-contain mix-blend-multiply"
                            style={{ top: '10%', right: '0%' }} animate={{ rotate: 3, y: [0, 3, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }} />
                        </>
                      )}
                    </div>
                  ) : (
                    <motion.img src={img} alt={label}
                      className="w-[95%] h-[95%] object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x600/f8fafc/64748b?text=' + label }} />
                  )}
                </div>

                {/* Sombra de apoyo */}
                <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-[70%] h-[15%] bg-black/10 blur-3xl rounded-full z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
     
                {/* Info Text Overlay — centrado y más pequeño */}
                <div className="absolute bottom-5 left-0 right-0 z-20 flex flex-col items-center text-center">
                  <span className="font-heading font-black text-[#0f172a] text-2xl tracking-tighter leading-none mb-1.5 group-hover:scale-105 transition-transform duration-500 uppercase">
                    {label}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <span className="font-body text-[10px] text-[#0f172a]/60 font-black uppercase tracking-[0.25em] bg-white/50 px-3 py-1 rounded-full backdrop-blur-md shadow-sm ring-1 ring-white/5">
                      {countsBySector[sector] || 0} CATALOGADOS
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse" />
                  </div>
                </div>

                {/* Glossy Reflection */}
                <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-30deg] z-30" />
                
                {/* Border effect */}
                <div className="absolute inset-0 rounded-[3.5rem] border-[2px] border-white/40 z-40 pointer-events-none" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
