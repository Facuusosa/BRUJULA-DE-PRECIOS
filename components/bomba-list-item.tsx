'use client'

import Image from 'next/image'
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
          border-bottom: 1px solid var(--c-border);
          overflow: hidden;
        }
        .bli-img {
          position: relative;
          width: 100%;
          height: 400px;
          background: #fff;
          flex-shrink: 0;
        }
        .bli-info {
          display: flex;
          flex-direction: column;
          padding: 20px 20px 28px;
          gap: 12px;
          border-top: 1px solid var(--c-border);
        }
        .bli-nombre {
          font-family: var(--font-sans);
          font-size: 21px;
          font-weight: 600;
          color: #0a0a0a;
          line-height: 1.33;
        }
        .bli-ahorro {
          font-size: 15px;
          font-weight: 600;
          color: var(--c-green);
        }
        .bli-precio-val {
          font-size: 15px;
          font-weight: 500;
          color: #0a0a0a;
          line-height: 1.33;
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
            border-right: 1px solid var(--c-border);
          }
          .bli-info {
            flex: 1;
            border-top: none;
            padding: 24px 28px 32px;
            gap: 14px;
          }
          .bli-nombre {
            font-size: 23px;
          }
          .bli-ahorro {
            font-size: 16px;
          }
          .bli-precio-val {
            font-size: 17px;
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
            background: rank <= 3 ? '#0a0a0a' : '#e5e7eb',
            color: rank <= 3 ? '#fff' : '#555',
            fontSize: '16px', fontWeight: 800,
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {rank}
          </div>

          {/* Badge ahorro % */}
          {bomba.ahorroVsMaximo > 0 && (
            <div style={{
              position: 'absolute', top: '14px', right: '14px', zIndex: 2,
              background: '#0a0a0a', color: '#fff',
              fontSize: '12px', fontWeight: 800,
              padding: '5px 12px', borderRadius: '20px',
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
              color: '#d1d5db', fontSize: '48px',
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
                background: '#0a0a0a', color: '#fff',
                fontSize: '12px', fontWeight: 800,
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
                color: '#888', letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                Donde comprarlo
              </div>

              <div style={{
                border: '1px solid var(--c-border)',
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
                      borderTop: idx > 0 ? '1px solid var(--c-border)' : 'none',
                      background: idx === 0 ? '#f7f7f7' : '#fff',
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
                        <span style={{ fontSize: '11px', fontWeight: 700 }}>{precio.mayorista}</span>
                      )}
                    </div>

                    {/* Precio + badge */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span className="bli-precio-val">{formatearPrecio(precio.precio)}</span>
                      {idx === 0 && (
                        <span style={{
                          alignSelf: 'flex-start',
                          background: 'var(--c-best)',
                          color: 'var(--c-best-text)',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '10px',
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
            <Magnet padding={20} magnetStrength={25}>
              <button
                onClick={onVerProducto}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '11px 24px',
                  background: 'transparent',
                  color: '#0a0a0a',
                  border: '2px solid #0a0a0a',
                  borderRadius: '20px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#0a0a0a'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#0a0a0a'
                }}
              >
                Ver producto
              </button>
            </Magnet>
          </div>
        </div>
      </div>
    </>
  )
}
