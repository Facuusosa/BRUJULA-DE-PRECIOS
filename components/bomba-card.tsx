'use client'

import { motion } from 'framer-motion'
import { ProductoBomba, formatearPrecio } from '@/lib/data'
import SpotlightCard from './reactbits/Components/SpotlightCard/SpotlightCard'

interface BombaCardProps {
  bomba: ProductoBomba
  index: number
  onOpenModal?: (producto: ProductoBomba, e: React.MouseEvent) => void
  esBomba?: boolean
}

export function BombaCard({ bomba, index, onOpenModal, esBomba = true }: BombaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.018, y: -3 }}
      whileTap={{ scale: 0.982 }}
      style={{ cursor: 'pointer', willChange: 'transform' }}
      onClick={(e) => onOpenModal?.(bomba, e)}
      className="w-full h-full block group relative"
    >
      <div className="absolute inset-0 rounded-[1.25rem] border-b-[4px] border-slate-300/40 z-0" />
      <SpotlightCard
        className="rounded-[1.25rem] w-full h-full shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow duration-300 group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] relative z-10"
        spotlightColor="rgba(255, 71, 0, 0.04)"
      >

        <div
          className="relative rounded-[2rem] h-full flex flex-col overflow-hidden transition-all duration-500 group-hover:shadow-[0_40px_80px_-20px_rgba(255,71,0,0.15)]"
          style={{
            background: esBomba
              ? 'linear-gradient(165deg, #ffffff 0%, #fff5f2 100%)'
              : '#ffffff',
            border: esBomba
              ? '1.5px solid rgba(255,71,0,0.25)'
              : '1px solid rgba(203,213,225,0.6)'
          }}
        >
          {/* Badge de Ahorro Flotante - Más Premium */}
          {esBomba && (
            <div className="absolute top-4 left-4 z-20 px-2.5 py-1 bg-[#ff4700] rounded-full shadow-lg shadow-[#ff4700]/30 flex items-center gap-1 scale-90 origin-left">
              <span className="text-white font-heading font-black text-[10px] leading-none uppercase tracking-tighter">OFERTA BOMBA</span>
              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </div>
          )}

          {/* ── IMAGEN PRODUCTO ── */}
          <div
            className="w-full relative flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/50"
            style={{ height: '160px' }}
          >
            {bomba.imageUrl ? (
              <img
                src={bomba.imageUrl}
                alt={bomba.nombre}
                loading="lazy"
                className="group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 ease-out p-6 w-full h-full object-contain filter drop-shadow-xl"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement
                  if (parent) parent.innerHTML = `<span style="font-size:64px">${bomba.emoji}</span>`
                }}
              />
            ) : (
              <span
                className="group-hover:scale-125 transition-transform duration-700 filter drop-shadow-md"
                style={{ fontSize: '64px', display: 'inline-block' }}
              >{bomba.emoji}</span>
            )}
            
            {/* Sombras suaves debajo del producto */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-black/5 blur-xl rounded-full" />
          </div>

          {/* ── INFO ── */}
          <div className="flex flex-col flex-1 px-6 pb-6 pt-2 relative z-10">
            <div className="flex-1 min-w-0 mb-4">
              <span className="font-heading font-black text-[10px] uppercase tracking-[0.2em] text-[#ff4700]/70 block mb-1">
                {bomba.sector}
              </span>
              <h3 className="font-heading font-black text-[16px] text-[#0f172a] leading-[1.2] line-clamp-2 tracking-tight group-hover:text-[#ff4700] transition-colors">
                {bomba.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#006d38]" />
                </div>
                <p className="font-body text-[12px] font-bold text-slate-500">
                  {bomba.mayoristaMejorPrecio}
                </p>
              </div>
            </div>

            {/* Precio + Badge */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="font-body text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Mejor Precio</span>
                <span className="font-heading font-black text-3xl tracking-tighter text-[#006d38] leading-none">
                  {formatearPrecio(bomba.precioMinimo)}
                </span>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="rounded-xl px-3 py-1.5 bg-[#ff4700] shadow-lg shadow-[#ff4700]/20 flex flex-col items-center">
                  <span className="font-heading font-black text-[14px] text-white leading-none">-{bomba.ahorroVsMaximo}%</span>
                  <span className="text-white/70 font-bold text-[7px] uppercase tracking-widest mt-0.5">Ahorro</span>
                </div>
              </div>
            </div>

            {/* Ahorro en Plata */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2 bg-emerald-50/50 -mx-2 px-2 py-2 rounded-xl">
              <div className="w-5 h-5 rounded-full bg-[#006d38] flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="font-body text-[11px] font-bold text-[#006d38] leading-tight">
                Ahorrás {formatearPrecio(bomba.ahorroEnPlata)} vs el más caro
              </span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  )
}
