'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { ItemLista, Lista, FUENTES, fuentePorNombre } from '@/lib/data'
import { HScroll } from '@/components/h-scroll'
import { SITIO_URL } from '@/lib/sitio'
import { ItemPlan, Plan, planCon, resumir, faltanEn, totalEn, lugarParaFaltantes } from '@/lib/plan-compra'
import type { CalleListaControl } from '@/components/calle-lista'

// La calle 3D de Mi Lista (el carrito sale de tu negocio y pasa por cada lugar). Pesa:
// se baja aparte y nunca en el servidor. Sin 3D, los 3 pasos de abajo alcanzan para usarla.
const CalleLista = dynamic(() => import('@/components/calle-lista'), {
  ssr: false,
  loading: () => <div className="ml-escena ml-cargando">Armando tu recorrido…</div>,
})

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

type Modo = 'barato' | 'mayorista' | 'cadena' | 'yo'

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR')
const nombres = (fs: string[]) => fs.join(' + ')
const CLAVE_LUGARES = 'brujula_mis_lugares'
const FUENTES_PLAN = FUENTES.map(f => ({ nombre: f.nombre, tipo: f.tipo }))

function aItemPlan(item: ItemLista): ItemPlan {
  const p: Record<string, number> = {}
  for (const pr of item.producto.precios) if (pr.precio > 0) p[pr.mayorista] = pr.precio
  return { id: item.producto.id, nombre: item.producto.nombre, q: item.cantidad ?? 1, p }
}

// orden de las paradas = orden de los locales en la calle (súper adelante, galpones atrás)
export const ORDEN_CALLE = ['Coto', 'Yaguar', 'Carrefour', 'MaxiCarrefour', 'Dia', 'Maxiconsumo', 'Masonline', 'Nini', 'Jumbo']
const paradasDe = (pl: Plan) => pl.lugares
  .slice()
  .sort((a, b) => ORDEN_CALLE.indexOf(a) - ORDEN_CALLE.indexOf(b))
  .map(f => ({ fuente: f, asig: pl.asig.filter(a => a.fuente === f) }))

function Logo({ fuente, alto = 20 }: { fuente: string; alto?: number }) {
  const logo = fuentePorNombre(fuente)?.logo
  if (!logo) return <span style={{ fontSize: '13px', fontWeight: 600 }}>{fuente}</span>
  return <Image src={logo} alt={fuente} width={86} height={alto} style={{ height: alto, width: 'auto', maxWidth: 86, objectFit: 'contain' }} unoptimized />
}

function Foto({ item, lado }: { item: ItemLista; lado: number }) {
  const fuentes = [item.producto.imageUrl, ...(item.producto.imagenFallbacks ?? [])].filter((s): s is string => !!s)
  const [i, setI] = useState(0)
  if (i >= fuentes.length) return <span style={{ width: lado, height: lado, display: 'grid', placeItems: 'center', color: 'var(--line)' }}>?</span>
  return <Image src={fuentes[i]} alt="" width={lado} height={lado} className="img-plate" style={{ width: lado, height: lado, objectFit: 'contain' }} unoptimized onError={() => setI(n => n + 1)} />
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
  const [renombrando, setRenombrando] = useState(false)
  const [nombreRename, setNombreRename] = useState('')
  const inputNuevaRef = useRef<HTMLInputElement>(null)
  const inputRenameRef = useRef<HTMLInputElement>(null)

  // Cómo quiere comprar: lo más barato (recomendado), todo en un mayorista, todo en un súper, o elijo yo
  const [modo, setModo] = useState<Modo>('barato')
  const [selYo, setSelYo] = useState<string[]>([])           // lo marcado en "Elijo yo" (se recuerda al volver)
  const [elegidos, setElegidos] = useState<Record<string, string>>({})   // producto -> lugar, cuando lo cambia a mano
  const [abierto, setAbierto] = useState<string | null>(null)            // producto con el selector de lugar abierto
  const [recordar, setRecordar] = useState(false)
  const [copiado, setCopiado] = useState('')
  const calle = useRef<CalleListaControl | null>(null)

  useEffect(() => { if (creandoLista) inputNuevaRef.current?.focus() }, [creandoLista])
  useEffect(() => { if (renombrando) inputRenameRef.current?.focus() }, [renombrando])

  // "Recordar mis lugares": si los guardó, arranca en "Elijo yo" con esos lugares
  useEffect(() => {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE_LUGARES) || 'null')
      if (Array.isArray(g) && g.length) {
        setSelYo(g.filter((f: string) => fuentePorNombre(f)))
        setRecordar(true)
        setModo('yo')
      }
    } catch { /* sin localStorage: arranca en lo más barato */ }
  }, [])

  useEffect(() => {
    try {
      if (recordar && modo === 'yo') localStorage.setItem(CLAVE_LUGARES, JSON.stringify(selYo))
      else if (!recordar) localStorage.removeItem(CLAVE_LUGARES)
    } catch { /* sin localStorage no se recuerda, nada más */ }
  }, [recordar, modo, selYo])

  const listaActiva = listas.find(l => l.id === listaActivaId) ?? null
  const items = useMemo(() => listaActiva?.items ?? [], [listaActiva])
  const itemsPlan = useMemo(() => items.map(aItemPlan), [items])
  const r = useMemo(() => resumir(itemsPlan, FUENTES_PLAN), [itemsPlan])
  const unidades = itemsPlan.reduce((s, it) => s + it.q, 0)

  const lugares = modo === 'barato' ? r.barato.lugares
    : modo === 'yo' ? selYo
    : r.unoPorTipo[modo] ? [r.unoPorTipo[modo]!.fuente] : r.barato.lugares
  const pl = planCon(itemsPlan, lugares, modo === 'yo' ? elegidos : {})
  const n = pl.lugares.length

  const elegirModo = (m: Modo) => { setModo(m); setElegidos({}); setAbierto(null) }
  // tocar un lugar (chip, aviso de faltantes o el 3D) siempre pasa a "Elijo yo" partiendo de lo que ya se veía
  const alternar = (f: string) => {
    const base = modo === 'yo' ? selYo : pl.lugares
    const tiene = base.includes(f)
    setSelYo(tiene ? base.filter(x => x !== f) : [...base, f])
    if (tiene) setElegidos(e => Object.fromEntries(Object.entries(e).filter(([, v]) => v !== f)))
    if (modo !== 'yo') setModo('yo')
    setAbierto(null)
  }
  const comprarEn = (productoId: string, f: string) => {
    const base = modo === 'yo' ? selYo : pl.lugares
    setSelYo(base.includes(f) ? base : [...base, f])
    setElegidos(e => ({ ...e, [productoId]: f }))
    setModo('yo')
    setAbierto(null)
  }

  const textoLista = () => {
    const L = [`*${listaActiva?.nombre ?? 'Mi lista'}* · Brújula de Precios`, '']
    paradasDe(pl).forEach((g, j) => {
      L.push(`*${j + 1}. ${g.fuente}* · ${fmt(g.asig.reduce((s, a) => s + a.precio * a.item.q, 0))}`)
      g.asig.forEach(a => L.push(`  • ${a.item.nombre} ×${a.item.q} · ${fmt(a.precio * a.item.q)}`))
      L.push('')
    })
    if (pl.falta.length) L.push(`Falta conseguir: ${pl.falta.map(it => it.nombre).join(', ')}`, '')
    L.push(`*TOTAL: ${fmt(pl.total)}*`, '', SITIO_URL.replace(/^https?:\/\//, ''))
    return L.join('\n')
  }
  const copiar = () => {
    navigator.clipboard.writeText(textoLista()).then(
      () => setCopiado('Lista copiada. Pegala donde quieras.'),
      () => setCopiado('No se pudo copiar automáticamente en este navegador.'),
    )
    setTimeout(() => setCopiado(''), 3000)
  }

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

  // ---- textos del paso 2
  const unoEsBarato = r.barato.lugares.length === 1
  const etiqueta = modo === 'barato' ? 'Lo más barato'
    : modo === 'yo' ? (n ? nombres(pl.lugares) : 'Elegí tus lugares')
    : `Todo en ${r.unoPorTipo[modo]?.fuente ?? ''}`
  const faltaTxt = pl.falta.length && n ? (pl.falta.length === 1 ? 'falta 1' : `faltan ${pl.falta.length}`) : ''
  type Opcion = { m: Modo; t: string; sub: string; pr: number | null; tag?: string; extra?: string }
  const opciones: Opcion[] = [{
    m: 'barato', t: 'Lo más barato', tag: 'Recomendado', pr: r.barato.total,
    sub: unoEsBarato ? `Todo en ${r.barato.lugares[0]}` : nombres(r.barato.lugares),
    extra: !unoEsBarato && r.porLugares[1] ? `Ahorrás ${fmt(r.porLugares[1].total - r.barato.total)} contra ir a un solo lugar`
      : unoEsBarato && r.porLugares[2] ? 'Ir a un segundo lugar casi no te ahorra' : '',
  }]
  for (const tipo of ['mayorista', 'cadena'] as const) {
    const u = r.unoPorTipo[tipo]
    if (u && !(unoEsBarato && r.barato.lugares[0] === u.fuente)) {
      opciones.push({ m: tipo, t: tipo === 'mayorista' ? 'Todo en un mayorista' : 'Todo en un súper', pr: u.total, sub: `${u.fuente}, el ${tipo === 'mayorista' ? 'mayorista' : 'súper'} más barato que tiene todo` })
    }
  }
  opciones.push({ m: 'yo', t: 'Elijo yo mis lugares', pr: modo === 'yo' && n ? pl.total : null, sub: modo === 'yo' ? (n ? nombres(pl.lugares) : 'Marcá abajo a qué lugares vas') : 'Te mostramos cuánto sale en cada uno' })

  // notas de "Elijo yo": qué sobra, si hay algo más barato, cuánto suma cada lugar de más (sin retar)
  const notas: React.ReactNode[] = []
  if (modo === 'yo' && n && !pl.falta.length) {
    const sobran = selYo.filter(f => !pl.lugares.includes(f))
    if (sobran.length) notas.push(<div key="s">En <b>{nombres(sobran)}</b> no te conviene comprar nada: todo está más barato en tus otros lugares.</div>)
    const mejorN = n <= 3 ? r.porLugares[n] : null
    if (mejorN && pl.total - mejorN.total > 1 && !Object.keys(elegidos).length) {
      notas.push(<div key="m">Yendo a {n === 1 ? '1 lugar' : `${n} lugares`} hay una opción <b className="tnum">{fmt(pl.total - mejorN.total)}</b> más barata. <button className="ml-link" onClick={() => { setSelYo(mejorN.lugares); setElegidos({}) }}>Ver cuál</button></div>)
    } else if (n > r.barato.lugares.length && pl.total < r.barato.total) {
      notas.push(<div key="a">Ir a {n} lugares te ahorra <b className="tnum">{fmt(r.barato.total - pl.total)}</b> más que lo recomendado.</div>)
    }
  }
  const paraFaltantes = pl.falta.length && n ? lugarParaFaltantes(pl.falta, FUENTES.map(f => f.nombre)) : null

  return (
    <div style={{ background: '#ffffff', minHeight: '100%' }}>
      <style>{`
        @keyframes lista-rise { to { opacity: 1; transform: translateY(0); } }
        .lista-anim { opacity: 0; transform: translateY(10px); animation: lista-rise 380ms var(--ease-out) forwards; }
        @media (prefers-reduced-motion: reduce) { .lista-anim { transform: none; animation-duration: 150ms; } }
        .lista-wrap { max-width: 760px; margin: 0 auto; }
        .ml-tab { border: 1px solid var(--line); border-radius: 999px; padding: 9px 16px; font-size: 13.5px; font-weight: 500; white-space: nowrap; background: #fff; color: var(--ink); cursor: pointer; flex-shrink: 0; font-family: var(--font-sans); }
        .ml-tab.act { border-color: var(--pill); background: var(--pill); color: #fff; }
        .ml-tit { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 20px 12px; }
        .ml-tit h1 { font-size: 24px; font-weight: 600; letter-spacing: -0.4px; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink); }
        .ml-tit .acc { display: flex; align-items: center; gap: 4px; min-width: 0; }
        .ml-tit .acc button { background: none; border: none; cursor: pointer; display: flex; color: var(--gray); padding: 4px; flex-shrink: 0; }
        .ml-tit .res { color: var(--gray); font-size: 13px; white-space: nowrap; }
        .ml-escena { position: relative; height: 320px; background: #e9e4d8; }
        .ml-cargando { display: grid; place-items: center; font-size: 14px; color: var(--gray); }
        .ml-cuerpo { padding: 16px 20px 40px; display: grid; gap: 14px; }
        .ml-cuerpo button { font-family: var(--font-sans); color: var(--ink); }
        .ml-cuerpo button:focus-visible, .ml-cuerpo summary:focus-visible, .ml-cuerpo a:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        details.ml-paso { border: 1.5px solid var(--line); border-radius: 16px; padding: 12px 14px; background: #fff; }
        details.ml-paso[open] { border-color: #d9d5ce; }
        details.ml-paso > summary { list-style: none; cursor: pointer; display: grid; grid-template-columns: 26px minmax(0, 1fr) 16px; gap: 10px; align-items: center; }
        details.ml-paso > summary::-webkit-details-marker { display: none; }
        .ml-pn { width: 26px; height: 26px; border-radius: 50%; background: var(--ink); color: #fff; font-size: 14px; font-weight: 600; display: grid; place-items: center; }
        details.ml-paso h2 { margin: 0; font-size: 17px; font-weight: 600; color: var(--ink); }
        .ml-res { display: block; font-size: 13.5px; color: var(--gray); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ml-res b { color: var(--ink); font-weight: 600; }
        .ml-rojo { color: var(--red); font-weight: 600; }
        .ml-chev { width: 10px; height: 10px; border-right: 2px solid var(--ink); border-bottom: 2px solid var(--ink); transform: rotate(45deg); justify-self: center; margin-top: -4px; transition: transform .2s; }
        details[open] > summary .ml-chev { transform: rotate(225deg); margin-top: 4px; }
        .ml-cont { display: grid; gap: 10px; padding-top: 12px; }
        .ml-prod { display: grid; grid-template-columns: 40px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--plate); }
        .ml-prod .n { font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--ink); }
        .ml-prod small { display: block; color: var(--gray); font-size: 12.5px; }
        .ml-step { display: inline-flex; align-items: center; gap: 10px; }
        .ml-step button { width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid var(--line); background: #fff; font-size: 17px; line-height: 1; cursor: pointer; }
        .ml-step b { min-width: 20px; text-align: center; font-weight: 600; }
        .ml-mini { justify-self: start; border: 1.5px solid var(--ink); background: #fff; border-radius: 999px; padding: 7px 13px; font-size: 13.5px; font-weight: 500; cursor: pointer; }
        .ml-opcion { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 14px; background: #fff; cursor: pointer; text-align: left; width: 100%; }
        .ml-opcion .radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid #c8c8c8; }
        .ml-opcion[aria-pressed="true"] { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink) inset; }
        .ml-opcion[aria-pressed="true"] .radio { border: 6px solid var(--ink); }
        .ml-opcion .t { font-weight: 600; font-size: 15px; display: block; }
        .ml-opcion .sub { font-size: 13px; color: var(--gray); display: block; }
        .ml-opcion .sub.ok { color: var(--green); font-weight: 600; }
        .ml-opcion .tag { font-size: 10.5px; font-weight: 600; color: var(--green); letter-spacing: .05em; text-transform: uppercase; display: block; }
        .ml-opcion .pr { font-weight: 700; font-size: 17px; text-align: right; }
        .ml-nota { font-size: 13.5px; color: var(--gray); background: var(--plate); border-radius: 12px; padding: 9px 12px; display: grid; gap: 6px; }
        .ml-nota b { color: var(--ink); font-weight: 600; }
        .ml-link { border: none; background: none; padding: 0; text-decoration: underline; cursor: pointer; font-size: 13.5px; }
        .ml-mini-t { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--gray); }
        .ml-lrow { display: grid; grid-template-columns: 22px 80px minmax(0, 1fr) auto; gap: 10px; align-items: center; width: 100%; text-align: left; border: 1.5px solid var(--line); border-radius: 12px; padding: 9px 12px; background: #fff; cursor: pointer; }
        .ml-lrow .check { width: 20px; height: 20px; border-radius: 6px; border: 2px solid #c8c8c8; display: grid; place-items: center; color: #fff; font-size: 13px; font-weight: 700; }
        .ml-lrow[aria-pressed="true"] { border-color: var(--green); background: var(--green-bg); }
        .ml-lrow[aria-pressed="true"] .check { background: var(--green); border-color: var(--green); }
        .ml-lrow .n { font-size: 14px; font-weight: 600; display: block; }
        .ml-lrow small { font-size: 12.5px; color: var(--gray); display: block; }
        .ml-lrow small.falta { color: var(--red); }
        .ml-lrow .pr { text-align: right; font-weight: 700; font-size: 15px; }
        .ml-lrow .pr small { font-weight: 400; }
        .ml-lrow .best { font-size: 10.5px; font-weight: 600; color: var(--green); letter-spacing: .05em; text-transform: uppercase; display: block; }
        .ml-chk { display: flex; gap: 8px; align-items: center; font-size: 14px; cursor: pointer; color: var(--ink); }
        .ml-chk input { width: 18px; height: 18px; accent-color: var(--green); }
        .ml-aviso { border: 1.5px solid #ecc9c1; background: #fbf1ee; border-radius: 12px; padding: 10px 12px; font-size: 14px; display: grid; gap: 8px; color: var(--ink); }
        .ml-aviso b { font-weight: 600; }
        details.ml-parada { border: 1.5px solid var(--line); border-radius: 16px; padding: 12px 14px 4px; background: #fff; }
        details.ml-parada > summary { list-style: none; cursor: pointer; }
        details.ml-parada > summary::-webkit-details-marker { display: none; }
        .ml-cab { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; gap: 8px; }
        details.ml-parada[open] .ml-cab { border-bottom: 1px dashed var(--line); }
        .ml-cab .izq, .ml-cab .der { display: flex; align-items: center; gap: 10px; }
        .ml-num { width: 24px; height: 24px; border-radius: 50%; background: var(--green); color: #fff; font-size: 13px; font-weight: 600; display: grid; place-items: center; flex: none; }
        .ml-cab .cant { font-size: 13px; color: var(--gray); }
        .ml-cab .st { font-size: 16px; font-weight: 600; color: var(--ink); }
        .ml-linea { display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 10px; align-items: center; font-size: 14px; padding: 8px 0; width: 100%; border: 0; border-bottom: 1px solid var(--plate); background: none; text-align: left; cursor: pointer; }
        .ml-linea .q { color: var(--gray); }
        .ml-linea .camb { display: block; font-size: 12.5px; color: var(--gray); text-decoration: underline; }
        .ml-linea .camb.yo { color: var(--gold); text-decoration: none; font-weight: 600; }
        .ml-picker { display: grid; gap: 5px; padding: 2px 0 10px; }
        .ml-opc { display: grid; grid-template-columns: 84px minmax(0, 1fr) auto; gap: 10px; align-items: center; border: 1.5px solid var(--line); border-radius: 10px; padding: 7px 10px; background: #fff; cursor: pointer; text-align: left; font-size: 14px; }
        .ml-opc[aria-pressed="true"] { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink) inset; }
        .ml-opc .tag { font-size: 12px; font-weight: 600; color: var(--green); }
        .ml-opc .tag.gris { color: var(--gray); font-weight: 400; }
        .ml-totfin { display: flex; justify-content: space-between; align-items: baseline; border-top: 2px dashed var(--line); padding-top: 12px; color: var(--ink); }
        .ml-totfin span { font-size: 13px; font-weight: 600; letter-spacing: .12em; }
        .ml-totfin .g { font-size: 30px; font-weight: 700; letter-spacing: -.8px; }
        .ml-enviar { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
        .ml-wa { display: block; text-align: center; background: var(--ink); color: #fff; border-radius: 999px; padding: 13px 16px; font-weight: 600; font-size: 15px; text-decoration: none; }
        .ml-gris { font-size: 13px; color: var(--gray); }
        @media (prefers-reduced-motion: reduce) { .ml-chev { transition: none; } }
        @media (min-width: 1000px) {
          .lista-wrap { max-width: 1180px; padding: 0 44px; }
          .ml-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 460px); gap: 40px; align-items: start; }
          .ml-grid .ml-escena { position: sticky; top: 16px; height: 380px; border-radius: 20px; overflow: hidden; margin-top: 16px; }
          .ml-cuerpo { padding: 16px 0 40px; }
          .ml-tit { padding: 16px 0 12px; }
        }
      `}</style>

      <div className="lista-wrap">
        {/* Selector de listas */}
        <HScroll className="lista-anim scrollbar-hide" style={{ display: 'flex', gap: '9px', padding: '10px 20px 0', overflowX: 'auto' }} arrowOffsetY={5}>
          {listas.map(lista => (
            <button key={lista.id} className={`ml-tab${lista.id === listaActivaId ? ' act' : ''}`} onClick={() => onSeleccionarLista(lista.id)}>
              {lista.nombre}
            </button>
          ))}
          {creandoLista ? (
            <span className="ml-tab" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'default' }}>
              <input
                ref={inputNuevaRef}
                value={nombreNueva}
                onChange={e => setNombreNueva(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirmarNueva()
                  if (e.key === 'Escape') { setCreandoLista(false); setNombreNueva('') }
                }}
                placeholder="Nombre de la lista"
                style={{ border: 'none', outline: 'none', fontSize: '16px', width: '150px', fontFamily: 'var(--font-sans)', background: 'transparent', color: 'var(--ink)' }}
              />
              <Check size={16} style={{ cursor: 'pointer', color: 'var(--green)' }} onClick={handleConfirmarNueva} />
              <X size={16} style={{ cursor: 'pointer', color: 'var(--gray)' }} onClick={() => { setCreandoLista(false); setNombreNueva('') }} />
            </span>
          ) : (
            <button className="ml-tab" style={{ borderStyle: 'dashed', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setCreandoLista(true)}>
              <Plus size={13} strokeWidth={2.5} />
              Nueva
            </button>
          )}
        </HScroll>

        {listaActiva && items.length > 0 ? (
          <>
            <div className="ml-tit lista-anim" style={{ animationDelay: '60ms' }}>
              <div className="acc">
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
                    style={{ fontSize: '22px', fontWeight: 600, border: 'none', borderBottom: '1.5px solid var(--gold)', outline: 'none', fontFamily: 'var(--font-sans)', color: 'var(--ink)', background: 'transparent', width: '100%', minWidth: 0 }}
                  />
                ) : (
                  <>
                    <h1>{listaActiva.nombre}</h1>
                    <button onClick={() => { setNombreRename(listaActiva.nombre); setRenombrando(true) }} aria-label="Renombrar lista"><Pencil size={16} strokeWidth={2} /></button>
                    <button onClick={() => onEliminarLista(listaActiva.id)} aria-label="Eliminar lista"><Trash2 size={16} strokeWidth={2} /></button>
                  </>
                )}
              </div>
              <span className="res tnum">{items.length} producto{items.length !== 1 ? 's' : ''} · {unidades} unidad{unidades !== 1 ? 'es' : ''}</span>
            </div>

            <div className="ml-grid">
              <CalleLista
                plan={pl}
                fotos={Object.fromEntries(items.map(it => [it.producto.id, [it.producto.imageUrl ?? '', ...(it.producto.imagenFallbacks ?? [])].filter(Boolean)]))}
                items={itemsPlan}
                seleccionados={modo === 'yo' ? selYo : pl.lugares}
                control={calle}
                onAlternar={alternar}
              />

              <div className="ml-cuerpo">
                <details className="ml-paso" name="pasos">
                  <summary>
                    <span className="ml-pn">1</span>
                    <span><h2>Tu lista</h2><span className="ml-res tnum">{items.length} productos · {unidades} unidades</span></span>
                    <span className="ml-chev" aria-hidden="true" />
                  </summary>
                  <div className="ml-cont">
                    <div>
                      {items.map((item, idx) => {
                        const it = itemsPlan[idx]
                        const precios = Object.values(it.p)
                        return (
                          <div key={item.producto.id} className="ml-prod">
                            <Foto item={item} lado={40} />
                            <span>
                              <span className="n">{item.producto.nombre}</span>
                              <small className="tnum">{precios.length ? `desde ${fmt(Math.min(...precios))} c/u` : 'sin precio hoy'}</small>
                            </span>
                            <span className="ml-step">
                              <button onClick={() => it.q > 1 ? onCambiarCantidad?.(idx, it.q - 1) : onEliminarItem(idx)} aria-label={it.q > 1 ? `Uno menos de ${it.nombre}` : `Quitar ${it.nombre}`}>
                                {it.q > 1 ? '−' : <Trash2 size={14} strokeWidth={2} />}
                              </button>
                              <b className="tnum">{it.q}</b>
                              <button onClick={() => onCambiarCantidad?.(idx, it.q + 1)} aria-label={`Uno más de ${it.nombre}`}>+</button>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <button className="ml-mini" onClick={onIrAComparar}>+ Agregar producto</button>
                  </div>
                </details>

                <details className="ml-paso" name="pasos">
                  <summary>
                    <span className="ml-pn">2</span>
                    <span>
                      <h2>Dónde comprar</h2>
                      <span className="ml-res tnum"><b>{etiqueta}</b>{n ? ` · ${fmt(pl.total)}` : ''}{faltaTxt && <> · <span className="ml-rojo">{faltaTxt}</span></>}</span>
                    </span>
                    <span className="ml-chev" aria-hidden="true" />
                  </summary>
                  <div className="ml-cont">
                    {opciones.map(o => (
                      <button key={o.m} className="ml-opcion" aria-pressed={modo === o.m} onClick={() => elegirModo(o.m)}>
                        <span className="radio" />
                        <span>
                          {o.tag && <span className="tag">{o.tag}</span>}
                          <span className="t">{o.t}</span>
                          <span className="sub">{o.sub}</span>
                          {o.extra && <span className={`sub${o.m === 'barato' ? ' ok' : ''}`}>{o.extra}</span>}
                        </span>
                        <span className="pr tnum">{o.pr ? fmt(o.pr) : ''}</span>
                      </button>
                    ))}
                    {notas.length > 0 && <div className="ml-nota">{notas}</div>}
                    {modo === 'yo' && (
                      <div style={{ display: 'grid', gap: '10px', padding: '4px 2px 2px' }}>
                        <span className="ml-gris">Marcá los lugares a los que vas (uno o varios). Con esos te armamos la compra más barata.</span>
                        {(['mayorista', 'cadena'] as const).map(tipo => {
                          // precio solo en los que tienen todo: un total parcial parece más barato y engaña
                          const filas = FUENTES.filter(f => f.tipo === tipo)
                            .map(f => ({ f: f.nombre, falta: faltanEn(itemsPlan, f.nombre), tot: totalEn(itemsPlan, f.nombre) }))
                            .sort((a, b) => a.falta.length - b.falta.length || a.tot - b.tot)
                          return (
                            <div key={tipo} style={{ display: 'grid', gap: '6px' }}>
                              <span className="ml-mini-t">{tipo === 'mayorista' ? 'Mayoristas' : 'Súper'} · del más barato al más caro</span>
                              {filas.map(({ f, falta, tot }, j) => (
                                <button key={f} className="ml-lrow" aria-pressed={selYo.includes(f)} onClick={() => alternar(f)}>
                                  <span className="check">{selYo.includes(f) ? '✓' : ''}</span>
                                  <Logo fuente={f} alto={22} />
                                  <span>
                                    {j === 0 && !falta.length && <span className="best">Más barato</span>}
                                    <span className="n">{f}</span>
                                    <small className={falta.length ? 'falta' : ''}>{falta.length === 1 ? 'Le falta 1' : falta.length ? `Le faltan ${falta.length}` : `Tiene los ${itemsPlan.length}`}</small>
                                  </span>
                                  <span className="pr tnum">{falta.length ? '' : <>{fmt(tot)}<small> todo ahí</small></>}</span>
                                </button>
                              ))}
                            </div>
                          )
                        })}
                        <label className="ml-chk"><input type="checkbox" checked={recordar} onChange={e => setRecordar(e.target.checked)} /> Recordar mis lugares para la próxima</label>
                      </div>
                    )}
                  </div>
                </details>

                {paraFaltantes && (
                  <div className="ml-aviso">
                    <span>
                      {pl.falta.length === 1 ? <>Te falta <b>{pl.falta[0].nombre}</b></> : <>Te faltan <b>{pl.falta.length} productos</b></>} en los lugares que marcaste.{' '}
                      {paraFaltantes.cubre === pl.falta.length
                        ? <>En <b>{paraFaltantes.fuente}</b> {pl.falta.length === 1 ? 'está' : 'están todos'}, y es lo más barato.</>
                        : <><b>{paraFaltantes.fuente}</b> tiene {paraFaltantes.cubre}.</>}
                    </span>
                    <button className="ml-mini" onClick={() => alternar(paraFaltantes.fuente)}>Sumar {paraFaltantes.fuente}</button>
                  </div>
                )}

                <details className="ml-paso" name="pasos">
                  <summary>
                    <span className="ml-pn">3</span>
                    <span>
                      <h2>Tu recorrido</h2>
                      <span className="ml-res tnum">{n ? <>{n === 1 ? '1 lugar' : `${n} lugares`} · <b>{fmt(pl.total)}</b>{faltaTxt && <> · <span className="ml-rojo">{faltaTxt}</span></>}</> : 'Todavía sin lugares'}</span>
                    </span>
                    <span className="ml-chev" aria-hidden="true" />
                  </summary>
                  <div className="ml-cont">
                    {n ? paradasDe(pl).map((g, j) => (
                      <details key={g.fuente} className="ml-parada" onToggle={e => { if ((e.currentTarget as HTMLDetailsElement).open) calle.current?.enfocar(g.fuente) }}>
                        <summary>
                          <span className="ml-cab">
                            <span className="izq"><span className="ml-num">{j + 1}</span><Logo fuente={g.fuente} /><span className="cant">{g.asig.length === 1 ? '1 producto' : `${g.asig.length} productos`}</span></span>
                            <span className="der"><span className="st tnum">{fmt(g.asig.reduce((s, a) => s + a.precio * a.item.q, 0))}</span><span className="ml-chev" aria-hidden="true" /></span>
                          </span>
                        </summary>
                        {g.asig.map(a => {
                          const item = items.find(i => i.producto.id === a.item.id)!
                          const ops = Object.entries(a.item.p).sort((x, y) => x[1] - y[1])
                          return (
                            <div key={a.item.id}>
                              <button className="ml-linea" aria-expanded={abierto === a.item.id} onClick={() => setAbierto(x => (x === a.item.id ? null : a.item.id))}>
                                <Foto item={item} lado={34} />
                                <span>{a.item.nombre} <span className="q tnum">×{a.item.q}</span><span className={`camb${a.elegidoPorVos ? ' yo' : ''}`}>{a.elegidoPorVos ? 'Elegido por vos · cambiar' : 'Comprar en otro lado'}</span></span>
                                <span className="tnum">{fmt(a.precio * a.item.q)}</span>
                              </button>
                              {abierto === a.item.id && (
                                <div className="ml-picker">
                                  {ops.map(([f, v], k) => (
                                    <button key={f} className="ml-opc" aria-pressed={f === a.fuente} onClick={() => comprarEn(a.item.id, f)}>
                                      <Logo fuente={f} />
                                      <span className="tnum">{fmt(v)} c/u · {fmt(v * a.item.q)}</span>
                                      <span className={`tag${k ? ' gris' : ''}`}>{k ? '+' + fmt((v - ops[0][1]) * a.item.q) : 'más barato'}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </details>
                    )) : <div className="ml-nota">Elegí al menos un lugar en el paso 2.</div>}
                    <div className="ml-totfin"><span>TOTAL</span><span className="g tnum">{n ? fmt(pl.total) + (pl.falta.length ? ' + falta' : '') : '—'}</span></div>
                    <div className="ml-enviar">
                      <a className="ml-wa" href={'https://wa.me/?text=' + encodeURIComponent(textoLista())} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>
                      <button className="ml-mini" onClick={copiar}>Copiar lista</button>
                    </div>
                    {copiado && <span className="ml-gris" role="status">{copiado}</span>}
                  </div>
                </details>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              {listas.length === 0 ? 'Todavía no tenés listas' : 'Esta lista está vacía'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '24px', lineHeight: 1.5 }}>
              Buscá un producto y tocá &quot;Guardar&quot;<br />para ver acá dónde comprarlo más barato
            </div>
            <button onClick={onIrAComparar} style={{ background: 'var(--pill)', color: '#ffffff', border: 'none', borderRadius: '999px', fontFamily: 'var(--font-sans)', fontSize: '14.5px', fontWeight: 500, padding: '14px 28px', cursor: 'pointer' }}>
              Explorar el catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
