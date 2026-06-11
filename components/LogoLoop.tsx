'use client'

import Image from 'next/image'

interface LogoItem {
  src: string
  alt: string
  url: string
}

export function LogoLoop({ items }: { items: LogoItem[] }) {
  // 2 copias del set y animación a -50%: el loop empalma sin salto
  const singleSet: LogoItem[] = [...items, ...items]
  const track = [...singleSet, ...singleSet]

  return (
    <div className="logo-loop">
      <style>{`
        .logo-loop { overflow: hidden; position: relative; padding: 16px 0 4px; }
        .logo-loop::before, .logo-loop::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 36px; z-index: 1;
          pointer-events: none;
        }
        .logo-loop::before { left: 0; background: linear-gradient(90deg, #ffffff, transparent); }
        .logo-loop::after { right: 0; background: linear-gradient(-90deg, #ffffff, transparent); }
        .logo-loop-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: logo-marquee 22s linear infinite;
          will-change: transform;
        }
        .logo-loop:hover .logo-loop-track { animation-play-state: paused; }
        @keyframes logo-marquee {
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .logo-loop-track { animation: none; }
        }
      `}</style>
      <div className="logo-loop-track">
        {track.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden={i >= singleSet.length}
            tabIndex={i >= singleSet.length ? -1 : 0}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '148px', height: '86px',
              border: '1px solid var(--line)', borderRadius: '4px',
              background: '#ffffff',
              textDecoration: 'none',
            }}
          >
            <Image
              src={item.src}
              alt={i >= singleSet.length ? '' : item.alt}
              width={104}
              height={40}
              style={{ maxWidth: '104px', maxHeight: '40px', objectFit: 'contain', width: 'auto', height: 'auto' }}
              unoptimized
            />
          </a>
        ))}
      </div>
    </div>
  )
}
