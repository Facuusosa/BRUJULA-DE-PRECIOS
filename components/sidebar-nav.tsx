'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Home, LayoutGrid, Briefcase, X, ChevronDown, ChevronRight } from 'lucide-react'
import type { Vista } from '@/app/page'
import { sectores } from '@/lib/data'

interface SidebarNavProps {
  vistaActiva: Vista
  onChange: (vista: Vista) => void
  onClose: () => void
  sectorActivo?: string
  onSectorChange?: (sector: string) => void
  subcategoriaActiva?: string
  onSubcategoriaChange?: (sub: string) => void
}

const NAV_ITEMS: { id: Vista; label: string; Icon: typeof Home }[] = [
  { id: 'inicio',       label: 'Para Ti',  Icon: Home },
  { id: 'catalogo',     label: 'Catálogo', Icon: LayoutGrid },
  { id: 'herramientas', label: 'Mi Lista', Icon: Briefcase },
]

const NAV_IDS = NAV_ITEMS.map(i => i.id)

export function SidebarNav({
  vistaActiva,
  onChange,
  onClose,
  sectorActivo,
  onSectorChange,
  subcategoriaActiva,
  onSubcategoriaChange,
}: SidebarNavProps) {
  const activeId = NAV_IDS.includes(vistaActiva) ? vistaActiva : 'inicio'
  const [catalogoExpanded, setCatalogoExpanded] = useState(vistaActiva === 'catalogo')

  const sectoresDisponibles = sectores.filter(s =>
    s.subcategorias && s.subcategorias.length > 0
  )
  const sectorData = sectoresDisponibles.find(s => s.nombre === sectorActivo)
  const subcats = sectorData?.subcategorias ?? []

  const handleNavItem = (id: Vista) => {
    if (id === 'catalogo') {
      setCatalogoExpanded(prev => !prev)
      onChange(id)
    } else {
      onChange(id)
      onClose()
    }
  }

  const handleSector = (nombre: string) => {
    const esActivo = sectorActivo === nombre
    onSectorChange?.(esActivo ? 'Todos' : nombre)
    onSubcategoriaChange?.('')
    if (!esActivo) onChange('catalogo')
  }

  const handleSubcat = (sub: string) => {
    const esActiva = subcategoriaActiva === sub
    onSubcategoriaChange?.(esActiva ? '' : sub)
    onChange('catalogo')
    onClose()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header del drawer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 16px 16px 20px',
        borderBottom: '1px solid var(--c-border)',
        height: 'var(--header-height)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/icon.svg" alt="Brújula" width={22} height={22} />
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0a0a0a', letterSpacing: '-0.02em' }}>
            Brújula
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '8px', display: 'flex' }}
          aria-label="Cerrar menú"
        >
          <X size={20} strokeWidth={1.8} />
        </button>
      </div>

      {/* Nav items — scrolleable */}
      <nav style={{ padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflowY: 'auto' }}>

        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeId === id
          const isCatalogo = id === 'catalogo'

          return (
            <div key={id}>
              <button
                onClick={() => handleNavItem(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '13px 14px',
                  borderRadius: '8px',
                  background: isActive ? '#f0f0f0' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: isActive ? '#0a0a0a' : '#6b7280',
                  fontSize: '15px', fontWeight: isActive ? 700 : 500,
                  width: '100%', textAlign: 'left',
                  transition: 'background 0.1s',
                  minHeight: '48px',
                }}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span style={{ flex: 1 }}>{label}</span>
                {isCatalogo && (
                  catalogoExpanded
                    ? <ChevronDown size={16} color="#9ca3af" />
                    : <ChevronRight size={16} color="#9ca3af" />
                )}
              </button>

              {/* Submenu de sectores — solo cuando catálogo expandido */}
              {isCatalogo && catalogoExpanded && (
                <div style={{ paddingLeft: '8px', paddingBottom: '4px' }}>

                  {/* Todos */}
                  <button
                    onClick={() => { onSectorChange?.('Todos'); onSubcategoriaChange?.(''); onChange('catalogo'); onClose() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      width: '100%', textAlign: 'left',
                      padding: '10px 14px 10px 28px', fontSize: '14px',
                      background: !sectorActivo || sectorActivo === 'Todos' ? '#e5e7eb' : 'transparent',
                      color: !sectorActivo || sectorActivo === 'Todos' ? '#111827' : '#6b7280',
                      fontWeight: !sectorActivo || sectorActivo === 'Todos' ? 700 : 400,
                      border: 'none',
                      borderLeft: !sectorActivo || sectorActivo === 'Todos' ? '2px solid #374151' : '2px solid transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Todos los productos
                  </button>

                  {/* Sectores */}
                  {sectoresDisponibles.map(s => {
                    const isActiveSector = sectorActivo === s.nombre
                    return (
                      <div key={s.nombre}>
                        <button
                          onClick={() => handleSector(s.nombre)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', textAlign: 'left',
                            padding: '10px 14px 10px 28px', fontSize: '14px',
                            background: isActiveSector ? '#e5e7eb' : 'transparent',
                            color: isActiveSector ? '#111827' : '#6b7280',
                            fontWeight: isActiveSector ? 700 : 400,
                            border: 'none',
                            borderLeft: isActiveSector ? '2px solid #374151' : '2px solid transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            minHeight: '44px',
                          }}
                        >
                          <span>{s.nombre}</span>
                          {isActiveSector && subcats.length > 0 && (
                            <ChevronDown size={14} color="#6b7280" />
                          )}
                        </button>

                        {/* Subcategorías */}
                        {isActiveSector && subcats.length > 0 && (
                          <div style={{ paddingLeft: '8px' }}>
                            {subcats.map(sub => {
                              const isActiveSub = subcategoriaActiva === sub
                              return (
                                <button
                                  key={sub}
                                  onClick={() => handleSubcat(sub)}
                                  style={{
                                    display: 'block', width: '100%', textAlign: 'left',
                                    padding: '9px 14px 9px 36px', fontSize: '13px',
                                    background: isActiveSub ? '#e0e7ff' : 'transparent',
                                    color: isActiveSub ? '#3730a3' : '#9ca3af',
                                    fontWeight: isActiveSub ? 700 : 400,
                                    border: 'none',
                                    borderLeft: isActiveSub ? '2px solid #4f46e5' : '2px solid transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    minHeight: '40px',
                                  }}
                                >
                                  · {sub}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
