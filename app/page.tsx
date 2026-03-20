'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { BottomNav, Vista } from '@/components/bottom-nav'
import { VistaInicio } from '@/components/vista-inicio'
import { VistaComparar } from '@/components/vista-comparar'
import { VistaLista } from '@/components/vista-lista'
import { VistaCuenta } from '@/components/vista-cuenta'
import { ItemLista, Producto } from '@/lib/data'

// App principal de Brújula Mayorista
export default function BrujulaMayorista() {
  const [vistaActiva, setVistaActiva] = useState<Vista>('inicio')
  const [listaGuardados, setListaGuardados] = useState<ItemLista[]>([])
  const [sectorInicial, setSectorInicial] = useState<string>('Almacén')
  
  const handleGuardarEnLista = (data: {
    producto: Producto
    mayorista: string
    precioCompra: number
    margen: number
    precioVenta: number
    ganancia: number
  }) => {
    const nuevoItem: ItemLista = {
      producto: data.producto,
      mayorista: data.mayorista,
      precioCompra: data.precioCompra,
      margen: data.margen,
      precioVenta: data.precioVenta,
      ganancia: data.ganancia
    }
    setListaGuardados(prev => [...prev, nuevoItem])
  }
  
  const handleEliminar = (index: number) => {
    setListaGuardados(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleIrAComparar = () => setVistaActiva('comparar')
  const handleSelectBomba = () => { /* Abrir modal sin cambiar de vista */ }
  const handleIrAComporarConSector = (sector: string) => {
    setSectorInicial(sector)
    setVistaActiva('comparar')
  }
  
  return (
    <main className="min-h-screen bg-[#f7f9fb]">
      {/* Header fijo */}
      <Header />

      {/* Contenido según vista activa */}
      {vistaActiva === 'inicio' && (
        <VistaInicio 
          onSelectBomba={handleSelectBomba} 
          onIrAComparарConSector={handleIrAComporarConSector}
          onGuardarEnLista={handleGuardarEnLista}
        />
      )}

      {vistaActiva === 'comparar' && (
        <VistaComparar onGuardarEnLista={handleGuardarEnLista} sectorInicial={sectorInicial} />
      )}

      {vistaActiva === 'lista' && (
        <VistaLista
          items={listaGuardados}
          onEliminar={handleEliminar}
          onIrAComparar={handleIrAComparar}
        />
      )}

      {vistaActiva === 'cuenta' && (
        <VistaCuenta />
      )}

      {/* Navegación inferior */}
      <BottomNav vistaActiva={vistaActiva} onChange={setVistaActiva} />
    </main>
  )
}
