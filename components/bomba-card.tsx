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

const MAYORISTAS_ORDER = ['Yaguar', 'MaxiCarrefour', 'Maxiconsumo']
const MAYORISTAS_SHORT: Record<string, string> = {
  'Yaguar': 'Yaguar',
  'MaxiCarrefour': 'MaxiCarre',
  'Maxiconsumo': 'Maxiconsumo',
}

export function BombaCard({ bomba, index, onOpenModal, esBomba = true }: BombaCardProps) {
  // Build a map: mayorista → precio
  const precioMap: Record<string, number> = {}
  for (const p of bomba.precios) {
    precioMap[p.mayorista] = p.precio
  }

  const cantFuentes = bomba.precios.length
  const tiene3 = cantFuentes === 3

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
          {/* Badge de Ahorro + Fuentes */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            {esBomba && (
              <div className="px-2.5 py-1 bg-[#ff4700] rounded-full shadow-lg shadow-[#ff4700]/30 flex items-center gap-1 scale-90 origin-left">
                <span className="text-white font-heading font-black text-[10px] leading-none uppercase tracking-tighter">OFERTA BOMBA</span>
                <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              </div>
            )}
            {/* Badge de fuentes */}
            <div
              className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-heading font-black uppercase tracking-widest border ${
                tiene3
                  ? 'bg-[#006d38] text-white border-[#006d38]/30'
                  : 'bg-white/90 text-slate-500 border-slate-200'
              }`}
            >
              {cantFuentes} fuentes
            </div>
          </div>

          {/* IMAGEN PRODUCTO */}
          <div
            className="w-full relative flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/50"
            style={{ height: '150px' }}
          >
            {bomba.imageUrl ? (
              <img
                src={bomba.imageUrl}
                alt={bomba.nombre}
                loading="lazy"
                className="group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 ease-out p-5 w-full h-full object-contain filter drop-shadow-xl"
                onError={(e) => {
                  const parent = e.currentTarget.parentElement
                  if (parent) parent.innerHTML = `<span style="font-size:60px">${bomba.emoji}</span>`
                }}
              />
            ) : (
              <span
                className="group-hover:scale-125 transition-transform duration-700 filter drop-shadow-md"
                style={{ fontSize: '60px', display: 'inline-block' }}
              >{bomba.emoji}</span>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-black/5 blur-xl rounded-full" />
          </div>

          {/* INFO NOMBRE */}
          <div className="px-5 pt-2 pb-1">
            <span className="font-heading font-black text-[10px] uppercase tracking-[0.2em] text-[#ff4700]/70 block mb-0.5">
              {bomba.sector}
            </span>
            <h3 className="font-heading font-black text-[15px] text-[#0f172a] leading-[1.2] line-clamp-2 tracking-tight group-hover:text-[#ff4700] transition-colors">
              {bomba.nombre}
            </h3>
          </div>

          {/* COMPARATIVA DE PRECIOS — corazón de la card */}
          <div className="px-4 pb-4 pt-3 flex flex-col gap-2 mt-auto">
            {MAYORISTAS_ORDER.map((mayorista) => {
              const precio = precioMap[mayorista]
              const disponible = precio != null && precio > 0
              const esMejor = disponible && precio === bomba.precioMinimo
              const esPeor = disponible && precio === bomba.precioMaximo && cantFuentes > 1

              return (
                <div
                  key={mayorista}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all ${
                    esMejor
                      ? 'bg-[#006d38] shadow-md shadow-[#006d38]/20'
                      : disponible
                      ? 'bg-slate-50 border border-slate-100'
                      : 'opacity-30 bg-slate-50 border border-dashed border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {esMejor && (
                      <span className="text-[8px] font-heading font-black text-white/80 uppercase tracking-wider shrink-0">★</span>
                    )}
                    <span
                      className={`font-heading font-bold text-[12px] truncate ${
                        esMejor ? 'text-white' : disponible ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {MAYORISTAS_SHORT[mayorista] ?? mayorista}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {disponible ? (
                      <>
                        <span
                          className={`font-heading font-black text-[14px] leading-none ${
                            esMejor ? 'text-white' : esPeor ? 'text-slate-400 line-through' : 'text-slate-700'
                          }`}
                        >
                          {formatearPrecio(precio)}
                        </span>
                        {esPeor && cantFuentes > 1 && (
                          <span className="text-[8px] font-heading font-bold text-[#ff4700] bg-[#ff4700]/10 px-1.5 py-0.5 rounded-full">
                            +{Math.round(((precio - bomba.precioMinimo) / bomba.precioMinimo) * 100)}%
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="font-heading text-[11px] text-slate-300 italic">sin precio</span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Resumen de ahorro */}
            <div className="mt-1 flex items-center justify-between bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#006d38" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="font-body text-[11px] font-bold text-[#006d38]">
                  Ahorrás {formatearPrecio(bomba.ahorroEnPlata)}
                </span>
              </div>
              <span className="font-heading font-black text-[13px] text-[#ff4700]">
                -{bomba.ahorroVsMaximo}%
              </span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  )
}
