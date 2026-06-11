'use client'

import { motion } from 'framer-motion'
import { Search, Heart, User } from 'lucide-react'
import { LogoBrujula } from '@/components/logo-brujula'

interface AppHeaderProps {
  onSearchClick?: () => void
  onPerfil?: () => void
  onFavoritos?: () => void
  onMenuClick?: () => void
  onLogoClick?: () => void
}

export function AppHeader({ onSearchClick, onPerfil, onFavoritos, onMenuClick, onLogoClick }: AppHeaderProps) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '16px 20px',
      flexShrink: 0,
    }}>
      {/* Hamburguesa — 3 líneas como el mockup */}
      <motion.button
        onClick={onMenuClick}
        whileTap={{ scale: 0.92 }}
        aria-label="Categorías"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: '5px',
          padding: '10px 8px', margin: '-10px -8px', flexShrink: 0,
        }}
      >
        <i style={{ display: 'block', width: '22px', height: '2.5px', background: 'var(--ink)', borderRadius: '2px' }} />
        <i style={{ display: 'block', width: '22px', height: '2.5px', background: 'var(--ink)', borderRadius: '2px' }} />
        <i style={{ display: 'block', width: '22px', height: '2.5px', background: 'var(--ink)', borderRadius: '2px' }} />
      </motion.button>

      {/* Wordmark */}
      <motion.div
        onClick={onLogoClick}
        whileTap={{ scale: 0.97 }}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, cursor: onLogoClick ? 'pointer' : 'default' }}
      >
        <LogoBrujula size={34} />
        <span style={{
          fontSize: '18.5px',
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '-0.4px',
          whiteSpace: 'nowrap',
        }}>
          Brújula{' '}
          <span style={{ color: 'var(--gray)', fontWeight: 400, fontSize: '15.5px' }}>de precios</span>
        </span>
      </motion.div>

      {/* Íconos derecha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, color: 'var(--ink)' }}>
        <motion.button
          onClick={onSearchClick}
          whileTap={{ scale: 0.9 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '10px 6px', display: 'flex' }}
          aria-label="Buscar"
        >
          <Search size={22} strokeWidth={2} />
        </motion.button>
        <motion.button
          onClick={onFavoritos}
          whileTap={{ scale: 0.9 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '10px 6px', display: 'flex' }}
          aria-label="Favoritos"
        >
          <Heart size={22} strokeWidth={2} />
        </motion.button>
        <motion.button
          onClick={onPerfil}
          whileTap={{ scale: 0.9 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '10px 0 10px 6px', display: 'flex' }}
          aria-label="Mi cuenta"
        >
          <User size={22} strokeWidth={2} />
        </motion.button>
      </div>
    </header>
  )
}
