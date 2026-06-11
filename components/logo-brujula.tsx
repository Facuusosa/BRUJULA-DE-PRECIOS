// Monograma B (concepto C, elegido 09/06/2026). Inline para que <text> herede Poppins.
export function LogoBrujula({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="var(--ink)" />
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="36"
        fontWeight="700"
        fill="#ffffff"
      >
        B
      </text>
      <g transform="translate(46 18) rotate(45)">
        <path d="M0,-9 L4,0 L0,2.5 L-4,0 Z" fill="var(--gold)" />
        <path d="M0,9 L4,0 L0,2.5 L-4,0 Z" fill="var(--gold)" opacity="0.45" />
      </g>
    </svg>
  )
}
