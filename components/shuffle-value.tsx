'use client'

import { useState, useEffect, useRef } from 'react'

/* Shuffle de dígitos (estilo shuffle-number de 21st.dev, efecto aprobado en spec v2):
   al cambiar el valor, los dígitos barajan brevemente antes de asentarse */
export function ShuffleValue({ value, duration = 220, style }: { value: string; duration?: number; style?: React.CSSProperties }) {
  const [display, setDisplay] = useState(value)
  const rafRef = useRef<number>(0)
  const prevRef = useRef(value)

  useEffect(() => {
    if (value === prevRef.current) return
    prevRef.current = value
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const p = (now - start) / duration
      if (p >= 1) {
        setDisplay(value)
        return
      }
      // Los dígitos se van asentando a medida que avanza p
      setDisplay(value.replace(/\d/g, d => (Math.random() < p ? d : String(Math.floor(Math.random() * 10)))))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <span className="tnum" style={style}>{display}</span>
}
