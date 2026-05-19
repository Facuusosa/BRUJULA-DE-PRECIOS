'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberFlow from '@number-flow/react'
import { CheckCircle2, Lock } from 'lucide-react'

interface PricingSectionProps {
  onWhatsApp: () => void
}

const FREE_FEATURES = [
  'Precios de Yaguar y Maxiconsumo',
  'Comparar 2 mayoristas',
  'Calculador de margen incluido',
  'Hasta 10 productos en tu lista',
]

const PRO_FEATURES = [
  'MaxiCarrefour — precios que Yaguar no tiene',
  'Listas de compra ilimitadas',
  'Alertas cuando baja un precio',
  'Activacion inmediata por WhatsApp',
]

const PREMIUM_FEATURES = [
  'Historial de precios — ultimos 90 dias',
  'Exportar lista a Excel',
  'Soporte prioritario',
]

function PricingSwitch({
  isPro,
  onToggle,
}: {
  isPro: boolean
  onToggle: () => void
}) {
  const layoutId = useId()

  return (
    <div
      role="switch"
      aria-checked={isPro}
      className="relative flex w-full cursor-pointer select-none rounded-full p-1"
      style={{ background: 'rgba(255,255,255,0.06)' }}
      onClick={onToggle}
    >
      {(['FREE', 'PRO'] as const).map((label, i) => {
        const isActive = (i === 1) === isPro
        return (
          <div key={label} className="relative flex flex-1 items-center justify-center py-2.5">
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full"
                style={{ background: '#d4a574' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span
              className="relative z-10 text-xs font-bold tracking-widest transition-colors duration-200"
              style={{ color: isActive ? '#0a0a0a' : 'rgba(255,255,255,0.35)' }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function PricingSection({ onWhatsApp }: PricingSectionProps) {
  const [isPro, setIsPro] = useState(false)

  return (
    <div className="w-full rounded-2xl p-5" style={{ background: '#0a0a0a' }}>
      {/* Eyebrow + heading */}
      <div className="mb-5 flex flex-col gap-2">
        <span
          className="self-start rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ background: 'rgba(212,165,116,0.15)', color: '#d4a574' }}
        >
          PLANES
        </span>
        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: '#fff' }}>
          Elegi tu plan
        </h2>
      </div>

      {/* Toggle */}
      <PricingSwitch isPro={isPro} onToggle={() => setIsPro(p => !p)} />

      {/* Pricing card Double-Bezel */}
      <div
        className="mt-4 rounded-[2rem] p-1.5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="flex flex-col gap-4 rounded-[calc(2rem-6px)] p-6"
          style={{
            background: '#0f0f0f',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Precio animado */}
          <div className="flex items-end gap-1">
            <span
              className="text-[2.75rem] font-extrabold leading-none tracking-tight"
              style={{ color: '#fff' }}
            >
              $
              <NumberFlow value={isPro ? 6999 : 0} locales="es-AR" />
            </span>
            <AnimatePresence>
              {isPro && (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="mb-1.5 text-sm"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  /mes
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Descripcion del plan */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isPro ? 'pro' : 'free'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-[13px] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              {isPro
                ? 'Acceso completo a los 3 mayoristas. Activas hoy por WhatsApp.'
                : 'Empeza gratis con 2 mayoristas y todas las herramientas basicas.'}
            </motion.p>
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            onClick={isPro ? onWhatsApp : undefined}
            className="w-full rounded-full py-3.5 text-sm font-bold uppercase tracking-wider"
            style={{
              background: isPro ? '#d4a574' : 'transparent',
              color: isPro ? '#0a0a0a' : 'rgba(255,255,255,0.35)',
              border: isPro ? 'none' : '1px solid rgba(255,255,255,0.1)',
              cursor: isPro ? 'pointer' : 'default',
              transition: 'background 0.3s, color 0.3s, transform 500ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
            whileTap={isPro ? { scale: 0.98 } : undefined}
          >
            {isPro ? 'Activar por WhatsApp' : 'Continuar gratis'}
          </motion.button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-5 flex flex-col gap-2">
        <p
          className="mb-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          QUE INCLUYE
        </p>

        {FREE_FEATURES.map((f, i) => (
          <motion.div
            key={f}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <span style={{ flexShrink: 0, display: 'flex' }}>
              <CheckCircle2 size={14} color="#16a34a" />
            </span>
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {f}
            </span>
          </motion.div>
        ))}

        <div className="my-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

        {PRO_FEATURES.map((f, i) => (
          <div key={f} className="flex items-center gap-2.5">
            <AnimatePresence mode="wait" initial={false}>
              {isPro ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  style={{ flexShrink: 0, display: 'flex' }}
                >
                  <CheckCircle2 size={14} color="#d4a574" />
                </motion.span>
              ) : (
                <motion.span
                  key="lock"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                  style={{ flexShrink: 0, display: 'flex' }}
                >
                  <Lock size={14} color="rgba(255,255,255,0.2)" />
                </motion.span>
              )}
            </AnimatePresence>
            <motion.span
              className="text-[13px]"
              animate={{
                color: isPro ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.22)',
              }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              {f}
            </motion.span>
          </div>
        ))}
      </div>

      {/* Card PREMIUM — disabled */}
      <div className="mt-5" style={{ opacity: 0.4 }}>
        <div
          className="rounded-[1.5rem] p-1.5"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            className="rounded-[calc(1.5rem-6px)] p-5"
            style={{
              background: '#0f0f0f',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03)',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[14px] font-extrabold tracking-wide"
                  style={{ color: '#fff' }}
                >
                  PREMIUM
                </span>
                <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  $14.999/mes
                </span>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}
              >
                PROXIMAMENTE
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {PREMIUM_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <span style={{ flexShrink: 0, display: 'flex' }}>
                    <Lock size={12} color="rgba(255,255,255,0.2)" />
                  </span>
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
