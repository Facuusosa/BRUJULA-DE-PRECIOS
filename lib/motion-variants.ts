import type { Variants, TargetAndTransition } from 'framer-motion'

const spring = { type: 'spring', stiffness: 400, damping: 25 } as const

// Card — eleva 2px con depth visual
export const cardHover = {
  whileHover: { scale: 1.02, y: -2 } as TargetAndTransition,
  whileTap:   { scale: 0.98 }        as TargetAndTransition,
  transition: spring,
}

// Botón primario
export const btnHover = {
  whileHover: { scale: 1.03 } as TargetAndTransition,
  whileTap:   { scale: 0.97 } as TargetAndTransition,
  transition: spring,
}

// Ícono / botón pequeño (nav, favorito, +)
export const iconTap = {
  whileTap:   { scale: 0.88 } as TargetAndTransition,
  transition: spring,
}

// Chip de filtro / categoría
export const chipHover = {
  whileHover: { scale: 1.05 } as TargetAndTransition,
  whileTap:   { scale: 0.95 } as TargetAndTransition,
  transition: spring,
}

// Lista con stagger — usar en el contenedor
export const listContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

// Item de lista con stagger
export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: spring },
}

// Fade + Y para page transitions
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:   { opacity: 0, y: -4, transition: { duration: 0.15, ease: 'easeIn' } },
}
