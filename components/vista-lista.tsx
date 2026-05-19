'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, ShoppingCart, TrendingDown, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { ItemLista, Lista, formatearPrecio } from '@/lib/data'
import { iconTap } from '@/lib/motion-variants'

interface VistaListaProps {
  listas: Lista[]
  listaActivaId: string | null
  onSeleccionarLista: (id: string) => void
  onCrearLista: (nombre: string) => void
  onRenombrarLista: (id: string, nombre: string) => void
  onEliminarLista: (id: string) => void
  onEliminarItem: (index: number) => void
  onCambiarCantidad?: (index: number, cantidad: number) => void
  onIrAComparar: () => void
}

const MAYORISTAS = ['Yaguar', 'MaxiCarrefour', 'Maxiconsumo'] as const

function calcularTotalMix(items: ItemLista[]): number {
  return items.reduce((sum, item) => {
    const validos = item.producto.precios.filter(p => p.precio > 0)
    if (validos.length === 0) return sum
    return sum + Math.min(...validos.map(p => p.precio)) * (item.cantidad ?? 1)
  }, 0)
}

function calcularOpcionMayorista(items: ItemLista[], mayorista: string) {
  let total = 0
  let productosConPrecioPropio = 0
  for (const item of items) {
    const cant = item.cantidad ?? 1
    const precioPropio = item.producto.precios.find(p => p.mayorista === mayorista && p.precio > 0)
    if (precioPropio) {
      total += precioPropio.precio * cant
      productosConPrecioPropio++
    } else {
      const validos = item.producto.precios.filter(p => p.precio > 0)
      if (validos.length > 0) total += Math.min(...validos.map(p => p.precio)) * cant
    }
  }
  return { total, cubre: productosConPrecioPropio, total_items: items.length }
}

interface GrupoMayorista {
  mayorista: string
  productos: { nombre: string; precio: number }[]
  total: number
}

function calcularMixDetallado(items: ItemLista[]): GrupoMayorista[] {
  const grupos: Record<string, GrupoMayorista> = {}
  for (const item of items) {
    const validos = item.producto.precios.filter(p => p.precio > 0)
    if (validos.length === 0) continue
    const mejor = validos.reduce((a, b) => a.precio <= b.precio ? a : b)
    if (!grupos[mejor.mayorista]) {
      grupos[mejor.mayorista] = { mayorista: mejor.mayorista, productos: [], total: 0 }
    }
    grupos[mejor.mayorista].productos.push({ nombre: item.producto.nombre, precio: mejor.precio })
    grupos[mejor.mayorista].total += mejor.precio
  }
  return Object.values(grupos).sort((a, b) => b.total - a.total)
}

export function VistaLista({
  listas,
  listaActivaId,
  onSeleccionarLista,
  onCrearLista,
  onRenombrarLista,
  onEliminarLista,
  onEliminarItem,
  onCambiarCantidad,
  onIrAComparar,
}: VistaListaProps) {
  const [creandoLista, setCreandoLista] = useState(false)
  const [nombreNueva, setNombreNueva] = useState('')
  const [renombrandoId, setRenombrandoId] = useState<string | null>(null)
  const [nombreRename, setNombreRename] = useState('')
  const inputNuevaRef = useRef<HTMLInputElement>(null)
  const inputRenameRef = useRef<HTMLInputElement>(null)
  const [nombreNegocio, setNombreNegocio] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('brujula_perfil')
    if (saved) {
      try { setNombreNegocio(JSON.parse(saved).nombre ?? '') } catch {}
    }
  }, [])

  useEffect(() => {
    if (creandoLista) inputNuevaRef.current?.focus()
  }, [creandoLista])

  useEffect(() => {
    if (renombrandoId) inputRenameRef.current?.focus()
  }, [renombrandoId])

  const handleConfirmarNueva = () => {
    const nombre = nombreNueva.trim()
    if (nombre) onCrearLista(nombre)
    setCreandoLista(false)
    setNombreNueva('')
  }

  const handleCancelarNueva = () => {
    setCreandoLista(false)
    setNombreNueva('')
  }

  const handleConfirmarRename = () => {
    const nombre = nombreRename.trim()
    if (nombre && renombrandoId) onRenombrarLista(renombrandoId, nombre)
    setRenombrandoId(null)
    setNombreRename('')
  }

  const listaActiva = listas.find(l => l.id === listaActivaId) ?? null
  const items = listaActiva?.items ?? []

  const totalMix = calcularTotalMix(items)
  const mixDetallado = calcularMixDetallado(items)
  const gananciaTotal = items.reduce((sum, item) => sum + item.ganancia, 0)
  const margenPromedio = items.length > 0 ? Math.round(items.reduce((s, i) => s + i.margen, 0) / items.length) : 0

  const opciones = MAYORISTAS.map(m => ({ mayorista: m, ...calcularOpcionMayorista(items, m) }))
  const opcionMasCara = Math.max(...opciones.map(o => o.total), 0)
  const ahorroMix = opcionMasCara - totalMix
  const ahorroMixPct = opcionMasCara > 0 ? Math.round((ahorroMix / opcionMasCara) * 100) : 0
  const mejorOpcionIndividual = Math.min(...opciones.map(o => o.total))
  const mixEsMejor = items.length > 0 && totalMix < mejorOpcionIndividual - 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#0a0a0a' }}>

      {/* SELECTOR DE LISTAS */}
      <div style={{ background: '#0a0a0a', padding: '20px 20px 18px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 14px' }}>
          Mis Listas
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {listas.map(lista => {
            const isActive = lista.id === listaActivaId
            const isRenaming = renombrandoId === lista.id
            return (
              <div
                key={lista.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: isActive ? '#ffffff' : 'rgba(255,255,255,0.1)',
                  borderRadius: '20px', padding: '7px 8px 7px 13px',
                }}
              >
                {isRenaming ? (
                  <input
                    ref={inputRenameRef}
                    value={nombreRename}
                    onChange={e => setNombreRename(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleConfirmarRename()
                      if (e.key === 'Escape') { setRenombrandoId(null); setNombreRename('') }
                    }}
                    onBlur={handleConfirmarRename}
                    style={{
                      background: 'none', border: 'none', outline: 'none',
                      fontSize: '13px', fontWeight: 700, color: '#0a0a0a',
                      width: `${Math.max(60, nombreRename.length * 8)}px`,
                    }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      if (!isActive) {
                        onSeleccionarLista(lista.id)
                      } else {
                        setRenombrandoId(lista.id)
                        setNombreRename(lista.nombre)
                      }
                    }}
                    style={{
                      fontSize: '13px', fontWeight: 700,
                      color: isActive ? '#0a0a0a' : 'rgba(255,255,255,0.85)',
                      cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    {lista.nombre}
                    {lista.items.length > 0 && (
                      <span style={{ marginLeft: '4px', fontSize: '11px', fontWeight: 400, opacity: 0.55 }}>
                        ({lista.items.length})
                      </span>
                    )}
                  </span>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onEliminarLista(lista.id) }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '2px', display: 'flex', marginLeft: '2px',
                    color: isActive ? '#9ca3af' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )
          })}

          {creandoLista ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(255,255,255,0.12)', borderRadius: '20px',
              padding: '7px 10px 7px 13px', border: '1.5px solid rgba(255,255,255,0.25)',
            }}>
              <input
                ref={inputNuevaRef}
                value={nombreNueva}
                onChange={e => setNombreNueva(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirmarNueva()
                  if (e.key === 'Escape') handleCancelarNueva()
                }}
                onBlur={() => { if (nombreNueva.trim()) handleConfirmarNueva(); else handleCancelarNueva() }}
                placeholder="Nombre..."
                style={{
                  background: 'none', border: 'none', outline: 'none',
                  fontSize: '13px', color: '#ffffff', width: '90px',
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setCreandoLista(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'none', border: '1.5px dashed rgba(255,255,255,0.25)',
                borderRadius: '20px', padding: '6px 13px', cursor: 'pointer',
                color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600,
              }}
            >
              <Plus size={12} />
              Nueva
            </button>
          )}
        </div>
      </div>

      {/* ANÁLISIS */}
      {items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', textAlign: 'center', padding: '40px 20px' }}>
          <ShoppingCart size={48} color="#2a2a2a" strokeWidth={1.5} />
          <div>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#f7f7f7', margin: '0 0 6px' }}>
              {listas.length === 0 ? 'Todavía no armaste ninguna lista' : `"${listaActiva?.nombre ?? 'Esta lista'}" está vacía`}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Usá el botón + en el catálogo para agregar productos
            </p>
          </div>
          <motion.button
            onClick={onIrAComparar}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ background: '#d4a574', color: '#0a0a0a', border: 'none', borderRadius: '12px', padding: '14px 28px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
          >
            Ir al catálogo
          </motion.button>
        </div>
      ) : (
        <>
          {/* HERO */}
          <div style={{ background: '#1a1a1a', padding: '22px 20px 26px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 6px' }}>
              {listaActiva?.nombre} · {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '38px', fontWeight: 900, color: '#ffffff', lineHeight: 1, fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif' }}>
                {formatearPrecio(totalMix)}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              {mixEsMejor ? 'Comprando donde más conviene por producto' : 'Comprando todo en el lugar más barato'}
            </p>
            {ahorroMix > 50 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', background: 'rgba(212,165,116,0.15)', borderRadius: '8px', padding: '6px 10px', width: 'fit-content' }}>
                <TrendingDown size={14} color="#d4a574" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#d4a574' }}>
                  Ahorrás {formatearPrecio(ahorroMix)} comprando inteligente
                </span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* PRODUCTOS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Productos ({items.length})
                </span>
                <motion.button
                  onClick={onIrAComparar}
                  {...iconTap}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: '1.5px solid #2a2a2a', borderRadius: '20px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#f7f7f7' }}
                >
                  <Plus size={12} />
                  Agregar
                </motion.button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map((item, index) => {
                  const validos = item.producto.precios.filter(p => p.precio > 0).sort((a, b) => a.precio - b.precio)
                  const precioMejor = validos[0]?.precio ?? 0
                  const cantidad = item.cantidad ?? 1
                  return (
                    <div key={index} style={{ background: '#141414', borderRadius: '12px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #2a2a2a' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#1a1a1a', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.producto.imageUrl ? (
                          <Image src={item.producto.imageUrl} alt={item.producto.nombre} width={44} height={44} style={{ objectFit: 'contain' }} unoptimized />
                        ) : (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#2a2a2a' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#f7f7f7', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.producto.nombre}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                          <strong style={{ color: '#d4a574' }}>{formatearPrecio(precioMejor)}</strong>
                          {cantidad > 1 && <strong style={{ color: '#d4a574' }}> × {cantidad} = {formatearPrecio(precioMejor * cantidad)}</strong>}
                          {validos[0] && <span style={{ color: '#6b7280' }}> · {validos[0].mayorista}</span>}
                        </p>
                      </div>
                      {/* Controles de cantidad */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <motion.button
                          onClick={() => {
                            if (cantidad <= 1) onEliminarItem(index)
                            else onCambiarCantidad?.(index, cantidad - 1)
                          }}
                          {...iconTap}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #2a2a2a', background: '#1a1a1a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#f7f7f7', lineHeight: 1 }}
                        >
                          −
                        </motion.button>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#f7f7f7', minWidth: '20px', textAlign: 'center' }}>
                          {cantidad}
                        </span>
                        <motion.button
                          onClick={() => onCambiarCantidad?.(index, cantidad + 1)}
                          {...iconTap}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #d4a574', background: '#d4a574', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#0a0a0a', lineHeight: 1 }}
                        >
                          +
                        </motion.button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* COMPARATIVA POR MAYORISTA */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '12px' }}>
                Si comprás todo en el mismo lugar
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {opciones
                  .sort((a, b) => a.total - b.total)
                  .map(({ mayorista, total, cubre, total_items }) => {
                    const esMejor = total === Math.min(...opciones.map(o => o.total))
                    const diferencia = total - Math.min(...opciones.map(o => o.total))
                    return (
                      <div key={mayorista} style={{
                        background: '#141414', borderRadius: '12px',
                        borderLeft: `4px solid ${esMejor ? '#d4a574' : '#2a2a2a'}`,
                        padding: '14px 16px', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: esMejor ? '#d4a574' : '#6b7280', textTransform: 'uppercase' }}>
                            {mayorista}
                            {esMejor && <span style={{ marginLeft: '6px', fontSize: '10px', background: '#d4a574', color: '#0a0a0a', padding: '2px 6px', borderRadius: '4px' }}>Más barato</span>}
                          </span>
                          {cubre < total_items && (
                            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>
                              Cubre {cubre} de {total_items} productos · resto al mejor precio disponible
                            </p>
                          )}
                          {!esMejor && diferencia > 0 && (
                            <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>
                              +{formatearPrecio(diferencia)} más caro
                            </p>
                          )}
                        </div>
                        <span style={{ fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif', fontSize: '22px', fontWeight: 800, color: '#f7f7f7', flexShrink: 0 }}>
                          {formatearPrecio(total)}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* PLAN DE COMPRA MIXTA */}
            {mixEsMejor && mixDetallado.length > 1 && (
              <div style={{ background: '#141414', borderRadius: '16px', border: '1.5px solid #d4a574', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#d4a574', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Comprá en varios para ahorrar más
                    </span>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '3px 0 0' }}>
                      Ahorrás {formatearPrecio(ahorroMix)} comprando en varios lugares
                    </p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif', fontSize: '22px', fontWeight: 800, color: '#f7f7f7' }}>{formatearPrecio(totalMix)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {mixDetallado.map(grupo => (
                    <div key={grupo.mayorista}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid #2a2a2a' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#f7f7f7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {grupo.mayorista}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f7f7f7' }}>{formatearPrecio(grupo.total)}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {grupo.productos.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {p.nombre}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#d4a574', flexShrink: 0 }}>{formatearPrecio(p.precio)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gananciaTotal > 0 && (
              <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>
                Con margen {margenPromedio}%: <strong style={{ color: '#d4a574' }}>{formatearPrecio(gananciaTotal)}</strong> de ganancia estimada
              </p>
            )}

          </div>
        </>
      )}
    </div>
  )
}
