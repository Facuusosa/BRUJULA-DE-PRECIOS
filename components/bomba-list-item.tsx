'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ProductoBomba, formatearPrecio, extraerTamano } from '@/lib/data'
import Magnet from '@/components/reactbits/Animations/Magnet/Magnet'

const LOGOS: Record<string, string> = {
  'Maxiconsumo':   '/mayoristas/maxiconsumo.webp',
  'Yaguar':        '/mayoristas/yaguar.png',
  'MaxiCarrefour': '/mayoristas/maxicarrefour.jpg',
}

interface BombaListItemProps {
  bomba: ProductoBomba
  rank: number
  onVerProducto: () => void
}

export function BombaListItem({ bomba, rank, onVerProducto }: BombaListItemProps) {
  const tamano = extraerTamano(bomba.nombre)
  const preciosValidos = bomba.precios
    .filter(p => p.precio > 0)
    .sort((a, b) => a.precio - b.precio)

  return (
    <>
      <style>{`
        .bli-wrap {
          display: flex;
          flex-direction: column;
          border-bottom: 1px solid var(--c-border-dark, #2a2a2a);
          overflow: hidden;
        }
        .bli-img {
          position: relative;
          width: 100%;
          height: 260px;
          background: #141414;
          flex-shrink: 0;
        }
        .bli-info {
          display: flex;
          flex-direction: column;
          padding: 20px 20px 28px;
          gap: 12px;
          border-top: 1px solid #2a2a2a;
          background: #141414;
        }
        .bli-nombre {
          font-family: var(--font-sans);
          font-size: 20px;
          font-weight: 600;
          color: #f7f7f7;
          line-height: 1.33;
        }
        .bli-ahorro {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
        }
        .bli-precio-val {
          font-size: 15px;
          font-weight: 500;
          color: #f7f7f7;
          line-height: 1.33;
        }
        .bli-precio-val-best {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          color: #d4a574;
        }
        @media (min-width: 700px) {
          .bli-wrap {
            flex-direction: row;
            align-items: stretch;
            min-height: 340px;
          }
          .bli-img {
            width: 42%;
            height: auto;
            min-height: 340px;
            border-right: 1px solid #2a2a2a;
          }
          .bli-info {
            flex: 1;
            border-top: none;
            padding: 24px 28px 32px;
            gap: 14px;
          }
          .bli-nombre {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="bli-wrap">

        {/* IMAGEN */}
        <div className="bli-img">
          {/* Badge rank */}
          <div style={{
            position: 'absolute', top: '14px', left: '14px', zIndex: 2,
            width: '36px', height: '36px',
            background: rank === 1 ? '#d4a574' : '#1a1a1a',
            color: rank === 1 ? '#0a0a0a' : '#f7f7f7',
            border: rank > 1 && rank <= 3 ? '1px solid #d4a574' : 'none',
            fontFamily: 'var(--font-display)',
            fontSize: '18px', fontWeight: 800,
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {rank}
          </div>

          {/* Badge ahorro % — gold */}
          {bomba.ahorroVsMaximo > 0 && (
            <div style={{
              position: 'absolute', top: '14px', right: '14px', zIndex: 2,
              background: '#d4a574', color: '#0a0a0a',
              fontSize: '12px', fontWeight: 900,
              padding: '5px 12px', borderRadius: '20px',
              letterSpacing: '0.03em',
            }}>
              {bomba.ahorroVsMaximo}% mas barato
            </div>
          )}

          {bomba.imageUrl ? (
            <Image
              src={bomba.imageUrl}
              alt={bomba.nombre}
              fill
              style={{ objectFit: 'contain', padding: '20px' }}
              unoptimized
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#2a2a2a', fontSize: '48px',
            }}>?</div>
          )}
        </div>

        {/* INFO */}
        <div className="bli-info">

          {/* Nombre */}
          <div className="bli-nombre">{bomba.nombre}</div>

          {/* Tamaño + ahorro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {tamano && (
              <span style={{
                alignSelf: 'flex-start',
                background: '#222222',
                color: '#f7f7f7',
                border: '1px solid #2a2a2a',
                fontSize: '12px', fontWeight: 700,
                padding: '4px 10px', borderRadius: '4px',
                letterSpacing: '0.05em',
              }}>
                {tamano}
              </span>
            )}
            {bomba.ahorroEnPlata > 0 && (
              <span className="bli-ahorro">
                Ahorras {formatearPrecio(bomba.ahorroEnPlata)} comprando en el mas barato
              </span>
            )}
          </div>

          {/* Tabla de precios */}
          {preciosValidos.length > 0 && (
            <>
              <div style={{
                fontSize: '11px', fontWeight: 800,
                color: '#6b7280', letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                Donde comprarlo
              </div>

              <div style={{
                border: '1px solid #2a2a2a',
                borderRadius: '10px',
                overflow: 'hidden',
              }}>
                {preciosValidos.map((precio, idx) => (
                  <div
                    key={precio.mayorista}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderTop: idx > 0 ? '1px solid #2a2a2a' : 'none',
                      background: idx === 0 ? '#1a1a1a' : '#141414',
                      borderLeft: idx === 0 ? '3px solid #d4a574' : '3px solid transparent',
                    }}
                  >
                    {/* Logo */}
                    <div style={{ width: '56px', height: '20px', position: 'relative', flexShrink: 0 }}>
                      {LOGOS[precio.mayorista] ? (
                        <Image
                          src={LOGOS[precio.mayorista]}
                          alt={precio.mayorista}
                          fill
                          style={{ objectFit: 'contain', objectPosition: 'left' }}
                          unoptimized
                        />
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#f7f7f7' }}>{precio.mayorista}</span>
                      )}
                    </div>

                    {/* Precio + badge */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className={idx === 0 ? 'bli-precio-val-best' : 'bli-precio-val'}>
                        {formatearPrecio(precio.precio)}
                      </span>
                      {idx === 0 && (
                        <span style={{
                          alignSelf: 'flex-start',
                          background: '#d4a574',
                          color: '#0a0a0a',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}>
                          Mejor
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Botón */}
          <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
            <Magnet padding={20} magnetStrength={18}>
              <motion.button
                onClick={onVerProducto}
                whileHover={{ backgroundColor: '#d4a574', color: '#0a0a0a', scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '13px 24px',
                  minHeight: '44px',
                  background: 'transparent',
                  color: '#d4a574',
                  border: '2px solid #d4a574',
                  borderRadius: '20px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Ver producto
              </motion.button>
            </Magnet>
          </div>
        </div>
      </div>
    </>
  )
}
