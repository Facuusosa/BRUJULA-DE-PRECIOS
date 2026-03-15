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
  
  // Manejar cuando se guarda un producto desde la calculadora
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
  
  // Eliminar de la lista
  const handleEliminar = (index: number) => {
    setListaGuardados(prev => prev.filter((_, i) => i !== index))
  }
  
  // Navegar a comparar desde la lista vacía
  const handleIrAComparar = () => {
    setVistaActiva('comparar')
  }
  
  // Cuando se selecciona una bomba, ir a comparar
  const handleSelectBomba = () => {
    setVistaActiva('comparar')
  }
  
  return (
    <main className="min-h-screen" style={{ backgroundColor: '#f7f9fb' }}>
      {/* Header fijo */}
      <Header />
      
      {/* Contenido según vista activa */}
      {vistaActiva === 'inicio' && (
        <VistaInicio onSelectBomba={handleSelectBomba} />
      )}
      
      {vistaActiva === 'comparar' && (
        <VistaComparar onGuardarEnLista={handleGuardarEnLista} />
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
