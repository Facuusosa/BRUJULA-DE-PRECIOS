'use client'

import Image from 'next/image'

interface LogoItem {
  src: string
  alt: string
  url: string
}

const CARD_W = 140
const GAP    = 24
const STEP   = CARD_W + GAP  // 164px per card slot
const SPEED  = 80             // px/s

export function LogoLoop({ items }: { items: LogoItem[] }) {
  // Need each set to be wider than the content area (~1080px).
  // ceil(1100 / 164) = 7, use 8 for safety → with 3 items: 3 copies = 9 items per set
  const copiesNeeded = Math.ceil(8 / items.length)
  const singleSet: LogoItem[] = Array(copiesNeeded).fill(items).flat()

  // Duplicate so the second set picks up exactly where the first ends
  const track = [...singleSet, ...singleSet]

  const cycleDistance = singleSet.length * STEP
  const duration      = (cycleDistance / SPEED).toFixed(1)

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <style>{`
        .logo-loop-track {
          display: flex;
          align-items: center;
          gap: ${GAP}px;
          width: max-content;
          animation: logo-scroll ${duration}s linear infinite;
          will-change: transform;
        }
        .logo-loop-track:hover { animation-play-state: paused; }
        @keyframes logo-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${cycleDistance}px); }
        }
      `}</style>
      <div className="logo-loop-track">
        {track.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: `${CARD_W}px`, height: '72px',
              border: '1.5px solid #e5e7eb', borderRadius: '12px',
              background: '#fff', padding: '12px',
              cursor: 'pointer',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#0a0a0a'
              e.currentTarget.style.boxShadow   = '0 2px 12px rgba(10,61,31,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#e5e7eb'
              e.currentTarget.style.boxShadow   = 'none'
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image src={item.src} alt={item.alt} fill style={{ objectFit: 'contain' }} unoptimized />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
