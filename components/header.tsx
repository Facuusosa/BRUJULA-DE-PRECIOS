'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Barcode, Heart, User, Menu, X } from 'lucide-react'
import Image from 'next/image'
import { iconTap } from '@/lib/motion-variants'

interface AppHeaderProps {
  onBuscar?: (texto: string) => void
  onPerfil?: () => void
  onFavoritos?: () => void
  onMenuClick?: () => void
  onLogoClick?: () => void
}

export function AppHeader({ onBuscar, onPerfil, onFavoritos, onMenuClick, onLogoClick }: AppHeaderProps) {
  const [searchValue, setSearchValue] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      onBuscar?.(searchValue.trim())
      setSearchValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchValue('')
    }
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
    }}>
      {/* Hamburger */}
      <motion.button
        onClick={onMenuClick}
        {...iconTap}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '11px', display: 'flex', flexShrink: 0, margin: '-11px -4px' }}
        whileHover={{ color: '#f7f7f7' }}
        aria-label="Menú"
      >
        <Menu size={22} strokeWidth={1.8} />
      </motion.button>

      {/* Logo + nombre */}
      <motion.div
        onClick={onLogoClick}
        whileTap={{ scale: 0.97 }}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: onLogoClick ? 'pointer' : 'default' }}
      >
        <Image src="/icon.svg" alt="Brújula" width={24} height={24} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 800,
          color: '#f7f7f7',
          letterSpacing: '-0.03em',
          whiteSpace: 'nowrap',
        }}>
          Brújula
        </span>
      </motion.div>

      {/* Search bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          background: '#1a1a1a',
          borderRadius: '50px',
          padding: '0 15px',
          gap: '5px',
          height: '44px',
          border: searchFocused ? '1px solid #d4a574' : '1px solid #2a2a2a',
          transition: 'border-color 0.15s ease',
        }}
      >
        <Search size={15} color="#6b7280" strokeWidth={2} style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Buscar producto o marca"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 'var(--fs-body)',
            color: '#f7f7f7',
            minWidth: 0,
          }}
        />
        {searchValue && (
          <motion.button
            type="button"
            onClick={() => setSearchValue('')}
            {...iconTap}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: 0 }}
          >
            <X size={14} />
          </motion.button>
        )}
        <motion.button
          type="button"
          onClick={() => {}}
          {...iconTap}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', padding: '14px', flexShrink: 0, margin: '-14px -10px -14px 0' }}
          aria-label="Escanear código"
        >
          <Barcode size={16} strokeWidth={1.8} />
        </motion.button>
      </form>

      {/* Acciones derecha */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <motion.button
          onClick={onFavoritos}
          {...iconTap}
          whileHover={{ color: '#d4a574' }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '12px', display: 'flex' }}
          aria-label="Favoritos"
        >
          <Heart size={20} strokeWidth={1.8} />
        </motion.button>
        <motion.button
          onClick={onPerfil}
          {...iconTap}
          whileHover={{ color: '#d4a574' }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '12px', display: 'flex' }}
          aria-label="Mi cuenta"
        >
          <User size={20} strokeWidth={1.8} />
        </motion.button>
      </div>
    </header>
  )
}
