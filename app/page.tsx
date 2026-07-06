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
import { ItemLista, Lista, Producto, calcularBombas, productos } from '@/lib/data'

export type Vista = 'inicio' | 'catalogo' | 'detalle' | 'herramientas' | 'perfil' | 'planes'

const uuid = () => (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))

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

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [vistaActiva])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const vista = params.get('vista') as Vista | null
    if (vista) {
      if (vista === 'detalle') {
        const bombas = calcularBombas()
        if (bombas.length > 0) setProductoSeleccionado(bombas[0])
      }
      setVistaActiva(vista)
    }
  }, [])

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
            // Solo mayoristas: si un item viejo quedó con una cadena guardada,
            // acá se corrige solo al mejor mayorista vigente
            const precioMayorista = actual.precios.find(p => p.mayorista === item.mayorista && p.precio > 0 && p.tipoFuente === 'mayorista')
            const mejor = actual.precios.filter(p => p.precio > 0 && p.tipoFuente === 'mayorista').sort((a, b) => a.precio - b.precio)[0]
            const vigente = precioMayorista ?? mejor
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

  const handleBack = () => setVistaActiva(vistaAnterior)

  const handleVerProducto = (producto: Producto, desde: Vista = vistaActiva) => {
    setVistaAnterior(desde)
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
    // La lista es de compra: solo mayoristas (coto es referencia góndola)
    const preciosValidos = producto.precios.filter(p => p.precio > 0 && p.tipoFuente === 'mayorista').sort((a, b) => a.precio - b.precio)
    if (preciosValidos.length === 0) return
    const mejor = preciosValidos[0]
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
      const preciosValidos = producto.precios.filter(p => p.precio > 0 && p.tipoFuente === 'mayorista').sort((a, b) => a.precio - b.precio)
      if (preciosValidos.length === 0) return
      const mejor = preciosValidos[0]
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
        onFavoritos={() => { setFiltroFavoritos(true); navegarA('catalogo', vistaActiva) }}
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
            onCategoria={(sector, sub) => {
              setSectorActivo(sector)
              setSubcategoriaActiva(sub ?? '')
              setFiltroFavoritos(false)
              navegarA('catalogo', vistaActiva)
            }}
          />
        )}
        {/* Main content area */}
        <main ref={mainRef} style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: isNavVisible ? 'var(--bottom-nav-h)' : '0',
        }}>
          {vistaActiva === 'inicio' && (
            <VistaInicio
              onIrACompararConSector={(sector) => {
                setSectorActivo(sector)
                setMayoristaBuscado('')
                setFiltroFavoritos(false)
                navegarA('catalogo', 'inicio')
              }}
              onIrAlCatalogoConMayorista={(mayorista) => {
                setSectorActivo('Todos')
                setMayoristaBuscado(mayorista)
                setFiltroFavoritos(false)
                navegarA('catalogo', 'inicio')
              }}
              onIrAlCatalogo={() => navegarA('catalogo', 'inicio')}
              onVerProducto={(producto) => handleVerProducto(producto, 'inicio')}
              favoritos={favoritos}
              onToggleFavorito={handleToggleFavorito}
              onGuardar={handleAgregarRapido}
            />
          )}

          {vistaActiva === 'catalogo' && (
            <VistaCatalogo
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
            <VistaPlanes onBack={() => navegarA('perfil')} />
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
        onSectorChange={(s) => { setSectorActivo(s); setSubcategoriaActiva(''); setTextoBusqueda(''); setMayoristaBuscado(''); setFiltroFavoritos(false) }}
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
