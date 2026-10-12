'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Producto, Precio, fuentePorNombre } from '@/lib/data'
import type { CalleControl, FuenteCalle } from '@/components/calle-precios'

// La calle 3D pesa (three.js): se baja recién cuando la sección aparece en pantalla
// y nunca en el servidor. Sin WebGL, la cuenta de arriba alcanza para usar la pantalla.
const CallePrecios = dynamic(() => import('@/components/calle-precios'), {
  ssr: false,
  loading: () => <div className="etp-esc etp-cargando">Armando el recorrido…</div>,
})

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR')
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function fechaReferencia(cadenas: Precio[]): string {
  const fechas = cadenas.map(c => c.fechaScraping).filter((f): f is string => !!f).sort()
  const ultima = fechas[fechas.length - 1]
  if (!ultima) return 'Lo que cobran los súper'
  const d = new Date(ultima + 'T12:00:00')
  if (isNaN(d.getTime())) return 'Lo que cobran los súper'
  const esHoy = d.toDateString() === new Date().toDateString()
  return `Lo que cobran los súper ${esHoy ? 'hoy' : 'al'} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

interface Props {
  producto: Producto
  mayoristas: Precio[]   // ordenados de menor a mayor
  cadenas: Precio[]      // ordenados de menor a mayor
  enLista?: boolean
  onGuardar: (data: { mayorista: string; precioCompra: number; precioVenta: number }) => void
}

export function ElegiTuPrecio({ producto, mayoristas, cadenas, enLista, onGuardar }: Props) {
  // "Dónde lo comprás" no asume mayorista: el costo puede salir de un súper si ahí es más barato
  const fuentes = [...mayoristas, ...cadenas].sort((a, b) => a.precio - b.precio)
  const [fuenteSel, setFuenteSel] = useState<string | null>(null)
  const sel = fuentes.find(f => f.mayorista === fuenteSel) ?? fuentes[0]
  const costo = sel.precio
  const esMin = sel === fuentes[0]

  const min = Math.floor(Math.min(costo, cadenas[0]?.precio ?? costo) * 0.9 / 10) * 10
  const max = Math.ceil(Math.max(cadenas[cadenas.length - 1]?.precio ?? costo, costo * 1.2) * 1.15 / 100) * 100
  const imanes = [costo, ...cadenas.map(c => c.precio)]
  const inicial = cadenas.length ? cadenas[Math.floor(cadenas.length / 2)].precio : Math.round(costo * 1.35 / 10) * 10

  const [v, setV] = useState(inicial)
  const [quieto, setQuieto] = useState(true)
  const [abierto, setAbierto] = useState(false)
  const [escribiendo, setEscribiendo] = useState<string | null>(null)
  const [sello, setSello] = useState(0)
  const [guardado, setGuardado] = useState(false)
  const [verCalle, setVerCalle] = useState(false)
  const control = useRef<CalleControl | null>(null)
  const seccion = useRef<HTMLElement>(null)

  // precio redondeado: exacto si está pegado a un precio de referencia, si no de a $10
  const vr = imanes.some(p => Math.abs(p - v) < 0.5) ? Math.round(v) : Math.round(v / 10) * 10
  const gana = vr - costo
  const ultimoSello = useRef(vr)

  useEffect(() => {
    if (!quieto || ultimoSello.current === vr) return
    ultimoSello.current = vr
    setSello(s => s + 1)
  }, [quieto, vr])

  useEffect(() => {
    const el = seccion.current
    if (!el || !cadenas.length) return
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setVerCalle(true); io.disconnect() } }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [cadenas.length])

  const irA = (p: number) => {
    if (control.current) control.current.ir(p)
    else setV(p)
  }

  const elegirFuente = (nombre: string) => {
    setFuenteSel(nombre)
    setAbierto(false)
  }

  const guardar = () => {
    if (enLista || guardado) return
    setGuardado(true)
    onGuardar({ mayorista: sel.mayorista, precioCompra: sel.precio, precioVenta: vr })
  }

  const fuentesCalle = (lista: Precio[]): FuenteCalle[] =>
    lista.map(p => ({ nombre: p.mayorista, precio: p.precio, logo: fuentePorNombre(p.mayorista)?.logo ?? '' }))

  const yaEnLista = enLista || guardado
  const grupos: [string, Precio[]][] = [['Mayoristas · precio de compra', mayoristas], ['Súper · precio de góndola', cadenas]]

  return (
    <section ref={seccion} className="etp" aria-labelledby="etp-tit">
      <style>{`
        .etp { border: 1.5px solid var(--line); border-radius: 20px; padding: 20px 18px; display: grid; gap: 16px; background: #fff; overflow: hidden; }
        .etp h2 { margin: 0; font-size: 19px; font-weight: 600; letter-spacing: -0.2px; color: var(--ink); }
        .etp-compra { font: inherit; font-size: 15px; background: none; border: none; padding: 2px 0; text-align: left; color: var(--gray); cursor: pointer; }
        .etp-compra b { color: var(--ink); font-weight: 600; }
        .etp-compra .sug { color: var(--green); font-weight: 600; }
        .etp-compra .cambiar { margin-left: 8px; color: var(--ink); font-weight: 600; text-decoration: underline dotted 1.5px; text-underline-offset: 4px; white-space: nowrap; }
        .etp-compra[aria-expanded="true"] .cambiar { text-decoration-style: solid; }
        .etp-compra:focus-visible, .etp button:focus-visible, .etp input:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
        .etp-fuentes { border: 1.5px solid var(--ink); border-radius: 4px; margin-top: 8px; }
        .etp-fuentes .t { font-size: 13px; color: var(--gray); padding: 8px 12px 4px; }
        .etp-fuentes .g { font-size: 13px; font-weight: 600; color: var(--gray); padding: 10px 12px 4px; border-top: 1px solid var(--line); }
        .etp-fu { display: grid; grid-template-columns: 84px 1fr auto; align-items: center; gap: 8px; width: 100%; font: inherit; background: none; border: none; border-top: 1px solid var(--line); padding: 11px 12px; cursor: pointer; text-align: left; color: var(--ink); }
        .etp-fu img { height: 22px; width: auto; max-width: 80px; object-fit: contain; background: #fff; }
        .etp-fu .tag { font-size: 12px; font-weight: 600; color: var(--green); }
        .etp-fu .p { font-size: 16px; font-weight: 600; }
        .etp-fu[aria-checked="true"] { background: var(--ink); color: #fff; }
        .etp-fu[aria-checked="true"] .tag { color: #e6c79a; }
        .etp-fu[aria-checked="true"] img { padding: 2px 4px; }
        .etp-cuenta .f { display: grid; grid-template-columns: 1fr auto; align-items: baseline; gap: 12px; padding: 5px 0; }
        .etp-cuenta .et { font-size: 15px; color: var(--gray); }
        .etp-cuenta .vende { align-items: end; }
        .etp-cuenta .vende .et { padding-bottom: 12px; color: var(--ink); font-weight: 600; white-space: nowrap; }
        .etp-monto { display: flex; align-items: baseline; justify-content: flex-end; gap: 4px; }
        .etp-monto span { font-size: 26px; font-weight: 600; color: var(--gray); }
        .etp-monto input { font: inherit; font-size: 46px; font-weight: 700; letter-spacing: -2px; min-width: 3ch; max-width: 100%; text-align: right; background: transparent; border: none; border-bottom: 2px dashed #cfc9bb; outline: none; color: var(--ink); padding: 0; font-variant-numeric: tabular-nums; }
        .etp-monto input:focus { border-bottom-color: var(--ink); }
        .etp-cuenta .costo .num { font-size: 18px; font-weight: 500; color: #3d3d3d; }
        .etp-raya { height: 1.5px; background: var(--ink); margin: 8px 0 6px; }
        .etp-cuenta .gana .et { color: var(--ink); font-weight: 600; }
        .etp-sello { display: inline-block; min-width: 142px; text-align: center; font-size: 30px; font-weight: 700; letter-spacing: -0.8px; line-height: 1.15; color: #fff; background: var(--green); padding: 2px 12px; transform: rotate(-1.8deg); box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px var(--green); white-space: nowrap; font-variant-numeric: tabular-nums; }
        .etp-sello.neg { background: var(--red); box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px var(--red); }
        .etp-sello.sella { animation: etp-sella 280ms var(--ease-out); }
        @keyframes etp-sella { from { transform: rotate(-1.8deg) scale(1.16); } to { transform: rotate(-1.8deg) scale(1); } }
        .etp-r { font-size: 14px; color: var(--gray); text-align: right; min-height: 20px; padding-top: 4px; font-variant-numeric: tabular-nums; }
        .etp-r.neg { color: var(--red); font-weight: 600; }
        .etp-ref { display: grid; gap: 2px; } .etp-ref b { font-weight: 600; font-size: 16px; } .etp-ref span { font-size: 14px; color: var(--gray); }
        .etp-esc { position: relative; height: 300px; margin: 0 -18px; background: #efece5; }
        .etp-cargando { display: grid; place-items: center; font-size: 14px; color: var(--gray); }
        .etp-atajos { display: flex; gap: 6px; overflow-x: auto; padding: 2px 0 4px; scrollbar-width: none; }
        .etp-atajos::-webkit-scrollbar { display: none; }
        .etp-ata { flex: none; display: grid; justify-items: center; gap: 2px; min-width: 66px; padding: 6px 8px 5px; background: #fff; border: 1.5px solid var(--ink); border-radius: 3px; font: inherit; color: var(--ink); cursor: pointer; transition: transform 160ms var(--ease-out); }
        .etp-ata:active { transform: scale(0.96); }
        .etp-ata img { height: 16px; width: auto; max-width: 54px; object-fit: contain; }
        .etp-ata b { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
        .etp-ata small { font-size: 11px; font-weight: 600; color: var(--gray); line-height: 16px; }
        .etp-ata[aria-pressed="true"] { background: var(--ink); color: #fff; }
        .etp-ata[aria-pressed="true"] img { background: #fff; padding: 1px 3px; }
        .etp-ata[aria-pressed="true"] small { color: #e6c79a; }
        .etp-guardar { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; font: inherit; font-weight: 600; font-size: 15px; padding: 15px 16px; background: var(--ink); color: #fff; border: none; border-radius: 999px; cursor: pointer; transition: background 200ms; }
        .etp-guardar.ok { background: var(--green); cursor: default; }
        .etp-guardar.rebota svg { animation: etp-rebota 500ms cubic-bezier(.2,.8,.2,1); }
        @keyframes etp-rebota { 30% { transform: translateY(2px) scale(.92); } 60% { transform: translateY(-5px) scale(1.12); } }
        @media (prefers-reduced-motion: reduce) { .etp-sello.sella, .etp-guardar.rebota svg { animation: none; } }
      `}</style>

      <h2 id="etp-tit">Elegí tu precio y mirá cuánto ganás</h2>

      <div>
        <button type="button" className="etp-compra" aria-expanded={abierto} onClick={() => setAbierto(a => !a)}>
          Lo comprás en <b>{sel.mayorista}</b> a <b className="tnum">{fmt(costo)}</b>
          {esMin && fuentes.length > 1 && <span className="sug"> · el más barato</span>}
          {fuentes.length > 1 && <span className="cambiar">cambiar</span>}
        </button>
        {abierto && fuentes.length > 1 && (
          <div className="etp-fuentes">
            <div className="t">¿Dónde lo comprás?</div>
            <div role="radiogroup" aria-label="Dónde lo comprás">
              {grupos.filter(([, l]) => l.length).map(([titulo, lista]) => (
                <div key={titulo}>
                  <div className="g">{titulo}</div>
                  {lista.map(p => {
                    const logo = fuentePorNombre(p.mayorista)?.logo
                    return (
                      <button key={p.mayorista} type="button" role="radio" aria-checked={p.mayorista === sel.mayorista} className="etp-fu" onClick={() => elegirFuente(p.mayorista)}>
                        {logo ? <Image src={logo} alt={p.mayorista} width={80} height={22} unoptimized /> : <span>{p.mayorista}</span>}
                        <span className="tag">{p === fuentes[0] ? 'Más barato' : ''}</span>
                        <span className="p tnum">{fmt(p.precio)}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="etp-cuenta" aria-live="polite">
        <div className="f vende">
          <label className="et" htmlFor="etp-venta">Lo vendés a</label>
          <div className="etp-monto">
            <span>$</span>
            <input
              id="etp-venta"
              inputMode="numeric"
              aria-label="Tu precio de venta (tocá para escribirlo)"
              value={escribiendo ?? vr.toLocaleString('es-AR')}
              style={{ width: `${(escribiendo ?? vr.toLocaleString('es-AR')).length * 0.62 + 0.4}em` }}
              onFocus={() => setEscribiendo(vr.toLocaleString('es-AR'))}
              onBlur={() => setEscribiendo(null)}
              onChange={e => {
                setEscribiendo(e.target.value)
                const n = Number(e.target.value.replace(/\D/g, ''))
                if (n) irA(Math.min(n, costo * 100))
              }}
            />
          </div>
        </div>
        <div className="f costo"><span className="et">Te costó</span><span className="num tnum">− {fmt(costo)}</span></div>
        <div className="etp-raya" />
        <div className="f gana">
          <span className="et">Ganás por cada uno</span>
          <span key={sello} className={`etp-sello${gana < 0 ? ' neg' : ''}${sello ? ' sella' : ''}`}>{(gana < 0 ? '−' : '+') + fmt(Math.abs(gana))}</span>
        </div>
        <div className={`etp-r${gana < 0 ? ' neg' : ''}`}>
          {gana < 0 ? 'Ojo: lo vendés más barato de lo que te costó' : `Es un ${Math.round(gana / costo * 100)}% más de lo que pagaste`}
        </div>
      </div>

      {cadenas.length > 0 && (
        <>
          <div className="etp-ref"><b>Precios de referencia</b><span>{fechaReferencia(cadenas)}</span></div>
          {verCalle && (
            <CallePrecios
              key={sel.mayorista}
              costo={costo}
              cadenas={fuentesCalle(cadenas)}
              mayoristas={fuentesCalle(mayoristas)}
              productoImg={[producto.imageUrl ?? '', ...(producto.imagenFallbacks ?? [])].filter(Boolean)}
              min={min}
              max={max}
              imanes={imanes}
              inicial={v}
              control={control}
              onValor={(nv, idle) => { setV(nv); setQuieto(idle) }}
            />
          )}
          <div className="etp-atajos" role="group" aria-label="Ir a un precio">
            {!cadenas.some(c => c.precio === costo) && (
              <button type="button" className="etp-ata" aria-pressed={Math.abs(costo - v) < 1} onClick={() => irA(costo)}>
                <small>te costó</small><b>{fmt(costo)}</b>
              </button>
            )}
            {cadenas.map(c => {
              const logo = fuentePorNombre(c.mayorista)?.logo
              return (
                <button key={c.mayorista} type="button" className="etp-ata" aria-pressed={Math.abs(c.precio - v) < 1} aria-label={`Ir al precio de ${c.mayorista}`} onClick={() => irA(c.precio)}>
                  {logo ? <Image src={logo} alt="" width={54} height={16} unoptimized /> : <small>{c.mayorista}</small>}
                  <b>{fmt(c.precio)}</b>
                  {c.precio === costo && <small>te costó</small>}
                </button>
              )
            })}
          </div>
        </>
      )}

      <button type="button" className={`etp-guardar${yaEnLista ? ' ok' : ''}${guardado ? ' rebota' : ''}`} onClick={guardar} aria-label={yaEnLista ? 'Ya está en tu lista' : 'Guardar en mi lista'}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.5 3.5h3l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2l1.5-6.8H6.2" /><circle cx="10" cy="20" r="1.4" /><circle cx="17.5" cy="20" r="1.4" />
        </svg>
        {yaEnLista ? 'Ya está en tu lista' : 'Guardar en mi lista'}
      </button>
    </section>
  )
}
