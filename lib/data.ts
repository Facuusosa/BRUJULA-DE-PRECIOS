// Tipos para los productos y precios
export interface Precio {
  mayorista: string
  precio: number
  tipo: 'lista' | 'oferta'
}

export interface Producto {
  id: string
  nombre: string
  sector: string
  subcategoria: string
  emoji: string
  colorSector: string
  precios: Precio[]
}

export interface ProductoBomba extends Producto {
  precioMinimo: number
  precioMaximo: number
  mayoristaMejorPrecio: string
  ahorroVsMaximo: number
  ahorroEnPlata: number
  tipoMejorPrecio: 'lista' | 'oferta'
}

export interface ItemLista {
  producto: Producto
  mayorista: string
  precioCompra: number
  margen: number
  precioVenta: number
  ganancia: number
}

// Datos mockeados de productos
export const productos: Producto[] = [
  { 
    id: '1', 
    nombre: 'Aceite Cocinero Girasol 1.5L',
    sector: 'Almacén', 
    subcategoria: 'Aceites', 
    emoji: '🛢️',
    colorSector: '#e8f5e9',
    precios: [
      { mayorista: 'Diarco', precio: 4717, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 4480, tipo: 'oferta' },
      { mayorista: 'Yaguar', precio: 5100, tipo: 'lista' }
    ]
  },
  { 
    id: '2', 
    nombre: 'Harina 000 Cañuelas 1kg',
    sector: 'Almacén', 
    subcategoria: 'Harinas', 
    emoji: '🌾',
    colorSector: '#e8f5e9',
    precios: [
      { mayorista: 'Diarco', precio: 1200, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 1150, tipo: 'lista' },
      { mayorista: 'Yaguar', precio: 1300, tipo: 'lista' }
    ]
  },
  { 
    id: '3', 
    nombre: 'Lavandina Ayudín 1L',
    sector: 'Limpieza', 
    subcategoria: 'Lavandina', 
    emoji: '🧹',
    colorSector: '#e3f2fd',
    precios: [
      { mayorista: 'Diarco', precio: 890, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 850, tipo: 'lista' },
      { mayorista: 'Yaguar', precio: 920, tipo: 'lista' }
    ]
  },
  { 
    id: '4', 
    nombre: 'Detergente Magistral 750ml',
    sector: 'Limpieza', 
    subcategoria: 'Detergentes', 
    emoji: '🧴',
    colorSector: '#e3f2fd',
    precios: [
      { mayorista: 'Diarco', precio: 1100, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 1050, tipo: 'oferta' },
      { mayorista: 'Yaguar', precio: 1180, tipo: 'lista' }
    ]
  },
  { 
    id: '5', 
    nombre: 'Gaseosa Coca Cola 2.25L',
    sector: 'Bebidas', 
    subcategoria: 'Gaseosas', 
    emoji: '🥤',
    colorSector: '#fff3e0',
    precios: [
      { mayorista: 'Diarco', precio: 1850, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 1700, tipo: 'lista' },
      { mayorista: 'Yaguar', precio: 1950, tipo: 'lista' }
    ]
  },
  { 
    id: '6', 
    nombre: 'Shampoo Sedal 350ml',
    sector: 'Perfumería', 
    subcategoria: 'Shampoo', 
    emoji: '💆',
    colorSector: '#fce4ec',
    precios: [
      { mayorista: 'Diarco', precio: 1200, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 980, tipo: 'oferta' },
      { mayorista: 'Yaguar', precio: 1150, tipo: 'lista' }
    ]
  },
  { 
    id: '7', 
    nombre: 'Leche La Serenísima 1L',
    sector: 'Frescos', 
    subcategoria: 'Lácteos', 
    emoji: '🥛',
    colorSector: '#f3e5f5',
    precios: [
      { mayorista: 'Diarco', precio: 920, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 880, tipo: 'lista' },
      { mayorista: 'Yaguar', precio: 950, tipo: 'lista' }
    ]
  },
  { 
    id: '8', 
    nombre: 'Azúcar Ledesma 1kg',
    sector: 'Almacén', 
    subcategoria: 'Azúcar', 
    emoji: '🍬',
    colorSector: '#e8f5e9',
    precios: [
      { mayorista: 'Diarco', precio: 950, tipo: 'lista' },
      { mayorista: 'Maxiconsumo', precio: 900, tipo: 'lista' },
      { mayorista: 'Yaguar', precio: 980, tipo: 'lista' }
    ]
  }
]

// Sectores con sus colores e íconos
export const sectores = [
  { nombre: 'Almacén', emoji: '🏪', color: '#e8f5e9', subcategorias: ['Aceites', 'Harinas', 'Azúcar', 'Arroz', 'Fideos'] },
  { nombre: 'Limpieza', emoji: '🧹', color: '#e3f2fd', subcategorias: ['Lavandina', 'Detergentes', 'Desinfectantes'] },
  { nombre: 'Bebidas', emoji: '🥤', color: '#fff3e0', subcategorias: ['Gaseosas', 'Aguas', 'Jugos'] },
  { nombre: 'Perfumería', emoji: '💆', color: '#fce4ec', subcategorias: ['Shampoo', 'Jabones', 'Cremas'] },
  { nombre: 'Frescos', emoji: '🥛', color: '#f3e5f5', subcategorias: ['Lácteos', 'Fiambres', 'Quesos'] },
]

// Función para calcular las bombas del día
export function calcularBombas(): ProductoBomba[] {
  return productos.map(p => {
    const precios = p.precios.map(x => x.precio)
    const min = Math.min(...precios)
    const max = Math.max(...precios)
    const ganador = p.precios.find(x => x.precio === min)!
    return {
      ...p,
      precioMinimo: min,
      precioMaximo: max,
      mayoristaMejorPrecio: ganador.mayorista,
      ahorroVsMaximo: Math.round(((max - min) / max) * 100),
      ahorroEnPlata: max - min,
      tipoMejorPrecio: ganador.tipo
    }
  })
  .filter(b => b.ahorroVsMaximo > 3)
  .sort((a, b) => b.ahorroVsMaximo - a.ahorroVsMaximo)
  .slice(0, 5)
}

// Función para calcular el ahorro total potencial
export function calcularAhorroTotal(): number {
  const bombas = calcularBombas()
  return bombas.reduce((acc, b) => acc + b.ahorroEnPlata, 0) * 100 // Multiplicamos para simular volumen
}

// Cambios recientes simulados
export const cambiosRecientes = [
  { producto: 'Aceite Cocinero 1.5L', mayorista: 'Maxiconsumo', cambio: -5, fecha: 'Hace 2h' },
  { producto: 'Harina Cañuelas 1kg', mayorista: 'Yaguar', cambio: 3, fecha: 'Hace 4h' },
  { producto: 'Coca Cola 2.25L', mayorista: 'Diarco', cambio: -2, fecha: 'Hace 6h' },
]

// Formatear precio en pesos argentinos
export function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}
