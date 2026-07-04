'use client'

import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HScrollProps {
  children: ReactNode
  /* className y style van al row scrolleable, así los selectores CSS existentes
     (.det-rel-scroll, .cat-filters, etc.) siguen funcionando sin cambios */
  className?: string
  style?: CSSProperties
  /* Corrección vertical de las flechas cuando el row tiene padding-top asimétrico */
  arrowOffsetY?: number
}

/* Row horizontal con flechas de navegación en desktop (hover + mouse).
   En touch las flechas no existen: se sigue scrolleando con el dedo. */
export function HScroll({ children, className, style, arrowOffsetY = 0 }: HScrollProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const row = rowRef.current
    if (!row) return
    setCanPrev(row.scrollLeft > 2)
    setCanNext(row.scrollLeft < row.scrollWidth - row.clientWidth - 2)
  }, [])

  useEffect(() => {
    update()
    const row = rowRef.current
    if (!row) return
    const ro = new ResizeObserver(update)
    ro.observe(row)
    return () => ro.disconnect()
  }, [update])

  const desplazar = (dir: 1 | -1) => {
    const row = rowRef.current
    if (!row) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' })
  }

  const btnTop = arrowOffsetY === 0 ? '50%' : `calc(50% + ${arrowOffsetY}px)`

  return (
    <div style={{ position: 'relative' }}>
      <div ref={rowRef} className={className} style={style} onScroll={update}>
        {children}
      </div>
      <button
        type="button"
        aria-label="Ver anteriores"
        className="hscroll-btn"
        data-visible={canPrev}
        disabled={!canPrev}
        style={{ left: '10px', top: btnTop }}
        onClick={() => desplazar(-1)}
      >
        <ChevronLeft size={18} strokeWidth={2.2} />
      </button>
      <button
        type="button"
        aria-label="Ver siguientes"
        className="hscroll-btn"
        data-visible={canNext}
        disabled={!canNext}
        style={{ right: '10px', top: btnTop }}
        onClick={() => desplazar(1)}
      >
        <ChevronRight size={18} strokeWidth={2.2} />
      </button>
    </div>
  )
}
