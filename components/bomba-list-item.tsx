'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { ProductoBomba, formatearPrecio, extraerTamano } from '@/lib/data'
import { FrescuraPill } from '@/components/frescura-pill'

const LOGOS: Record<string, string> = {
  'Maxiconsumo':   '/mayoristas/maxiconsumo.webp',
  'Yaguar':        '/mayoristas/yaguar.png',
  'MaxiCarrefour': '/mayoristas/maxicarrefour.jpg',
}

function useImagenConFallback(bomba: ProductoBomba) {
  const [imgSrc, setImgSrc] = useState(bomba.imageUrl || '')
  const [fallbackIdx, setFallbackIdx] = useState(0)
  const onError = () => {
    const fallbacks = bomba.imagenFallbacks || []
    if (fallbackIdx < fallbacks.length) {
      setImgSrc(fallbacks[fallbackIdx])
      setFallbackIdx(prev => prev + 1)
    } else {
      setImgSrc('')
    }
  }
  return { imgSrc, onError }
}

function compartir(bomba: ProductoBomba) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ title: bomba.nombre, text: `${bomba.nombre} — Brújula de Precios` }).catch(() => null)
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(bomba.nombre)
    toast.success('Nombre copiado')
  }
}

interface BombaDealProps {
  bomba: ProductoBomba
  rank: number
  onVerProducto: () => void
  onGuardar?: () => void
}

/* Deal completo estilo Trolley home.
   Mobile: imagen arriba, acciones centradas (mockup aprobado).
   Desktop ≥1000px: placa 360×418 izquierda + gap 40 + info derecha,
   hairlines entre secciones y List/Share en fila al pie (medido de trolley.co.uk con getComputedStyle). */
export function BombaDeal({ bomba, rank, onVerProducto, onGuardar }: BombaDealProps) {
  const { imgSrc, onError } = useImagenConFallback(bomba)
  const stageRef = useRef<HTMLDivElement>(null)
  const [pillsVisibles, setPillsVisibles] = useState(false)

  // Efecto Trolley: las pills aparecen recién cuando el deal entra al viewport
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPillsVisibles(true)
        io.disconnect()
      }
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const tamano = extraerTamano(bomba.nombre)
  const preciosValidos = bomba.precios.filter(p => p.precio > 0).sort((a, b) => a.precio - b.precio)
  const masCaro = preciosValidos[preciosValidos.length - 1]
  const pctSobreMejor = preciosValidos.length >= 2
    ? Math.round(((masCaro.precio - preciosValidos[0].precio) / preciosValidos[0].precio) * 100)
    : 0
  const esEan = /^\d{13}$/.test(bomba.id)

  const handleGuardar = (e: React.MouseEvent) => {
    e.stopPropagation()
    onGuardar?.()
    toast.success('Agregado a tu lista')
  }

  const handleCompartir = (e: React.MouseEvent) => {
    e.stopPropagation()
    compartir(bomba)
  }

  return (
    <div className="deal" onClick={onVerProducto} style={{ cursor: 'pointer' }}>
      <style>{`
        .deal { margin-top: 22px; }
        .deal + .deal { margin-top: 44px; }
        .deal-cols { display: block; }
        .deal-stage {
          position: relative;
          margin: 0 20px;
          background: linear-gradient(180deg, var(--plate) 0%, var(--line) 100%);
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          padding: 34px 20px;
          min-height: 298px;
        }
        .deal-stage img { height: 230px; width: auto; object-fit: contain; }
        .deal-actions-mobile { display: flex; justify-content: center; gap: 34px; padding: 16px 0 4px; }
        .deal-actions-desktop { display: none; }
        .deal-info { padding: 6px 20px 0; }
        .deal-sec { padding-top: 22px; }

        @media (min-width: 1000px) {
          .deal { margin-top: 36px; }
          .deal + .deal { margin-top: 60px; }
          /* Proporciones Trolley: 360px placa / 40px gap / resto info */
          .deal-cols { display: grid; grid-template-columns: 360px 1fr; gap: 40px; align-items: start; }
          .deal-stage { margin: 0; height: 418px; padding: 24px 16px; }
          .deal-stage img { height: 370px; max-width: 100%; }
          .deal-actions-mobile { display: none; }
          .deal-info { padding: 0; }
          /* Hairlines entre secciones, como Trolley */
          .deal-id { padding-bottom: 18px; border-bottom: 1px solid var(--line); }
          .deal-sec { padding: 18px 0; border-bottom: 1px solid var(--line); }
          .deal-actions-desktop {
            display: flex; gap: 26px; padding-top: 16px;
          }
        }
        @media (hover: hover) and (pointer: fine) {
          .deal-stage img { transition: transform 450ms var(--ease-out); }
          .deal:hover .deal-stage img { transform: scale(1.03); }
        }
        /* Pills con reveal al entrar en viewport (efecto Trolley): fade + rise pausado.
           650ms es deliberado — es reveal decorativo, no feedback de UI (esos van <300ms) */
        .deal-pill {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 650ms var(--ease-out), transform 650ms var(--ease-out);
        }
        .deal-pill:nth-child(2) { transition-delay: 160ms; }
        .deal-pills.on .deal-pill { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .deal:hover .deal-stage img { transform: none; }
          .deal-pill { transform: none; transition: opacity 200ms ease; }
        }
      `}</style>

      <div className="deal-cols">
        {/* ── Placa de imagen ── */}
        <div>
          <div className="deal-stage" ref={stageRef}>
            <span className="tnum" style={{
              position: 'absolute', top: 0, left: 0,
              width: '42px', height: '42px',
              background: 'var(--gold)', color: '#ffffff',
              borderRadius: '6px 0 14px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '19px', fontWeight: 600,
              zIndex: 1,
            }}>
              {rank}
            </span>
            <div className={`deal-pills${pillsVisibles ? ' on' : ''}`} style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', zIndex: 1 }}>
              {bomba.ahorroEnPlata > 0 && (
                <span className="deal-pill tnum" style={{
                  background: 'var(--pill)', color: '#ffffff',
                  fontSize: '13.9px', fontWeight: 600,
                  borderRadius: '999px', padding: '7px 14px', whiteSpace: 'nowrap',
                }}>
                  Ahorrás {formatearPrecio(bomba.ahorroEnPlata)}
                </span>
              )}
              {bomba.ahorroVsMaximo > 0 && (
                <span className="deal-pill tnum" style={{
                  background: 'var(--pill)', color: '#ffffff',
                  fontSize: '13.9px', fontWeight: 600,
                  borderRadius: '999px', padding: '7px 14px', whiteSpace: 'nowrap',
                }}>
                  {bomba.ahorroVsMaximo}% más barato
                </span>
              )}
            </div>
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={bomba.nombre}
                width={370}
                height={370}
                className="img-plate"
                style={{ objectFit: 'contain' }}
                unoptimized
                onError={onError}
              />
            ) : (
              <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--line)', fontSize: '48px' }}>?</div>
            )}
          </div>

          {/* Acciones mobile — centradas bajo la imagen */}
          <div className="deal-actions-mobile">
            <motion.button
              onClick={handleGuardar}
              whileTap={{ scale: 0.94 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                fontSize: '12px', color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
              Lista
            </motion.button>
            <motion.button
              onClick={handleCompartir}
              whileTap={{ scale: 0.94 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                fontSize: '12px', color: 'var(--ink)', background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m13 5 7 7-7 7M20 12H8a5 5 0 0 0-5 5" /></svg>
              Compartir
            </motion.button>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="deal-info">
          {/* Identidad */}
          <div className="deal-id">
            <div className="line-clamp-2" style={{ fontSize: '21.44px', fontWeight: 600, letterSpacing: '-0.2px', color: 'var(--ink)', lineHeight: 1.3 }}>
              {bomba.nombre}
            </div>
            <div style={{ fontSize: '19.3px', fontWeight: 300, color: 'var(--ink)', lineHeight: 1.3, marginTop: '1px' }}>
              {bomba.subcategoria}
            </div>
            {tamano && (
              <span className="tnum" style={{
                display: 'inline-block', marginTop: '8px',
                background: 'var(--pill)', color: '#ffffff',
                fontSize: '12px', fontWeight: 600,
                borderRadius: '999px', padding: '4px 12px',
              }}>
                {tamano}
              </span>
            )}
          </div>

          {/* Dónde comprarlo */}
          {preciosValidos.length > 0 && (
            <div className="deal-sec">
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>Dónde comprarlo</div>
              <div style={{ display: 'flex', marginTop: '14px' }}>
                {preciosValidos.slice(0, 3).map((precio, idx) => (
                  <div key={precio.mayorista} style={{ flex: 1 }}>
                    {LOGOS[precio.mayorista] ? (
                      <Image
                        src={LOGOS[precio.mayorista]}
                        alt={precio.mayorista}
                        width={60}
                        height={17}
                        style={{ height: '17px', width: 'auto', objectFit: 'contain', display: 'block' }}
                        unoptimized
                      />
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--ink)' }}>{precio.mayorista}</span>
                    )}
                    <div className="tnum" style={{ fontSize: '17px', fontWeight: idx === 0 ? 600 : 500, marginTop: '7px', color: 'var(--ink)' }}>
                      {formatearPrecio(precio.precio)}
                    </div>
                    {idx === 0 && (
                      <div style={{ fontSize: '10.7px', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.04em' }}>
                        MÁS BARATO
                      </div>
                    )}
                    <div style={{ marginTop: '5px' }}>
                      <FrescuraPill precio={precio} compact />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Datos del producto + insight */}
          <div className="deal-sec" style={{ borderBottom: 'none' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>Datos del producto</div>
            <div className="tnum" style={{ marginTop: '8px', fontSize: '12.8px', color: 'var(--green)', fontWeight: 500 }}>
              {esEan ? `EAN ${bomba.id} · ` : ''}{bomba.abc ? `Clase ${bomba.abc} · ` : ''}{preciosValidos.length} mayorista{preciosValidos.length !== 1 ? 's' : ''} lo {preciosValidos.length !== 1 ? 'venden' : 'vende'}
            </div>
            {pctSobreMejor > 0 && (
              <p className="tnum" style={{ marginTop: '10px', marginBottom: 0, fontSize: '14px', fontWeight: 300, lineHeight: 1.55, color: 'var(--ink)' }}>
                El precio de {masCaro.mayorista} está {pctSobreMejor}% por encima del mejor — revisalo antes de reponer stock.
              </p>
            )}
          </div>

          {/* Acciones desktop — fila al pie con hairline, como Trolley */}
          <div className="deal-actions-desktop" style={{ borderTop: '1px solid var(--line)' }}>
            <motion.button
              onClick={handleGuardar}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '14px', fontWeight: 500, color: 'var(--ink)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', padding: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
              Lista
            </motion.button>
            <motion.button
              onClick={handleCompartir}
              whileTap={{ scale: 0.96 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '14px', fontWeight: 500, color: 'var(--ink)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', padding: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m13 5 7 7-7 7M20 12H8a5 5 0 0 0-5 5" /></svg>
              Compartir
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
