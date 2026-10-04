'use client'

import { useState, useEffect, useRef } from 'react'
import { AppHeader } from '@/components/header'
import { CategoryDrawer } from '@/components/category-drawer'
import { DesktopSidebar } from '@/components/desktop-sidebar'
import { BottomNav } from '@/components/bottom-nav'
import { VistaInicio } from '@/components/vista-inicio'
import { VistaCatalogo } from '@/components/vista-catalogo'
import { VistaDetalle } from '@/components/vista-detalle'
import { VistaLista } from '@/components/vista-lista'
import { VistaCuenta } from '@/components/vista-cuenta'
import { VistaPlanes } from '@/components/vista-planes'
import { ItemLista, Lista, Producto, calcularBombas, productos, mejorPrecioEnAmbito } from '@/lib/data'

export type Vista = 'inicio' | 'catalogo' | 'detalle' | 'herramientas' | 'perfil' | 'planes'
const VISTAS: Vista[] = ['inicio', 'catalogo', 'detalle', 'herramientas', 'perfil', 'planes']

const uuid = () => (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))

// Cada pantalla tiene su URL: el "atrás" del celu/navegador vuelve a la pantalla
// anterior en vez de sacar al usuario del sitio, y recargar no lo tira al Inicio
const urlDe = (vista: Vista, productoId?: string) =>
  vista === 'inicio' ? '/'
    : vista === 'detalle' && productoId ? `/?vista=detalle&p=${encodeURIComponent(productoId)}`
    : `/?vista=${vista}`

const leerUrl = (): { vista: Vista; producto: Producto | null } => {
  const params = new URLSearchParams(window.location.search)
  const v = params.get('vista') as Vista | null
  const vista = v && VISTAS.includes(v) ? v : 'inicio'
  const pid = params.get('p')
  const producto = vista === 'detalle' ? (pid && productos.find(p => p.id === pid)) || calcularBombas()[0] || null : null
  return { vista: vista === 'detalle' && !producto ? 'inicio' : vista, producto }
}

export default function BrujulaMayorista() {
  const [vistaActiva, setVistaActiva] = useState<Vista>('inicio')
  const [vistaAnterior, setVistaAnterior] = useState<Vista>('inicio')
  const [listas, setListas] = useState<Lista[]>([])
  const [listaActivaId, setListaActivaId] = useState<string | null>(null)
  const [sheetLista, setSheetLista] = useState<{ nombreProducto: string; onConfirmar: (listaId: string) => void } | null>(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [sectorActivo, setSectorActivo] = useState<string>('Todos')
  const [mayoristaBuscado, setMayoristaBuscado] = useState<string>('')
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
  const [filtroFavoritos, setFiltroFavoritos] = useState(false)
  const [textoBusqueda, setTextoBusqueda] = useState<string>('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [subcategoriaActiva, setSubcategoriaActiva] = useState<string>('')
  const mainRef = useRef<HTMLDivElement>(null)
  // El catálogo NO se desmonta al abrir un producto (queda oculto): así al volver
  // conserva búsqueda, filtros y página. La key se incrementa solo cuando se entra
  // con un filtro nuevo (categoría, mayorista, favoritos) para arrancarlo limpio.
  const [catalogoKey, setCatalogoKey] = useState(0)
  const [catalogoVisitado, setCatalogoVisitado] = useState(false)
  // Historial propio: idx > 0 = hay una pantalla nuestra atrás (el Volver usa history.back)
  const histIdx = useRef(0)
  const histIniciado = useRef(false)
  const scrolls = useRef<Record<string, number>>({})
  const scrollARestaurar = useRef<number | null>(null)

  useEffect(() => {
    if (vistaActiva === 'catalogo') setCatalogoVisitado(true)
  }, [vistaActiva])

  // Al volver con "atrás" se restaura el scroll que tenía esa pantalla; si no, arriba de todo
  // (también al cambiar de producto dentro del detalle: sin esto se aterrizaba al final de la ficha nueva)
  useEffect(() => {
    mainRef.current?.scrollTo({ top: scrollARestaurar.current ?? 0, behavior: 'instant' })
    scrollARestaurar.current = null
  }, [vistaActiva, productoSeleccionado?.id])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // Link compartido de un producto (?q=nombre): abre el catálogo ya buscado
    const q = params.get('q')
    if (q) {
      setTextoBusqueda(q)
      setVistaActiva('catalogo')
      return
    }
    const { vista, producto } = leerUrl()
    if (producto) setProductoSeleccionado(producto)
    setVistaActiva(vista)
  }, [])

  useEffect(() => {
    const url = urlDe(vistaActiva, productoSeleccionado?.id)
    // Primer render con ?vista=/?q= en la URL: esperar a que el efecto de arriba la lea
    if (!histIniciado.current && window.location.search && vistaActiva === 'inicio') return
    if (!histIniciado.current) {
      histIniciado.current = true
      // Si la URL ya es la correcta no tocar el history: en el primer render Next todavía no
      // guardó su estado interno (__NA) y pisarlo hace que el "atrás" recargue la página entera
      if (window.location.pathname + window.location.search !== url) window.history.replaceState({ idx: 0 }, '', url)
      return
    }
    // Llegamos acá por un popstate: la URL ya es la de esta pantalla, no apilar otra
    if (window.location.pathname + window.location.search === url) return
    histIdx.current += 1
    window.history.pushState({ idx: histIdx.current }, '', url)
  }, [vistaActiva, productoSeleccionado?.id])

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const { vista, producto } = leerUrl()
      histIdx.current = (e.state as { idx?: number } | null)?.idx ?? 0
      scrollARestaurar.current = scrolls.current[urlDe(vista, producto?.id)] ?? 0
      if (producto) setProductoSeleccionado(producto)
      setVistaActiva(vista)
      setDrawerOpen(false)
      setSheetLista(null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // textoBusqueda solo sirve para que el catálogo arranque con ese texto (volver de un detalle o link
  // compartido); se limpia apenas se monta para que otras entradas al catálogo arranquen sin búsqueda
  useEffect(() => {
    if (vistaActiva === 'catalogo' && textoBusqueda) setTextoBusqueda('')
  }, [vistaActiva, textoBusqueda])

  useEffect(() => {
    const saved = localStorage.getItem('brujula_listas')
    if (saved) {
      try {
        const parsed: Lista[] = JSON.parse(saved)
        // Consolidar duplicados legacy: un producto → un item con cantidad sumada
        const consolidadas = parsed.map(lista => {
          const vistos: ItemLista[] = []
          for (const item of lista.items) {
            const idx = vistos.findIndex(i => i.producto.id === item.producto.id)
            if (idx >= 0) {
              vistos[idx] = { ...vistos[idx], cantidad: (vistos[idx].cantidad ?? 1) + (item.cantidad ?? 1) }
            } else {
              vistos.push({ ...item, cantidad: item.cantidad ?? 1 })
            }
          }
          // Rehidratar con el catálogo del día: el snapshot guardado queda con precios
          // viejos cuando el cron actualiza el catálogo — los cálculos darían números stale
          const refrescados = vistos.map(item => {
            const actual = productos.find(p => p.id === item.producto.id)
            if (!actual) return item
            // Preferir la misma fuente que tenía guardada (mayorista o cadena —
            // vista-detalle permite guardar cualquiera); si ya no tiene precio
            // vigente, caer al mejor precio disponible de cualquier fuente.
            const precioMismaFuente = actual.precios.find(p => p.mayorista === item.mayorista && p.precio > 0)
            const vigente = precioMismaFuente ?? mejorPrecioEnAmbito(actual, 'todos')
            return vigente
              ? { ...item, producto: actual, mayorista: vigente.mayorista, precioCompra: vigente.precio }
              : { ...item, producto: actual }
          })
          return { ...lista, items: refrescados }
        })
        setListas(consolidadas)
        if (consolidadas.length > 0) {
          const savedActivaId = localStorage.getItem('brujula_lista_activa')
          const idValido = consolidadas.find(l => l.id === savedActivaId)?.id ?? consolidadas[0].id
          setListaActivaId(idValido)
        }
      } catch {
        // ignore invalid localStorage data
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('brujula_listas', JSON.stringify(listas))
  }, [listas])

  useEffect(() => {
    const saved = localStorage.getItem('brujula_favoritos')
    if (saved) {
      try {
        setFavoritos(new Set(JSON.parse(saved) as string[]))
      } catch {
        // ignore invalid localStorage data
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('brujula_favoritos', JSON.stringify([...favoritos]))
  }, [favoritos])

  useEffect(() => {
    if (listaActivaId !== null) {
      localStorage.setItem('brujula_lista_activa', listaActivaId)
    }
  }, [listaActivaId])

  const listaActiva = listas.find(l => l.id === listaActivaId) ?? null
  const itemsActivos = listaActiva?.items ?? []

  const navegarA = (vista: Vista, desde?: Vista) => {
    if (desde) setVistaAnterior(desde)
    setVistaActiva(vista)
  }

  // Volver = mismo efecto que el "atrás" del celu; sin historial propio (entró por un link) cae al fallback
  const volver = (fallback: () => void) => {
    if (histIdx.current > 0) window.history.back()
    else fallback()
  }

  const handleBack = () => volver(() => setVistaActiva(vistaAnterior))

  const abrirCatalogoNuevo = (f: { sector?: string; sub?: string; mayorista?: string; favoritos?: boolean }) => {
    setSectorActivo(f.sector ?? 'Todos')
    setSubcategoriaActiva(f.sub ?? '')
    setMayoristaBuscado(f.mayorista ?? '')
    setFiltroFavoritos(f.favoritos ?? false)
    setTextoBusqueda('')
    setCatalogoKey(k => k + 1)
    navegarA('catalogo', vistaActiva)
  }

  const handleVerProducto = (producto: Producto, desde: Vista = vistaActiva) => {
    // Desde un relacionado (detalle → detalle) se conserva el origen; si no, Volver no hacía nada
    if (desde !== 'detalle') setVistaAnterior(desde)
    setProductoSeleccionado(producto)
    setVistaActiva('detalle')
  }

  const handleToggleFavorito = (productoId: string) => {
    setFavoritos(prev => {
      const next = new Set(prev)
      next.has(productoId) ? next.delete(productoId) : next.add(productoId)
      return next
    })
  }

  const handleCrearLista = (nombre: string) => {
    const nueva: Lista = { id: uuid(), nombre, items: [], creadaEn: new Date().toISOString() }
    setListas(prev => [...prev, nueva])
    setListaActivaId(nueva.id)
  }

  const handleRenombrarLista = (id: string, nombre: string) => {
    setListas(prev => prev.map(l => l.id === id ? { ...l, nombre } : l))
  }

  const handleEliminarLista = (id: string) => {
    setListas(prev => {
      const next = prev.filter(l => l.id !== id)
      if (listaActivaId === id) setListaActivaId(next[0]?.id ?? null)
      return next
    })
  }

  const handleGuardarEnLista = (data: {
    producto: Producto
    mayorista: string
    precioCompra: number
    margen: number
    precioVenta: number
    ganancia: number
  }) => {
    const item: ItemLista = { ...data, cantidad: 1 }
    const agregarALista = (listaId: string) => {
      setListas(prev => prev.map(l => {
        if (l.id !== listaId) return l
        const existe = l.items.findIndex(i => i.producto.id === data.producto.id)
        if (existe >= 0) {
          const next = [...l.items]
          next[existe] = { ...next[existe], cantidad: (next[existe].cantidad ?? 1) + 1 }
          return { ...l, items: next }
        }
        return { ...l, items: [...l.items, item] }
      }))
      setListaActivaId(listaId)
      navegarA('herramientas', vistaActiva)
    }
    if (listas.length === 0) {
      const nueva: Lista = { id: uuid(), nombre: 'Mi lista', items: [item], creadaEn: new Date().toISOString() }
      setListas(prev => [...prev, nueva])
      setListaActivaId(nueva.id)
      navegarA('herramientas', vistaActiva)
      return
    }
    if (listas.length === 1) {
      agregarALista(listas[0].id)
      return
    }
    setSheetLista({ nombreProducto: data.producto.nombre, onConfirmar: agregarALista })
  }

  const agregarItemALista = (producto: Producto, listaId: string) => {
    // "Agregar rápido" desde el catálogo guarda siempre el mejor mayorista —
    // el ámbito de visualización (Más barato/Mayoristas/Cadenas) se elige después,
    // dentro de Mi Lista, sin depender de con qué fuente se agregó el item.
    const mejor = mejorPrecioEnAmbito(producto, 'mayorista')
    if (!mejor) return
    const item: ItemLista = { producto, mayorista: mejor.mayorista, precioCompra: mejor.precio, margen: 0, precioVenta: 0, ganancia: 0, cantidad: 1 }
    setListas(prev => prev.map(l => {
      if (l.id !== listaId) return l
      const existe = l.items.findIndex(i => i.producto.id === producto.id)
      if (existe >= 0) {
        const next = [...l.items]
        next[existe] = { ...next[existe], cantidad: (next[existe].cantidad ?? 1) + 1 }
        return { ...l, items: next }
      }
      return { ...l, items: [...l.items, item] }
    }))
    setListaActivaId(listaId)
  }

  const handleAgregarRapido = (producto: Producto) => {
    if (listas.length === 0) {
      const mejor = mejorPrecioEnAmbito(producto, 'mayorista')
      if (!mejor) return
      const item: ItemLista = { producto, mayorista: mejor.mayorista, precioCompra: mejor.precio, margen: 0, precioVenta: 0, ganancia: 0 }
      const nueva: Lista = { id: uuid(), nombre: 'Mi lista', items: [item], creadaEn: new Date().toISOString() }
      setListas(prev => [...prev, nueva])
      setListaActivaId(nueva.id)
      return
    }
    if (listas.length === 1) {
      agregarItemALista(producto, listas[0].id)
      return
    }
    setSheetLista({ nombreProducto: producto.nombre, onConfirmar: (listaId) => { agregarItemALista(producto, listaId); setSheetLista(null) } })
  }

  const handleEliminar = (index: number) => {
    setListas(prev => prev.map(l => l.id === listaActivaId ? { ...l, items: l.items.filter((_, i) => i !== index) } : l))
  }

  const handleCambiarCantidad = (index: number, cantidad: number) => {
    setListas(prev => prev.map(l => {
      if (l.id !== listaActivaId) return l
      const next = [...l.items]
      next[index] = { ...next[index], cantidad }
      return { ...l, items: next }
    }))
  }

  const isDrillDown = vistaActiva === 'detalle' || vistaActiva === 'planes'
  const isNavVisible = !isDrillDown

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#ffffff' }}>
      {/* Header — siempre visible */}
      <AppHeader
        onSearchClick={() => navegarA('catalogo', vistaActiva)}
        onPerfil={() => navegarA('perfil', vistaActiva)}
        onFavoritos={() => abrirCatalogoNuevo({ favoritos: true })}
        onMenuClick={() => setDrawerOpen(true)}
        onLogoClick={() => navegarA('inicio')}
      />

      {/* Contenido principal */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar desktop persistente */}
        {isNavVisible && (
          <DesktopSidebar
            vistaActiva={vistaActiva}
            sectorActivo={sectorActivo}
            subcategoriaActiva={subcategoriaActiva}
            onChange={(v) => navegarA(v)}
            onCategoria={(sector, sub) => abrirCatalogoNuevo({ sector, sub })}
          />
        )}
        {/* Main content area */}
        <main ref={mainRef} onScroll={(e) => { scrolls.current[urlDe(vistaActiva, productoSeleccionado?.id)] = e.currentTarget.scrollTop }} style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: isNavVisible ? 'var(--bottom-nav-h)' : '0',
        }}>
          {vistaActiva === 'inicio' && (
            <VistaInicio
              onIrACompararConSector={(sector) => abrirCatalogoNuevo({ sector })}
              onIrAlCatalogoConMayorista={(mayorista) => abrirCatalogoNuevo({ mayorista })}
              onIrAlCatalogo={() => navegarA('catalogo', 'inicio')}
              onVerProducto={(producto) => handleVerProducto(producto, 'inicio')}
              favoritos={favoritos}
              onToggleFavorito={handleToggleFavorito}
              onGuardar={handleAgregarRapido}
              esNuevo={listas.length === 0}
            />
          )}

          {(catalogoVisitado || vistaActiva === 'catalogo') && (
            <div hidden={vistaActiva !== 'catalogo'}>
            <VistaCatalogo
              key={catalogoKey}
              sectorActivo={sectorActivo}
              mayoristaBuscado={mayoristaBuscado}
              textoBusquedaInicial={textoBusqueda}
              subcategoriaActiva={subcategoriaActiva}
              onVerProducto={(producto) => handleVerProducto(producto, 'catalogo')}
              favoritos={favoritos}
              onToggleFavorito={handleToggleFavorito}
              soloFavoritos={filtroFavoritos}
              onSoloFavoritosChange={setFiltroFavoritos}
              onSectorChange={(s) => { setSectorActivo(s); setSubcategoriaActiva('') }}
              onSubcategoriaChange={setSubcategoriaActiva}
              onAgregarALista={handleAgregarRapido}
              listaIds={new Set(itemsActivos.map(i => i.producto.id))}
            />
            </div>
          )}

          {vistaActiva === 'detalle' && productoSeleccionado && (
            <VistaDetalle
              producto={productoSeleccionado}
              onBack={handleBack}
              onGuardar={handleGuardarEnLista}
              onVerComparativa={() => {}}
              esFavorito={favoritos.has(productoSeleccionado.id)}
              onToggleFavorito={() => handleToggleFavorito(productoSeleccionado.id)}
              onVerProducto={(producto) => handleVerProducto(producto, 'detalle')}
              enLista={itemsActivos.some((i) => i.producto.id === productoSeleccionado.id)}
            />
          )}

          {vistaActiva === 'herramientas' && (
            <VistaLista
              listas={listas}
              listaActivaId={listaActivaId}
              onSeleccionarLista={setListaActivaId}
              onCrearLista={handleCrearLista}
              onRenombrarLista={handleRenombrarLista}
              onEliminarLista={handleEliminarLista}
              onEliminarItem={handleEliminar}
              onCambiarCantidad={handleCambiarCantidad}
              onIrAComparar={() => navegarA('catalogo', 'herramientas')}
            />
          )}

          {vistaActiva === 'perfil' && (
            <VistaCuenta onIrAPlanes={() => navegarA('planes', 'perfil')} />
          )}

          {vistaActiva === 'planes' && (
            <VistaPlanes onBack={() => volver(() => navegarA('perfil'))} />
          )}
        </main>
      </div>

      {/* Bottom nav — solo mobile, solo cuando no es drill-down */}
      {isNavVisible && (
        <BottomNav vistaActiva={vistaActiva} onChange={(v) => navegarA(v)} listaCount={itemsActivos.length} />
      )}

      {/* Drawer de categorías — hamburguesa, mobile y desktop */}
      <CategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSectorChange={(s) => { setSectorActivo(s); setSubcategoriaActiva(''); setTextoBusqueda(''); setMayoristaBuscado(''); setFiltroFavoritos(false); setCatalogoKey(k => k + 1) }}
        onSubcategoriaChange={setSubcategoriaActiva}
        onNavegar={(v) => navegarA(v, vistaActiva)}
      />

      {/* Selector de lista — aparece cuando hay múltiples listas y el usuario toca + */}
      {sheetLista !== null && (
        <>
          <div
            onClick={() => setSheetLista(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.4)', zIndex: 300 }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 301,
            background: '#ffffff', borderRadius: '20px 20px 0 0',
            padding: '24px 20px 36px', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
          }}>
            <p style={{ fontSize: '10.7px', fontWeight: 600, color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 6px' }}>
              Agregar a
            </p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sheetLista.nombreProducto}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {listas.map(lista => (
                <button
                  key={lista.id}
                  onClick={() => sheetLista.onConfirmar(lista.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: lista.id === listaActivaId ? 'var(--plate)' : '#ffffff',
                    border: `1.5px solid ${lista.id === listaActivaId ? 'var(--ink)' : 'var(--line)'}`,
                    borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{lista.nombre}</span>
                  <span className="tnum" style={{ fontSize: '12px', color: 'var(--gray)' }}>{lista.items.length} productos</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
