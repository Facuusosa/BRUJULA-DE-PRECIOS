'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { ItemLista, Lista, formatearPrecio } from '@/lib/data'
import { FrescuraPill } from '@/components/frescura-pill'

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

const LOGOS: Record<string, string> = {
  'Maxiconsumo':   '/mayoristas/maxiconsumo.webp',
  'Yaguar':        '/mayoristas/yaguar.png',
  'MaxiCarrefour': '/mayoristas/maxicarrefour.jpg',
}

function mejorPrecioDe(item: ItemLista) {
  const validos = item.producto.precios.filter(p => p.precio > 0)
  if (validos.length === 0) return null
  return validos.reduce((a, b) => (a.precio <= b.precio ? a : b))
}

function calcularTotalMix(items: ItemLista[]): number {
  return items.reduce((sum, item) => {
    const mejor = mejorPrecioDe(item)
    return mejor ? sum + mejor.precio * (item.cantidad ?? 1) : sum
  }, 0)
}

function calcularOpcionMayorista(items: ItemLista[], mayorista: string) {
  let total = 0
  let cubre = 0
  for (const item of items) {
    const cant = item.cantidad ?? 1
    const propio = item.producto.precios.find(p => p.mayorista === mayorista && p.precio > 0)
    if (propio) {
      total += propio.precio * cant
      cubre++
    } else {
      const mejor = mejorPrecioDe(item)
      if (mejor) total += mejor.precio * cant
    }
  }
  return { total, cubre, total_items: items.length }
}

interface GrupoMayorista {
  mayorista: string
  productos: { nombre: string; precio: number; cantidad: number }[]
  unidades: number
  total: number
}

function calcularMixDetallado(items: ItemLista[]): GrupoMayorista[] {
  const grupos: Record<string, GrupoMayorista> = {}
  for (const item of items) {
    const mejor = mejorPrecioDe(item)
    if (!mejor) continue
    const cant = item.cantidad ?? 1
    if (!grupos[mejor.mayorista]) {
      grupos[mejor.mayorista] = { mayorista: mejor.mayorista, productos: [], unidades: 0, total: 0 }
    }
    grupos[mejor.mayorista].productos.push({ nombre: item.producto.nombre, precio: mejor.precio, cantidad: cant })
    grupos[mejor.mayorista].unidades += cant
    grupos[mejor.mayorista].total += mejor.precio * cant
  }
  return Object.values(grupos).sort((a, b) => b.total - a.total)
}

function fechaCorta(iso: string): string {
  const d = new Date(iso)
  const hoy = new Date()
  if (d.toDateString() === hoy.toDateString()) return 'hoy'
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function ItemThumb({ item }: { item: ItemLista }) {
  const [imgSrc, setImgSrc] = useState(item.producto.imageUrl || '')
  const [fallbackIdx, setFallbackIdx] = useState(0)
  const handleError = () => {
    const fallbacks = item.producto.imagenFallbacks || []
    if (fallbackIdx < fallbacks.length) {
      setImgSrc(fallbacks[fallbackIdx])
      setFallbackIdx(prev => prev + 1)
    } else {
      setImgSrc('')
    }
  }
  return (
    <div style={{
      width: '46px', height: '46px', flexShrink: 0,
      background: 'var(--plate)', borderRadius: '6px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={item.producto.nombre}
          width={38}
          height={38}
          className="img-plate"
          style={{ width: '38px', height: '38px', objectFit: 'contain' }}
          unoptimized
          onError={handleError}
        />
      ) : (
        <span style={{ color: 'var(--line)', fontSize: '18px' }}>?</span>
      )}
    </div>
  )
}

function ChipMayorista({ mayorista, w = 64, h = 28 }: { mayorista: string; w?: number; h?: number }) {
  return (
    <div style={{
      width: `${w}px`, height: `${h}px`, borderRadius: '6px',
      border: '1px solid var(--line)', background: '#ffffff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {LOGOS[mayorista] ? (
        <Image
          src={LOGOS[mayorista]}
          alt={mayorista}
          width={w - 10}
          height={h - 10}
          style={{ maxWidth: `${w - 10}px`, maxHeight: `${h - 10}px`, objectFit: 'contain', width: 'auto', height: 'auto' }}
          unoptimized
        />
      ) : (
        <span style={{ fontSize: '9px', fontWeight: 600 }}>{mayorista}</span>
      )}
    </div>
  )
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
  const [modo, setModo] = useState<'productos' | 'plan'>('productos')
  const [creandoLista, setCreandoLista] = useState(false)
  const [nombreNueva, setNombreNueva] = useState('')
  const [renombrando, setRenombrando] = useState(false)
  const [nombreRename, setNombreRename] = useState('')
  const inputNuevaRef = useRef<HTMLInputElement>(null)
  const inputRenameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (creandoLista) inputNuevaRef.current?.focus()
  }, [creandoLista])

  useEffect(() => {
    if (renombrando) inputRenameRef.current?.focus()
  }, [renombrando])

  const listaActiva = listas.find(l => l.id === listaActivaId) ?? null
  const items = listaActiva?.items ?? []

  const totalMix = calcularTotalMix(items)
  const mixDetallado = calcularMixDetallado(items)
  const unidadesTotal = items.reduce((s, i) => s + (i.cantidad ?? 1), 0)

  const opciones = MAYORISTAS
    .map(m => ({ mayorista: m, ...calcularOpcionMayorista(items, m) }))
    .sort((a, b) => a.total - b.total)
  const mejorOpcionIndividual = opciones.length ? opciones[0].total : 0
  // Ahorro real del mix: contra la MEJOR opción de un solo mayorista
  const ahorroMix = Math.max(0, mejorOpcionIndividual - totalMix)
  const ahorroMixPct = mejorOpcionIndividual > 0 ? Math.round((ahorroMix / mejorOpcionIndividual) * 100) : 0

  const handleConfirmarNueva = () => {
    const nombre = nombreNueva.trim()
    if (nombre) onCrearLista(nombre)
    setCreandoLista(false)
    setNombreNueva('')
  }

  const handleConfirmarRename = () => {
    const nombre = nombreRename.trim()
    if (nombre && listaActivaId) onRenombrarLista(listaActivaId, nombre)
    setRenombrando(false)
    setNombreRename('')
  }

  const handleWhatsApp = () => {
    const lineas: string[] = [`*${listaActiva?.nombre ?? 'Mi lista'}* — Brújula de Precios`, '']
    for (const grupo of mixDetallado) {
      lineas.push(`*${grupo.mayorista}* — ${formatearPrecio(grupo.total)}`)
      for (const p of grupo.productos) {
        lineas.push(`  • ${p.nombre} ×${p.cantidad} — ${formatearPrecio(p.precio * p.cantidad)}`)
      }
      lineas.push('')
    }
    lineas.push(`TOTAL: ${formatearPrecio(totalMix)}`)
    if (ahorroMix > 0) lineas.push(`Ahorrás ${formatearPrecio(ahorroMix)} comprando en varios lugares`)
    window.open(`https://wa.me/?text=${encodeURIComponent(lineas.join('\n'))}`, '_blank')
  }

  const tabStyle = (activa: boolean): React.CSSProperties => ({
    border: `1px solid ${activa ? 'var(--pill)' : 'var(--line)'}`,
    borderRadius: '999px',
    padding: '9px 16px',
    fontSize: '13.5px', fontWeight: 500,
    whiteSpace: 'nowrap',
    background: activa ? 'var(--pill)' : '#ffffff',
    color: activa ? '#ffffff' : 'var(--ink)',
    cursor: 'pointer', flexShrink: 0,
    fontFamily: 'var(--font-sans)',
  })

  return (
    <div style={{ background: '#ffffff', minHeight: '100%' }}>
      <style>{`
        @keyframes lista-rise { to { opacity: 1; transform: translateY(0); } }
        .lista-anim { opacity: 0; transform: translateY(10px); animation: lista-rise 380ms var(--ease-out) forwards; }
        .lista-view { animation: lista-rise 280ms var(--ease-out); }
        @media (prefers-reduced-motion: reduce) {
          .lista-anim, .lista-view { transform: none; animation-duration: 150ms; }
        }
        .lista-wrap { max-width: 760px; margin: 0 auto; }
        @media (min-width: 1000px) {
          .lista-wrap { padding: 0 44px; }
          .lista-th-name { font-size: 23px !important; }
          .lista-th-total { font-size: 25.7px !important; }
        }
      `}</style>

      <div className="lista-wrap">

        {/* Selector de listas */}
        <div className="lista-anim scrollbar-hide" style={{ display: 'flex', gap: '9px', padding: '10px 20px 0', overflowX: 'auto' }}>
          {listas.map(lista => (
            <button key={lista.id} style={tabStyle(lista.id === listaActivaId)} onClick={() => onSeleccionarLista(lista.id)}>
              {lista.nombre}
            </button>
          ))}
          {creandoLista ? (
            <span style={{ ...tabStyle(false), display: 'flex', alignItems: 'center', gap: '6px', cursor: 'default' }}>
              <input
                ref={inputNuevaRef}
                value={nombreNueva}
                onChange={e => setNombreNueva(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirmarNueva()
                  if (e.key === 'Escape') { setCreandoLista(false); setNombreNueva('') }
                }}
                placeholder="Nombre de la lista"
                style={{ border: 'none', outline: 'none', fontSize: '13.5px', width: '130px', fontFamily: 'var(--font-sans)', background: 'transparent', color: 'var(--ink)' }}
              />
              <Check size={14} style={{ cursor: 'pointer', color: 'var(--green)' }} onClick={handleConfirmarNueva} />
              <X size={14} style={{ cursor: 'pointer', color: 'var(--gray)' }} onClick={() => { setCreandoLista(false); setNombreNueva('') }} />
            </span>
          ) : (
            <button
              style={{ ...tabStyle(false), borderStyle: 'dashed', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setCreandoLista(true)}
            >
              <Plus size={13} strokeWidth={2.5} />
              Nueva
            </button>
          )}
        </div>

        {listaActiva && items.length > 0 ? (
          <>
            {/* Header sticky del ticket — el total nunca desaparece */}
            <div className="lista-anim" style={{
              animationDelay: '100ms',
              position: 'sticky', top: 0, zIndex: 10,
              background: 'rgba(255,255,255,0.94)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              padding: '16px 20px 12px',
              borderBottom: '1px solid var(--line)',
              marginTop: '12px',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  {renombrando ? (
                    <input
                      ref={inputRenameRef}
                      value={nombreRename}
                      onChange={e => setNombreRename(e.target.value)}
                      onBlur={handleConfirmarRename}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleConfirmarRename()
                        if (e.key === 'Escape') { setRenombrando(false); setNombreRename('') }
                      }}
                      style={{
                        fontSize: '19px', fontWeight: 600, letterSpacing: '-0.3px',
                        border: 'none', borderBottom: '1.5px solid var(--gold)', outline: 'none',
                        fontFamily: 'var(--font-sans)', color: 'var(--ink)', background: 'transparent',
                        width: '100%', minWidth: 0,
                      }}
                    />
                  ) : (
                    <>
                      <h1 className="lista-th-name" style={{
                        fontSize: '19px', fontWeight: 600, letterSpacing: '-0.3px', margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)',
                      }}>
                        {listaActiva.nombre}
                      </h1>
                      <button
                        onClick={() => { setNombreRename(listaActiva.nombre); setRenombrando(true) }}
                        aria-label="Renombrar lista"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--gray)', padding: '2px', flexShrink: 0 }}
                      >
                        <Pencil size={15} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => onEliminarLista(listaActiva.id)}
                        aria-label="Eliminar lista"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--gray)', padding: '2px', flexShrink: 0 }}
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </>
                  )}
                </div>
                <div className="tnum" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>
                  {items.length} producto{items.length !== 1 ? 's' : ''} · {unidadesTotal} unidad{unidadesTotal !== 1 ? 'es' : ''} · {fechaCorta(listaActiva.creadaEn)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="lista-th-total tnum" style={{ fontSize: '21.4px', fontWeight: 700, color: 'var(--ink)' }}>
                  {formatearPrecio(totalMix)}
                </div>
                {ahorroMix > 0 && (
                  <span className="tnum" style={{
                    display: 'inline-flex',
                    background: 'rgba(21,128,61,0.1)', color: 'var(--green)',
                    fontSize: '11px', fontWeight: 600,
                    borderRadius: '999px', padding: '3px 10px',
                    marginTop: '3px',
                  }}>
                    Ahorrás {formatearPrecio(ahorroMix)}
                  </span>
                )}
              </div>
            </div>

            {/* Toggle de modo */}
            <div className="lista-anim" style={{
              animationDelay: '130ms',
              display: 'flex', margin: '14px 20px 0',
              background: 'var(--plate)', borderRadius: '999px', padding: '4px',
            }}>
              <button
                onClick={() => setModo('productos')}
                style={{
                  flex: 1, border: 'none',
                  background: modo === 'productos' ? 'var(--pill)' : 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px', fontWeight: modo === 'productos' ? 600 : 500,
                  color: modo === 'productos' ? '#ffffff' : 'var(--gray)',
                  padding: '9px 0', borderRadius: '999px', cursor: 'pointer',
                  transition: 'background 180ms var(--ease-out), color 180ms var(--ease-out)',
                }}
              >
                Productos
              </button>
              <button
                onClick={() => setModo('plan')}
                style={{
                  flex: 1, border: 'none',
                  background: modo === 'plan' ? 'var(--pill)' : 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px', fontWeight: modo === 'plan' ? 600 : 500,
                  color: modo === 'plan' ? '#ffffff' : 'var(--gray)',
                  padding: '9px 0', borderRadius: '999px', cursor: 'pointer',
                  transition: 'background 180ms var(--ease-out), color 180ms var(--ease-out)',
                }}
              >
                Dónde comprar
              </button>
            </div>

            {modo === 'productos' ? (
              <div className="lista-view" key="productos">
                {/* Ticket: items con su mayorista en cada fila */}
                <div style={{ padding: '4px 20px 0' }}>
                  {items.map((item, idx) => {
                    const mejor = mejorPrecioDe(item)
                    const cant = item.cantidad ?? 1
                    if (!mejor) return null
                    return (
                      <div key={item.producto.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 0',
                        borderBottom: idx === items.length - 1 ? 'none' : '1px solid var(--line)',
                      }}>
                        <ItemThumb item={item} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ink)' }}>
                            {item.producto.nombre}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--gray)', fontWeight: 300, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                              <button
                                onClick={() => cant > 1 ? onCambiarCantidad?.(idx, cant - 1) : onEliminarItem(idx)}
                                aria-label={cant > 1 ? 'Restar unidad' : 'Quitar producto'}
                                style={{
                                  width: '21px', height: '21px', borderRadius: '99px',
                                  border: '1.2px solid var(--line)', background: '#ffffff',
                                  fontSize: '12px', lineHeight: 1, color: 'var(--ink)',
                                  fontFamily: 'var(--font-sans)', cursor: 'pointer',
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                −
                              </button>
                              <b className="tnum" style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '12.5px' }}>{cant}</b>
                              <button
                                onClick={() => onCambiarCantidad?.(idx, cant + 1)}
                                aria-label="Sumar unidad"
                                style={{
                                  width: '21px', height: '21px', borderRadius: '99px',
                                  border: '1.2px solid var(--line)', background: '#ffffff',
                                  fontSize: '12px', lineHeight: 1, color: 'var(--ink)',
                                  fontFamily: 'var(--font-sans)', cursor: 'pointer',
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                +
                              </button>
                            </span>
                            <span className="tnum">× {formatearPrecio(mejor.precio)}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="tnum" style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--ink)' }}>
                            {formatearPrecio(mejor.precio * cant)}
                          </div>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center',
                            fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.06em',
                            color: '#ffffff', background: 'var(--pill)',
                            borderRadius: '999px', padding: '2.5px 9px',
                            marginTop: '4px', textTransform: 'uppercase',
                          }}>
                            {mejor.mayorista}
                          </span>
                          <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'flex-end' }}>
                            <FrescuraPill precio={mejor} compact />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pie del ticket — divisor punteado como un recibo */}
                <div style={{ padding: '0 20px' }}>
                  <div style={{ borderTop: '2px dashed var(--line)', margin: '16px 0 0' }} />

                  {mixDetallado.map(grupo => (
                    <div key={grupo.mayorista} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <ChipMayorista mayorista={grupo.mayorista} w={58} h={26} />
                        <span className="tnum" style={{ fontSize: '11.5px', color: 'var(--gray)', fontWeight: 300 }}>
                          {grupo.productos.length} producto{grupo.productos.length !== 1 ? 's' : ''} · {grupo.unidades} unidad{grupo.unidades !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      <span className="tnum" style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--ink)' }}>
                        {formatearPrecio(grupo.total)}
                      </span>
                    </div>
                  ))}

                  <div style={{ borderTop: '2px dashed var(--line)', marginTop: '16px' }} />

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '16px 0 0' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--ink)' }}>TOTAL</span>
                    <span className="tnum" style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>{formatearPrecio(totalMix)}</span>
                  </div>
                  {ahorroMix > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 0', fontSize: '13px' }}>
                      <span style={{ color: 'var(--gray)', fontWeight: 300 }}>vs. comprar todo en un solo mayorista</span>
                      <span className="tnum" style={{ color: 'var(--green)', fontWeight: 600 }}>−{formatearPrecio(ahorroMix)} ({ahorroMixPct}%)</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="lista-view" key="plan">
                {/* Ranking un-solo-lugar */}
                <div style={{
                  padding: '22px 20px 0',
                  fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.14em',
                  color: 'var(--gray)', textTransform: 'uppercase',
                }}>
                  Si comprás todo en el mismo lugar
                </div>
                <div style={{ padding: '6px 20px 0' }}>
                  {opciones.map((op, idx) => (
                    <div key={op.mayorista} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                      padding: '13px 0',
                      borderBottom: idx === opciones.length - 1 ? 'none' : '1px solid var(--line)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ChipMayorista mayorista={op.mayorista} w={64} h={28} />
                        {idx === 0 ? (
                          <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--green)', letterSpacing: '0.05em' }}>MÁS BARATO</span>
                        ) : (
                          <span className="tnum" style={{ fontSize: '11.5px', color: 'var(--gray)', fontWeight: 300 }}>
                            +{formatearPrecio(op.total - opciones[0].total)} más caro
                          </span>
                        )}
                      </div>
                      <span className="tnum" style={{ fontSize: '16.5px', fontWeight: idx === 0 ? 600 : 500, color: 'var(--ink)' }}>
                        {formatearPrecio(op.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Card del mix — borde dorado */}
                {mixDetallado.length > 1 && ahorroMix > 0 && (
                  <div style={{
                    margin: '22px 20px 0',
                    border: '1.5px solid var(--gold)',
                    borderRadius: '12px',
                    padding: '18px 18px 8px',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute', top: '-11px', left: '16px',
                      background: 'var(--gold)', color: '#ffffff',
                      fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.1em',
                      borderRadius: '999px', padding: '4px 12px',
                    }}>
                      COMPRÁ EN VARIOS PARA AHORRAR MÁS
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)' }}>
                        {mixDetallado.length} mayoristas
                      </span>
                      <span className="tnum" style={{ fontSize: '23px', fontWeight: 700, color: 'var(--ink)' }}>
                        {formatearPrecio(totalMix)}
                      </span>
                    </div>
                    <div className="tnum" style={{ fontSize: '12.5px', color: 'var(--green)', fontWeight: 600, marginTop: '2px' }}>
                      Ahorrás {formatearPrecio(ahorroMix)} comprando en varios lugares
                    </div>

                    {mixDetallado.map(grupo => (
                      <div key={grupo.mayorista} style={{ marginTop: '16px' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 0',
                          borderBottom: '1px solid var(--line)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <ChipMayorista mayorista={grupo.mayorista} w={60} h={26} />
                            <span className="tnum" style={{ fontSize: '11.5px', color: 'var(--gray)', fontWeight: 300 }}>
                              {grupo.productos.length} producto{grupo.productos.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <span className="tnum" style={{ fontSize: '15.5px', fontWeight: 600, color: 'var(--ink)' }}>
                            {formatearPrecio(grupo.total)}
                          </span>
                        </div>
                        {grupo.productos.map(p => (
                          <div key={p.nombre} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '9px 0 9px 4px',
                            borderBottom: '1px solid var(--plate)',
                          }}>
                            <span className="line-clamp-1" style={{ fontSize: '13px', fontWeight: 300, color: 'var(--ink)', paddingRight: '12px' }}>
                              {p.nombre} <span className="tnum" style={{ fontSize: '11.5px', color: 'var(--gray)' }}>×{p.cantidad}</span>
                            </span>
                            <span className="tnum" style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ink)', flexShrink: 0 }}>
                              {formatearPrecio(p.precio * p.cantidad)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div style={{ padding: '22px 20px 40px', display: 'flex', gap: '10px' }}>
              <button
                onClick={handleWhatsApp}
                aria-label="Compartir"
                style={{
                  background: '#ffffff', color: 'var(--ink)',
                  border: '1.5px solid var(--ink)', borderRadius: '999px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14.5px', fontWeight: 500,
                  padding: '14px 22px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></svg>
                Compartir
              </button>
              <button
                onClick={() => modo === 'productos' ? setModo('plan') : handleWhatsApp()}
                style={{
                  flex: 1,
                  background: 'var(--pill)', color: '#ffffff',
                  border: 'none', borderRadius: '999px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14.5px', fontWeight: 500,
                  padding: '14px 0', cursor: 'pointer',
                }}
              >
                {modo === 'productos' ? 'Ver dónde comprar' : 'Enviar por WhatsApp'}
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              {listas.length === 0 ? 'Todavía no tenés listas' : 'Esta lista está vacía'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--gray)', fontWeight: 300, marginBottom: '24px', lineHeight: 1.5 }}>
              Agregá productos desde el catálogo con el botón +<br />y armá tu pedido al mejor precio
            </div>
            <button
              onClick={onIrAComparar}
              style={{
                background: 'var(--pill)', color: '#ffffff',
                border: 'none', borderRadius: '999px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px', fontWeight: 500,
                padding: '14px 28px', cursor: 'pointer',
              }}
            >
              Explorar el catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
