'use client'

import React from 'react'

interface AnimatedListProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function AnimatedList({ className, style, children }: AnimatedListProps) {
  const items = React.Children.toArray(children)

  return (
    <div className={className} style={style}>
      {items.map((child, i) => (
        <div
          key={i}
          style={{
            animation: `fade-in-up 0.35s ease-out ${Math.min(i * 35, 600)}ms both`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
