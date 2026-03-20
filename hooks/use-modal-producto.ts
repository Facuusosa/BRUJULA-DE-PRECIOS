'use client'

import { useState, useCallback } from 'react'
import { Producto } from '@/lib/data'

export interface ClickOrigin {
  x: number
  y: number
}

export function useModalProducto() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [origen, setOrigen] = useState<ClickOrigin>({ x: 0, y: 0 })

  const openModal = useCallback((producto: Producto, e: React.MouseEvent) => {
    // Captura la posición exacta del click o el centro del elemento si es teclado
    const rect = e.currentTarget.getBoundingClientRect()
    setOrigen({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    })
    setSelectedProduct(producto)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    // No limpiamos el producto ni el origen inmediatamente para permitir la animación de salida
  }, [])

  return {
    isOpen,
    selectedProduct,
    origen,
    openModal,
    closeModal
  }
}
