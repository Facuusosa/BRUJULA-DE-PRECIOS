'use client'

import { useState, useRef, useCallback } from 'react'
import { Check } from 'lucide-react'

interface SlideButtonProps {
  onComplete: () => void
  disabled?: boolean
}

type Estado = 'idle' | 'loading' | 'done'

const TRACK_H = 60
const THUMB_SIZE = 50
const PADDING = 5

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6l-3-4H6z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)

const Spinner = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
    </path>
  </svg>
)

export function SlideButton({ onComplete, disabled = false }: SlideButtonProps) {
  const [estado, setEstado] = useState<Estado>('idle')
  const [thumbX, setThumbX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)

  const trackW = useCallback(() => {
    return (trackRef.current?.offsetWidth ?? 300) - THUMB_SIZE - PADDING * 2
  }, [])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || estado !== 'idle') return
    setIsDragging(true)
    startXRef.current = e.clientX - thumbX
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const newX = Math.max(0, Math.min(e.clientX - startXRef.current, trackW()))
    setThumbX(newX)
  }

  const handlePointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    const pct = thumbX / trackW()
    if (pct > 0.85) {
      setThumbX(trackW())
      setEstado('loading')
      setTimeout(() => {
        setEstado('done')
        onComplete()
      }, 1200)
    } else {
      setThumbX(0)
    }
  }

  const label = {
    idle: 'Deslizá para armar tu lista',
    loading: 'Armando lista...',
    done: '¡Lista armada!',
  }[estado]

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        height: `${TRACK_H}px`,
        borderRadius: '30px',
        background: '#0a0a0a',
        padding: `${PADDING}px`,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'default',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Texto track */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: estado === 'done' ? '#d4a574' : 'rgba(255,255,255,0.65)',
          fontSize: '14px',
          fontWeight: 700,
          pointerEvents: 'none',
          paddingLeft: `${THUMB_SIZE + 16}px`,
          paddingRight: '16px',
        }}
      >
        {label}
      </div>

      {/* Thumb */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'absolute',
          top: `${PADDING}px`,
          left: `${PADDING + thumbX}px`,
          width: `${THUMB_SIZE}px`,
          height: `${THUMB_SIZE}px`,
          borderRadius: '50%',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          color: '#0a0a0a',
          zIndex: 2,
        }}
      >
        {estado === 'idle' && <CartIcon />}
        {estado === 'loading' && <Spinner />}
        {estado === 'done' && <Check size={22} strokeWidth={2.5} color="#0a0a0a" />}
      </div>
    </div>
  )
}
