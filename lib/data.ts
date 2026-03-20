import outputMaxiconsumo from '../data/output_maxiconsumo.json'
import outputYaguar from '../data/output_yaguar.json'

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
  imageUrl?: string
  disponible?: boolean
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

// Mapa de query del scraper → sector, subcategoria, emoji, colorSector
const queryMap: Record<string, { sector: string; subcategoria: string; emoji: string; colorSector: string }> = {
  // Almacén
  aceite:       { sector: 'Almacén',    subcategoria: 'Aceites',         emoji: '🛢️',  colorSector: '#e8f5e9' },
  condimento:   { sector: 'Almacén',    subcategoria: 'Condimentos',     emoji: '🧂',  colorSector: '#e8f5e9' },
  arroz:        { sector: 'Almacén',    subcategoria: 'Arroz',           emoji: '🍚',  colorSector: '#e8f5e9' },
  cacao:        { sector: 'Almacén',    subcategoria: 'Cacao y Café',    emoji: '🍫',  colorSector: '#e8f5e9' },
  caldos:       { sector: 'Almacén',    subcategoria: 'Caldos y Sopas',  emoji: '🍲',  colorSector: '#e8f5e9' },
  cereales:     { sector: 'Almacén',    subcategoria: 'Cereales',        emoji: '🌾',  colorSector: '#e8f5e9' },
  conservas:    { sector: 'Almacén',    subcategoria: 'Conservas',       emoji: '🥫',  colorSector: '#e8f5e9' },
  dulces:       { sector: 'Almacén',    subcategoria: 'Dulces',          emoji: '🍯',  colorSector: '#e8f5e9' },
  encurtidos:   { sector: 'Almacén',    subcategoria: 'Encurtidos',      emoji: '🫙',  colorSector: '#e8f5e9' },
  azucar:       { sector: 'Almacén',    subcategoria: 'Azúcar',          emoji: '🍬',  colorSector: '#e8f5e9' },
  fiestas:      { sector: 'Almacén',    subcategoria: 'Fiestas',         emoji: '🎉',  colorSector: '#e8f5e9' },
  frutas:       { sector: 'Almacén',    subcategoria: 'Frutas',          emoji: '🍎',  colorSector: '#e8f5e9' },
  galletitas:   { sector: 'Almacén',    subcategoria: 'Galletitas',      emoji: '🍪',  colorSector: '#e8f5e9' },
  harina:       { sector: 'Almacén',    subcategoria: 'Harinas',         emoji: '🌾',  colorSector: '#e8f5e9' },
  ' infusion':  { sector: 'Almacén',    subcategoria: 'Infusiones',      emoji: '🍵',  colorSector: '#e8f5e9' },
  ' te ':       { sector: 'Almacén',    subcategoria: 'Infusiones',      emoji: '🍵',  colorSector: '#e8f5e9' },
  fideos:       { sector: 'Almacén',    subcategoria: 'Pastas',          emoji: '🍝',  colorSector: '#e8f5e9' },
  'pasta seca': { sector: 'Almacén',    subcategoria: 'Pastas',          emoji: '🍝',  colorSector: '#e8f5e9' },
  polenta:      { sector: 'Almacén',    subcategoria: 'Polenta',         emoji: '🌽',  colorSector: '#e8f5e9' },
  snacks:       { sector: 'Almacén',    subcategoria: 'Snacks',          emoji: '🍿',  colorSector: '#e8f5e9' },
  yerba:        { sector: 'Almacén',    subcategoria: 'Yerba',           emoji: '🧉',  colorSector: '#e8f5e9' },
  // Bebidas
  agua:         { sector: 'Bebidas',    subcategoria: 'Aguas',           emoji: '💧',  colorSector: '#fff3e0' },
  isotonica:    { sector: 'Bebidas',    subcategoria: 'Isotónicas',      emoji: '⚡',  colorSector: '#fff3e0' },
  cerveza:      { sector: 'Bebidas',    subcategoria: 'Cervezas',        emoji: '🍺',  colorSector: '#fff3e0' },
  gaseosa:      { sector: 'Bebidas',    subcategoria: 'Gaseosas',        emoji: '🥤',  colorSector: '#fff3e0' },
  jugo:         { sector: 'Bebidas',    subcategoria: 'Jugos',           emoji: '🍹',  colorSector: '#fff3e0' },
  vino:         { sector: 'Bebidas',    subcategoria: 'Vinos',           emoji: '🍷',  colorSector: '#fff3e0' },
  // Frescos
  leche:        { sector: 'Frescos',    subcategoria: 'Lácteos',         emoji: '🥛',  colorSector: '#f3e5f5' },
  queso:        { sector: 'Frescos',    subcategoria: 'Quesos',          emoji: '🧀',  colorSector: '#f3e5f5' },
  yogur:        { sector: 'Frescos',    subcategoria: 'Yogur',           emoji: '🍶',  colorSector: '#f3e5f5' },
  manteca:      { sector: 'Frescos',    subcategoria: 'Manteca',         emoji: '🧈',  colorSector: '#f3e5f5' },
  'crema de leche': { sector: 'Frescos', subcategoria: 'Cremas',       emoji: '🥛',  colorSector: '#f3e5f5' },
  // Limpieza
  desinfectante:{ sector: 'Limpieza',   subcategoria: 'Desinfectantes',  emoji: '🧪',  colorSector: '#e3f2fd' },
  detergente:   { sector: 'Limpieza',   subcategoria: 'Detergentes',     emoji: '🧼',  colorSector: '#e3f2fd' },
  lavandina:    { sector: 'Limpieza',   subcategoria: 'Lavandina',       emoji: '🧴',  colorSector: '#e3f2fd' },
  limpiador:    { sector: 'Limpieza',   subcategoria: 'Limpiadores',     emoji: '🫧',  colorSector: '#e3f2fd' },
  suavizante:   { sector: 'Limpieza',   subcategoria: 'Suavizantes',     emoji: '🌸',  colorSector: '#e3f2fd' },
  // Perfumería / Higiene
  shampoo:      { sector: 'Perfumería', subcategoria: 'Shampoo',         emoji: '💆',  colorSector: '#fce4ec' },
  jabon:        { sector: 'Perfumería', subcategoria: 'Jabones',         emoji: '🧴',  colorSector: '#fce4ec' },
  desodorante:  { sector: 'Perfumería', subcategoria: 'Desodorantes',    emoji: '💨',  colorSector: '#fce4ec' },
  antitranspirante: { sector: 'Perfumería', subcategoria: 'Desodorantes', emoji: '💨', colorSector: '#fce4ec' },
  'pañal':      { sector: 'Perfumería', subcategoria: 'Pañales',         emoji: '👶',  colorSector: '#fce4ec' },
  'papel higienico': { sector: 'Perfumería', subcategoria: 'Papel',      emoji: '🧻',  colorSector: '#fce4ec' },
  hisopo:       { sector: 'Perfumería', subcategoria: 'Higiene',         emoji: '👂',  colorSector: '#fce4ec' },
  'crema corporal': { sector: 'Perfumería', subcategoria: 'Cremas',      emoji: '🧴',  colorSector: '#fce4ec' },
  dermo:        { sector: 'Perfumería', subcategoria: 'Cremas',          emoji: '🧴',  colorSector: '#fce4ec' },
  bucal:        { sector: 'Perfumería', subcategoria: 'Higiene',         emoji: '🪥',  colorSector: '#fce4ec' },
  'pasta dental': { sector: 'Perfumería', subcategoria: 'Higiene',       emoji: '🪥',  colorSector: '#fce4ec' },
}


// Datos reales de Maxiconsumo + Simulados para la comparativa
// El scraper nuevo guarda item.sector directamente; el viejo usa item.query
const sectorColorMap: Record<string, { color: string; emoji: string }> = {
  'Almacén':    { color: '#e8f5e9', emoji: '🛒' },
  'Bebidas':    { color: '#fff3e0', emoji: '🥤' },
  'Frescos':    { color: '#f3e5f5', emoji: '🥛' },
  'Limpieza':   { color: '#e3f2fd', emoji: '🧼' },
  'Perfumería': { color: '#fce4ec', emoji: '💆' },
  'Mascotas':    { color: '#fff9c4', emoji: '🐾' },
  'Hogar y Bazar': { color: '#f1f8e9', emoji: '🏠' },
  'Electro':     { color: '#e0f7fa', emoji: '🔌' },
}

// Normalización de nombres para matching (Quitamos espacios y acentos para máxima coincidencia)
const normalizarNombre = (n: string) => n.toUpperCase().trim()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/\s+/g, '')

// Unificar productos por nombre
const unifiedProductsMap = new Map<string, any>()

// Primero cargamos Maxiconsumo
;(outputMaxiconsumo as any[]).forEach(item => {
  if (item.precio <= 0) return
  const norm = normalizarNombre(item.nombre)
  unifiedProductsMap.set(norm, {
    ...item,
    precios: [{ mayorista: 'Maxiconsumo', precio: item.precio, tipo: 'lista' }]
  })
})

// Luego agregamos/actualizamos con Yaguar (solo si mejora el precio o no está)
;(outputYaguar as any[]).forEach(item => {
  if (item.precio <= 0) return
  const norm = normalizarNombre(item.nombre)
  
  if (unifiedProductsMap.has(norm)) {
    const p = unifiedProductsMap.get(norm)
    // Buscamos si ya tiene un precio de Yaguar
    const precioExistente = p.precios.find((x: any) => x.mayorista === 'Yaguar')
    
    if (precioExistente) {
      // Si ya tiene Yaguar, nos quedamos con el más barato
      if (item.precio < precioExistente.precio) {
        precioExistente.precio = item.precio
      }
    } else {
      // Si no tenía Yaguar, lo agregamos
      p.precios.push({ mayorista: 'Yaguar', precio: item.precio, tipo: 'lista' })
    }
  } else {
    // Si no está en Maxiconsumo, lo agregamos como nuevo
    unifiedProductsMap.set(norm, {
      ...item,
      precios: [{ mayorista: 'Yaguar', precio: item.precio, tipo: 'lista' }]
    })
  }
})

export const productos: Producto[] = Array.from(unifiedProductsMap.values())
  .map((item: any) => {
    // Intentar obtener meta por query directo primero
    let meta = queryMap[item.query?.toLowerCase()]
    
    // Si no hay meta o el query es genérico, buscar palabras clave en el nombre
    if (!meta || ['almacen', 'bebidas', 'frescos', 'limpieza', 'perfumeria', 'perfumería'].includes(item.query?.toLowerCase())) {
      const nombreLower = ` ${item.nombre.toLowerCase()} `
      const matches = Object.entries(queryMap)
        .filter(([key]) => nombreLower.includes(key))
        .sort((a, b) => b[0].length - a[0].length)
      
      if (matches.length > 0) {
        meta = matches[0][1]
      }
    }

    const sector = (item.sector as string) || meta?.sector || 'Almacén'
    const scMeta = sectorColorMap[sector] ?? { color: '#e8f5e9', emoji: '🛒' }
    const subcategoria = (item.subcategoria as string) || meta?.subcategoria || sector

    return {
      id: item.sku,
      nombre: item.nombre,
      sector,
      subcategoria,
      emoji: meta?.emoji || scMeta.emoji,
      colorSector: meta?.colorSector || scMeta.color,
      precios: item.precios,
      imageUrl: item.imagen,
      disponible: item.stock
    }
  })


// Definición cruda de sectores
const sectoresRaw = [
  { nombre: 'Almacén',    emoji: '🏪', color: '#e8f5e9', subcategorias: ['Aceites', 'Condimentos', 'Arroz', 'Cacao y Café', 'Caldos y Sopas', 'Cereales', 'Conservas', 'Dulces', 'Encurtidos', 'Azúcar', 'Galletitas', 'Harinas', 'Infusiones', 'Pastas', 'Polenta', 'Snacks', 'Yerba'] },
  { nombre: 'Bebidas',    emoji: '🥤', color: '#fff3e0', subcategorias: ['Aguas', 'Isotónicas', 'Cervezas', 'Gaseosas', 'Jugos', 'Vinos'] },
  { nombre: 'Frescos',    emoji: '🥛', color: '#f3e5f5', subcategorias: ['Lácteos', 'Quesos', 'Yogur', 'Manteca', 'Cremas'] },
  { nombre: 'Limpieza',   emoji: '🧹', color: '#e3f2fd', subcategorias: ['Desinfectantes', 'Detergentes', 'Lavandina', 'Limpiadores', 'Suavizantes'] },
  { nombre: 'Perfumería', emoji: '💆', color: '#fce4ec', subcategorias: ['Shampoo', 'Jabones', 'Desodorantes', 'Pañales', 'Papel', 'Higiene', 'Cremas'] },
  { nombre: 'Mascotas',   emoji: '🐾', color: '#fff9c4', subcategorias: ['Alimentos', 'Accesorios'] },
  { nombre: 'Hogar y Bazar', emoji: '🏠', color: '#f1f8e9', subcategorias: ['Bazar', 'Hogar', 'Cocina'] },
  { nombre: 'Electro',    emoji: '🔌', color: '#e0f7fa', subcategorias: ['Audio', 'Tv', 'Cortadoras', 'Pequeños'] },
]

// Exportamos solo los sectores que tienen productos catalogados para evitar items vacíos en el menú
export const sectores = sectoresRaw.filter(s => 
  productos.some(p => p.sector === s.nombre)
).map(s => {
  // Extraemos las subcategorías reales presentes para este sector
  const subcatsReales = Array.from(new Set(
    productos
      .filter(p => p.sector === s.nombre)
      .map(p => p.subcategoria)
  ))
  return { ...s, subcategorias: subcatsReales.length > 0 ? subcatsReales : s.subcategorias }
})



// Función para calcular las bombas del día (una por sector para variedad)
export function calcularBombas(): ProductoBomba[] {
  const bombasPorSector = new Map<string, ProductoBomba>()

  // Primero calculamos todas las posibles bombas
  const todasLasBombas = productos
    .filter(p => p.precios.length > 1) // Solo productos que tienen ambos precios
    .map(p => {
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
    .filter(b => b.ahorroVsMaximo > 1) // Filtro mínimo para mostrar algo real si hay poco match
    .sort((a, b) => b.ahorroVsMaximo - a.ahorroVsMaximo)

  // Seleccionamos la mejor bomba por cada sector disponible
  todasLasBombas.forEach(b => {
    if (!bombasPorSector.has(b.sector)) {
      bombasPorSector.set(b.sector, b)
    }
  })

  // Retornamos las mejores de cada sector, y si sobran slots, rellenamos con las siguientes mejores generales
  const resultado = Array.from(bombasPorSector.values())
  
  if (resultado.length < 8) {
    const restantes = todasLasBombas.filter(b => !resultado.find(r => r.id === b.id))
    resultado.push(...restantes.slice(0, 8 - resultado.length))
  }

  return resultado.sort((a, b) => b.ahorroVsMaximo - a.ahorroVsMaximo)
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
  const tieneDecimales = precio % 1 !== 0
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: tieneDecimales ? 2 : 0,
    maximumFractionDigits: 2
  }).format(precio)
}
