'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { BookmarkPlus, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { ProductoBomba, formatearPrecio, extraerTamano } from '@/lib/data'

const LOGOS: Record<string, string> = {
  'Maxiconsumo':   '/mayoristas/maxiconsumo.webp',
  'Yaguar':        '/mayoristas/yaguar.png',
  'MaxiCarrefour': '/mayoristas/maxicarrefour.jpg',
}

const SPRING = 'cubic-bezier(0.32, 0.72, 0, 1)'

interface BombaListItemProps {
  bomba: ProductoBomba
  rank: number
  onVerProducto: () => void
  onGuardar?: () => void
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#d4a574' : 'none'} stroke={filled ? '#d4a574' : '#505050'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function BombaListItem({ bomba, rank, onVerProducto, onGuardar }: BombaListItemProps) {
  const tamano = extraerTamano(bomba.nombre)
  const preciosValidos = bomba.precios
    .filter(p => p.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  const [imgSrc, setImgSrc] = useState(bomba.imageUrl || '')
  const [fallbackIdx, setFallbackIdx] = useState(0)

  const handleImageError = () => {
    const fallbacks = bomba.imagenFallbacks || []
    if (fallbackIdx < fallbacks.length) {
      setImgSrc(fallbacks[fallbackIdx])
      setFallbackIdx(prev => prev + 1)
    } else {
      setImgSrc('')
    }
  }

  const handleGuardar = (e: React.MouseEvent) => {
    e.stopPropagation()
    onGuardar?.()
    toast.success('Agregado a tu lista')
  }

  const handleCompartir = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: bomba.nombre, text: `${bomba.nombre} — Brujula de Precios` }).catch(() => null)
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(bomba.nombre)
      toast.success('Nombre copiado')
    }
  }

  return (
    <>
      <style>{`
        .bli-wrap {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid #222;
          overflow: hidden;
          cursor: pointer;
          transition: background 0.3s ${SPRING};
        }
        .bli-wrap:hover { background: rgba(212,165,116,0.025); }

        /* IMAGEN */
        .bli-img {
          position: relative;
          width: 100%;
          height: 240px;
          background: #141414;
          flex-shrink: 0;
        }

        /* INFO panel */
        .bli-info {
          display: flex;
          flex-direction: column;
          padding: 18px 18px 20px;
          gap: 14px;
          border-top: 1px solid #222;
          background: #141414;
        }

        /* Nombre */
        .bli-nombre {
          font-size: 18px;
          font-weight: 700;
          color: #f0f0f0;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        /* Sección label */
        .bli-label {
          font-size: 10px;
          font-weight: 800;
          color: #555;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        /* Precios: filas verticales */
        .bli-precios-list {
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          overflow: hidden;
        }
        .bli-precio-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          position: relative;
        }
        .bli-precio-row-best {
          background: #1a1a1a;
          border-left: 3px solid #d4a574;
        }
        .bli-precio-row-rest {
          background: #141414;
          border-top: 1px solid #2a2a2a;
          border-left: 3px solid transparent;
        }
        .bli-precio-logo {
          width: 56px;
          height: 20px;
          position: relative;
          flex-shrink: 0;
        }
        .bli-precio-num-best {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: #d4a574;
          line-height: 1;
        }
        .bli-precio-num-rest {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 500;
          color: #f0f0f0;
          line-height: 1;
        }
        .bli-mejor-badge {
          background: #d4a574;
          color: #0a0a0a;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 10px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Valoración */
        .bli-val-row {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Acciones */
        .bli-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .bli-btn-guardar {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: 20px;
          border: 1px solid #2a2a2a;
          background: transparent;
          color: #6b7280;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: border-color 0.25s ${SPRING}, color 0.25s ${SPRING};
          -webkit-tap-highlight-color: transparent;
        }
        .bli-btn-guardar:hover { border-color: #d4a574; color: #d4a574; }
        .bli-btn-share {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px; height: 38px;
          border-radius: 50%;
          border: 1px solid #2a2a2a;
          background: transparent;
          color: #555;
          cursor: pointer;
          transition: border-color 0.25s ${SPRING}, color 0.25s ${SPRING};
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .bli-btn-share:hover { border-color: #d4a574; color: #d4a574; }

        /* Desktop */
        @media (min-width: 700px) {
          .bli-wrap { flex-direction: row; align-items: stretch; min-height: 320px; }
          .bli-img { width: 40%; height: auto; min-height: 320px; border-right: 1px solid #222; }
          .bli-info { flex: 1; border-top: none; padding: 24px 26px 26px; }
          .bli-nombre { font-size: 20px; }
        }
      `}</style>

      <div className="bli-wrap" onClick={onVerProducto}>

        {/* IMAGEN */}
        <div className="bli-img">
          {/* Rank */}
          <div style={{
            position: 'absolute', top: '12px', left: '12px', zIndex: 2,
            width: '34px', height: '34px',
            background: rank === 1 ? '#d4a574' : '#1a1a1a',
            color: rank === 1 ? '#0a0a0a' : '#f0f0f0',
            border: rank > 1 && rank <= 3 ? '1px solid #d4a574' : 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '17px', fontWeight: 800,
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {rank}
          </div>

          {/* % ahorro */}
          {bomba.ahorroVsMaximo > 0 && (
            <div style={{
              position: 'absolute', top: '12px', right: '12px', zIndex: 2,
              background: '#d4a574', color: '#0a0a0a',
              fontSize: '11px', fontWeight: 900,
              padding: '4px 11px', borderRadius: '20px',
              letterSpacing: '0.02em',
            }}>
              {bomba.ahorroVsMaximo}% mas barato
            </div>
          )}

          {imgSrc ? (
            <Image src={imgSrc} alt={bomba.nombre} fill style={{ objectFit: 'contain', padding: '20px' }} unoptimized onError={handleImageError} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '48px' }}>?</div>
          )}
        </div>

        {/* INFO */}
        <div className="bli-info">

          {/* Nombre + tamaño */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="bli-nombre">{bomba.nombre}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {tamano && (
                <span style={{
                  background: '#1e1e1e', color: '#ccc',
                  border: '1px solid #2a2a2a',
                  fontSize: '11px', fontWeight: 700,
                  padding: '3px 9px', borderRadius: '4px',
                  letterSpacing: '0.06em',
                }}>
                  {tamano}
                </span>
              )}
              {bomba.ahorroEnPlata > 0 && (
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>
                  Ahorras {formatearPrecio(bomba.ahorroEnPlata)} en el mas barato
                </span>
              )}
            </div>
          </div>

          {/* Precios en columnas — como Trolley "Where to buy" */}
          {preciosValidos.length > 0 && (
            <div>
              <div className="bli-label">Donde comprarlo</div>
              <div className="bli-precios-list">
                {preciosValidos.map((precio, idx) => (
                  <div
                    key={precio.mayorista}
                    className={`bli-precio-row ${idx === 0 ? 'bli-precio-row-best' : 'bli-precio-row-rest'}`}
                  >
                    {/* Logo */}
                    <div className="bli-precio-logo">
                      {LOGOS[precio.mayorista] ? (
                        <Image
                          src={LOGOS[precio.mayorista]}
                          alt={precio.mayorista}
                          fill
                          style={{ objectFit: 'contain', objectPosition: 'left' }}
                          unoptimized
                        />
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#ccc' }}>{precio.mayorista}</span>
                      )}
                    </div>

                    {/* Precio + MEJOR al lado */}
                    <span className={idx === 0 ? 'bli-precio-num-best' : 'bli-precio-num-rest'}>
                      {formatearPrecio(precio.precio)}
                    </span>
                    {idx === 0 && <span className="bli-mejor-badge">MEJOR</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valoraciones — como "What people say" en Trolley */}
          <div>
            <div className="bli-label">Valoraciones</div>
            <div className="bli-val-row">
              {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={false} />)}
              <span style={{ fontSize: '12px', color: '#444', marginLeft: '5px' }}>Sin valoraciones aun</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="bli-actions">
            <motion.button
              className="bli-btn-guardar"
              onClick={handleGuardar}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              <BookmarkPlus size={14} />
              +Lista
            </motion.button>
            <motion.button
              className="bli-btn-share"
              onClick={handleCompartir}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.15 }}
            >
              <Share2 size={15} />
            </motion.button>
          </div>

        </div>
      </div>
    </>
  )
}
