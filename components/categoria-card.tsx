'use client'

import { useEffect, useRef } from 'react'
import { FotoCategoria } from '@/lib/categoria-fotos'

interface CategoriaCardProps {
  nombre: string
  count: string          // ya formateado ("3.657")
  ahorroPct: number      // 0 = sin badge
  fotos: FotoCategoria[]
  onClick: () => void
}

/* Cajas de foto dentro de la tarjeta 170×210. No se tocan por construcción:
   hero 8..102, escolta 106..162 (4px de aire). La escala nunca supera el
   ancho de la caja, así que la superposición es imposible. */
const BOX = { hero: { w: 94, h: 146 }, escolta: { w: 56, h: 112 } }

/* Escala para que el producto (bbox medido en lib/categoria-fotos) llene su caja.
   El lienzo sobrante del packshot es blanco y el multiply lo hace invisible,
   por eso la imagen puede crecer más allá de la caja sin ensuciar la placa. */
function escalaProducto(foto: FotoCategoria, slot: 'hero' | 'escolta', natW: number, natH: number): number {
  const box = BOX[slot]
  const fit = Math.min(box.w / natW, box.h / natH)   // escala de object-fit: contain
  const prodW = foto.w * natW * fit
  const prodH = foto.h * natH * fit
  const kH = (0.94 * box.h) / prodH                  // 6% de aire arriba: nada roza el badge
  const kW = box.w / prodW
  return Math.min(Math.max(1, Math.min(kH, kW)), 1.8)
}

function aplicarEscala(img: HTMLImageElement, foto: FotoCategoria, slot: 'hero' | 'escolta') {
  const listo = () => {
    const k = escalaProducto(foto, slot, img.naturalWidth, img.naturalHeight)
    img.style.transform = `scale(${k.toFixed(2)})`
  }
  if (img.complete && img.naturalWidth > 0) listo()
  else img.onload = listo
}

export function CategoriaCard({ nombre, count, ahorroPct, fotos, onClick }: CategoriaCardProps) {
  const heroRef = useRef<HTMLImageElement>(null)
  const escoltaRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    const escolta = escoltaRef.current
    if (!hero || !escolta) return
    aplicarEscala(hero, fotos[0], 'hero')
    if (fotos[1]) aplicarEscala(escolta, fotos[1], 'escolta')

    // Rotación: un slot por vez con crossfade; hero recorre índices pares y
    // escolta impares, así nunca muestran la misma foto
    if (fotos.length < 4) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const slots: Record<'hero' | 'escolta', HTMLImageElement> = { hero, escolta }
    const idx = { hero: 0, escolta: 1 }
    let paso = 0
    // desfase pseudoaleatorio por tarjeta para que no roten todas juntas
    const periodo = 3200 + (nombre.length % 5) * 400
    const timer = setInterval(() => {
      const slot: 'hero' | 'escolta' = paso % 2 === 0 ? 'hero' : 'escolta'
      paso++
      idx[slot] = (idx[slot] + 2) % fotos.length
      const img = slots[slot]
      const foto = fotos[idx[slot]]
      img.style.opacity = '0'
      setTimeout(() => {
        img.src = foto.src
        aplicarEscala(img, foto, slot)
        img.style.opacity = slot === 'escolta' ? '0.96' : '1'
      }, 700)
    }, periodo)
    return () => clearInterval(timer)
  }, [fotos, nombre])

  return (
    <button
      className="catcard"
      onClick={onClick}
      style={{
        position: 'relative', flexShrink: 0,
        width: '170px', height: '210px',
        borderRadius: '10px', overflow: 'hidden',
        border: 'none', cursor: 'pointer', padding: 0,
        background: 'var(--plate)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <span className="catcard-fotos" style={{ position: 'absolute', inset: 0, background: 'var(--plate)' }}>
        <img
          ref={heroRef}
          src={fotos[0]?.src} alt="" loading="lazy" className="img-plate"
          style={{
            position: 'absolute', left: '8px', bottom: '52px', width: '94px', height: '146px',
            objectFit: 'contain', objectPosition: '50% 100%', zIndex: 2,
            transformOrigin: '50% 100%', transition: 'opacity 700ms ease',
          }}
        />
        {fotos[1] && (
          <img
            ref={escoltaRef}
            src={fotos[1].src} alt="" loading="lazy" className="img-plate"
            style={{
              position: 'absolute', right: '8px', bottom: '52px', width: '56px', height: '112px',
              objectFit: 'contain', objectPosition: '50% 100%', zIndex: 1, opacity: 0.96,
              transformOrigin: '50% 100%', transition: 'opacity 700ms ease',
            }}
          />
        )}
      </span>
      <span style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 48%, rgba(10,10,10,0) 100%)',
      }} />
      {ahorroPct > 0 && (
        <span className="tnum" style={{
          position: 'absolute', top: '9px', left: '9px', zIndex: 2,
          background: '#ffffff', borderRadius: '999px', padding: '4px 10px',
          fontSize: '11px', fontWeight: 600, color: 'var(--green)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
        }}>
          hasta -{ahorroPct}% hoy
        </span>
      )}
      <span style={{
        position: 'absolute', bottom: '12px', left: '14px', right: '14px', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left',
      }}>
        <span className="tnum" style={{ fontSize: '11px', fontWeight: 400, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
          {count} productos
        </span>
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.2px', lineHeight: 1.25 }}>
          {nombre}
        </span>
      </span>
    </button>
  )
}
