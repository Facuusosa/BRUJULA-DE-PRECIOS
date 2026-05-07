'use client'

import { useState } from 'react'
import { Search, Barcode, Heart, User, Menu, X } from 'lucide-react'
import Image from 'next/image'

interface AppHeaderProps {
  onBuscar?: (texto: string) => void
  onPerfil?: () => void
  onFavoritos?: () => void
  onMenuClick?: () => void
  onLogoClick?: () => void
}

export function AppHeader({ onBuscar, onPerfil, onFavoritos, onMenuClick, onLogoClick }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      onBuscar?.(searchValue.trim())
      setSearchOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: '#ffffff',
      boxShadow: '1px 2px 1px #e5e5e5',
      height: 'var(--header-height)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
    }}>
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0a0a0a', padding: '4px', display: 'flex', flexShrink: 0 }}
        aria-label="Menú"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      {/* Logo + nombre */}
      <div
        onClick={onLogoClick}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: onLogoClick ? 'pointer' : 'default' }}
      >
        <Image src="/icon.svg" alt="Brújula" width={24} height={24} />
        <span style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#0a0a0a',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}>
          Brújula
        </span>
      </div>

      {/* Search bar — desktop: siempre visible y expandido | mobile: toggle */}
      <form
        onSubmit={handleSubmit}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          background: '#f1f3f4',
          borderRadius: '50px',
          padding: '0 15px',
          gap: '5px',
          height: '52px',
        }}
      >
        <Search size={16} color="#9ca3af" strokeWidth={2} style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar producto o marca"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            color: '#0a0a0a',
            minWidth: 0,
          }}
        />
        {searchValue && (
          <button
            type="button"
            onClick={() => setSearchValue('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={() => {}}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0, flexShrink: 0 }}
          aria-label="Escanear código"
        >
          <Barcode size={16} strokeWidth={1.8} />
        </button>
      </form>

      {/* Acciones derecha */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <button
          onClick={onFavoritos}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0a0a0a', padding: '8px', display: 'flex' }}
          aria-label="Favoritos"
        >
          <Heart size={20} strokeWidth={1.8} />
        </button>
        <button
          onClick={onPerfil}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0a0a0a', padding: '8px', display: 'flex' }}
          aria-label="Mi cuenta"
        >
          <User size={20} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  )
}
