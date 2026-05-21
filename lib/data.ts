import catalogoUnificado from '../data/processed/catalogo_unificado.json'

// Tipos para los productos y precios
export interface Precio {
  mayorista: string
  precio: number
  tipo: 'lista' | 'oferta'
  link?: string
  fechaScraping?: string
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
  imagenFallbacks?: string[]
  disponible?: boolean
  abc?: string   // Indicador de importancia del Listado Maestro: A=top, B, C, D
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
  cantidad?: number
}

export interface Lista {
  id: string
  nombre: string
  items: ItemLista[]
  creadaEn: string
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
  cafe:         { sector: 'Almacén',    subcategoria: 'Infusiones',      emoji: '☕',  colorSector: '#e8f5e9' },
  yerba:        { sector: 'Almacén',    subcategoria: 'Infusiones',      emoji: '🧉',  colorSector: '#e8f5e9' },
  fideo:        { sector: 'Almacén',    subcategoria: 'Pastas',          emoji: '🍝',  colorSector: '#e8f5e9' },
  pasta:        { sector: 'Almacén',    subcategoria: 'Pastas',          emoji: '🍝',  colorSector: '#e8f5e9' },
  polenta:      { sector: 'Almacén',    subcategoria: 'Harinas',         emoji: '🌽',  colorSector: '#e8f5e9' },
  legumbre:     { sector: 'Almacén',    subcategoria: 'Arroz y Legumbres', emoji: '🥜',  colorSector: '#e8f5e9' },
  lenteja:      { sector: 'Almacén',    subcategoria: 'Arroz y Legumbres', emoji: '🥜',  colorSector: '#e8f5e9' },
  poroto:       { sector: 'Almacén',    subcategoria: 'Arroz y Legumbres', emoji: '🥜',  colorSector: '#e8f5e9' },
  garbanzo:     { sector: 'Almacén',    subcategoria: 'Arroz y Legumbres', emoji: '🥜',  colorSector: '#e8f5e9' },
  
  // Bebidas
  gaseosa:      { sector: 'Bebidas',    subcategoria: 'Gaseosas',        emoji: '🥤',  colorSector: '#fff3e0' },
  coca:         { sector: 'Bebidas',    subcategoria: 'Gaseosas',        emoji: '🥤',  colorSector: '#fff3e0' },
  pepsi:        { sector: 'Bebidas',    subcategoria: 'Gaseosas',        emoji: '🥤',  colorSector: '#fff3e0' },
  sprite:       { sector: 'Bebidas',    subcategoria: 'Gaseosas',        emoji: '🥤',  colorSector: '#fff3e0' },
  fanta:        { sector: 'Bebidas',    subcategoria: 'Gaseosas',        emoji: '🥤',  colorSector: '#fff3e0' },
  agua:         { sector: 'Bebidas',    subcategoria: 'Aguas y Sodas',    emoji: '💧',  colorSector: '#fff3e0' },
  soda:         { sector: 'Bebidas',    subcategoria: 'Aguas y Sodas',    emoji: '💧',  colorSector: '#fff3e0' },
  vino:         { sector: 'Bebidas',    subcategoria: 'Vinos',           emoji: '🍷',  colorSector: '#fff3e0' },
  cerveza:      { sector: 'Bebidas',    subcategoria: 'Cervezas',        emoji: '🍺',  colorSector: '#fff3e0' },
  champagne:    { sector: 'Bebidas',    subcategoria: 'Espumantes',      emoji: '🥂',  colorSector: '#fff3e0' },
  espumante:    { sector: 'Bebidas',    subcategoria: 'Espumantes',      emoji: '🥂',  colorSector: '#fff3e0' },
  sidra:        { sector: 'Bebidas',    subcategoria: 'Espumantes',      emoji: '🥂',  colorSector: '#fff3e0' },
  vodka:        { sector: 'Bebidas',    subcategoria: 'Bebidas Blancas',  emoji: '🍾',  colorSector: '#fff3e0' },
  whisky:       { sector: 'Bebidas',    subcategoria: 'Bebidas Blancas',  emoji: '🥃',  colorSector: '#fff3e0' },
  ron:          { sector: 'Bebidas',    subcategoria: 'Bebidas Blancas',  emoji: '🍾',  colorSector: '#fff3e0' },
  gin:          { sector: 'Bebidas',    subcategoria: 'Bebidas Blancas',  emoji: '🍾',  colorSector: '#fff3e0' },
  tequila:      { sector: 'Bebidas',    subcategoria: 'Bebidas Blancas',  emoji: '🍾',  colorSector: '#fff3e0' },
  fernet:       { sector: 'Bebidas',    subcategoria: 'Aperitivos',      emoji: '🥃',  colorSector: '#fff3e0' },
  aperitivo:    { sector: 'Bebidas',    subcategoria: 'Aperitivos',      emoji: '🥃',  colorSector: '#fff3e0' },
  gancia:       { sector: 'Bebidas',    subcategoria: 'Aperitivos',      emoji: '🥃',  colorSector: '#fff3e0' },
  campari:      { sector: 'Bebidas',    subcategoria: 'Aperitivos',      emoji: '🥃',  colorSector: '#fff3e0' },
  bitter:       { sector: 'Bebidas',    subcategoria: 'Aperitivos',      emoji: '🥃',  colorSector: '#fff3e0' },
  jugo:         { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  citric:       { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  baggio:       { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  cepita:       { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  speed:        { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  'red bull':   { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  monster:      { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  isotonica:    { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  gatorade:     { sector: 'Bebidas',    subcategoria: 'Jugos y Energizantes', emoji: '🧃',  colorSector: '#fff3e0' },
  
  // Frescos
  leche:        { sector: 'Frescos',    subcategoria: 'Lácteos',         emoji: '🥛',  colorSector: '#f3e5f5' },
  yogur:        { sector: 'Frescos',    subcategoria: 'Lácteos',         emoji: '🥛',  colorSector: '#f3e5f5' },
  queso:        { sector: 'Frescos',    subcategoria: 'Quesos',          emoji: '🧀',  colorSector: '#f3e5f5' },
  manteca:      { sector: 'Frescos',    subcategoria: 'Grasas y Cremas',  emoji: '🧈',  colorSector: '#f3e5f5' },
  crema:        { sector: 'Frescos',    subcategoria: 'Grasas y Cremas',  emoji: '🥛',  colorSector: '#f3e5f5' },
  margarina:    { sector: 'Frescos',    subcategoria: 'Grasas y Cremas',  emoji: '🧈',  colorSector: '#f3e5f5' },
  
  // Limpieza
  detergente:   { sector: 'Limpieza',   subcategoria: 'Limpieza',        emoji: '🧴',  colorSector: '#e3f2fd' },
  lavandina:    { sector: 'Limpieza',   subcategoria: 'Limpieza',        emoji: '🧴',  colorSector: '#e3f2fd' },
  limpiador:    { sector: 'Limpieza',   subcategoria: 'Limpieza',        emoji: '🧹',  colorSector: '#e3f2fd' },
  papel:        { sector: 'Limpieza',   subcategoria: 'Papel',           emoji: '🧻',  colorSector: '#e3f2fd' },
  jabon:        { sector: 'Limpieza',   subcategoria: 'Limpieza',        emoji: '🧼',  colorSector: '#e3f2fd' },
  perfume:      { sector: 'Limpieza',   subcategoria: 'Limpieza',        emoji: '🌸',  colorSector: '#e3f2fd' },
  suavizante:   { sector: 'Limpieza',   subcategoria: 'Detergentes',     emoji: '🧴',  colorSector: '#e3f2fd' },
  insecticida:  { sector: 'Limpieza',   subcategoria: 'Insecticidas',    emoji: '🐛',  colorSector: '#e3f2fd' },
  
  // Cuidado Personal
  shampoo:      { sector: 'Cuidado Personal', subcategoria: 'Cuidado Capilar', emoji: '🧴',  colorSector: '#fce4ec' },
  desodorante:  { sector: 'Cuidado Personal', subcategoria: 'Desodorantes', emoji: '🦨',  colorSector: '#fce4ec' },
  crema_care:   { sector: 'Cuidado Personal', subcategoria: 'Cuidado Facial', emoji: '🧴',  colorSector: '#fce4ec' },
  dental:       { sector: 'Cuidado Personal', subcategoria: 'Dental', emoji: '🦷',  colorSector: '#fce4ec' },
  afeitado:     { sector: 'Cuidado Personal', subcategoria: 'Baño', emoji: '🪒',  colorSector: '#fce4ec' },
  
  // Bazar
  vaso:         { sector: 'Bazar',      subcategoria: 'Vajilla',         emoji: '🥃',  colorSector: '#f3e5f5' },
  plato:        { sector: 'Bazar',      subcategoria: 'Vajilla',         emoji: '🍽️',  colorSector: '#f3e5f5' },
  cuchillo:     { sector: 'Bazar',      subcategoria: 'Cocina',          emoji: '🔪',  colorSector: '#f3e5f5' },
  bolsas:       { sector: 'Bazar',      subcategoria: 'Bolsas y Film',    emoji: '🛍️',  colorSector: '#f3e5f5' },
  film:         { sector: 'Bazar',      subcategoria: 'Bolsas y Film',    emoji: '📦',  colorSector: '#f3e5f5' },
  
  // Carnicería
  carne:        { sector: 'Carnicería', subcategoria: 'Carnes Rojas',    emoji: '🥩',  colorSector: '#ffebee' },
  pollo:        { sector: 'Carnicería', subcategoria: 'Pollo',           emoji: '🍗',  colorSector: '#ffebee' },
  milanesa:     { sector: 'Carnicería', subcategoria: 'Milanesas',      emoji: '🥩',  colorSector: '#ffebee' },
  hamburguesa:  { sector: 'Carnicería', subcategoria: 'Hamburguesas',   emoji: '🍔',  colorSector: '#ffebee' },
  
  // Bebés
  pañal:        { sector: 'Bebés',      subcategoria: 'Pañales',         emoji: '👶',  colorSector: '#f3e5f5' },
  toallita:     { sector: 'Bebés',      subcategoria: 'Toallitas',       emoji: '👶',  colorSector: '#f3e5f5' },
  mamadera:     { sector: 'Bebés',      subcategoria: 'Accesorios',      emoji: '🍼',  colorSector: '#f3e5f5' },
  
  // Mascotas
  alimento:     { sector: 'Mascotas',   subcategoria: 'Alimento Perros', emoji: '🐕',  colorSector: '#e8f5e9' },
  perro:        { sector: 'Mascotas',   subcategoria: 'Alimento Perros', emoji: '🐕',  colorSector: '#e8f5e9' },
  gato:         { sector: 'Mascotas',   subcategoria: 'Alimento Gatos', emoji: '🐈',  colorSector: '#e8f5e9' },
  balanceado:   { sector: 'Mascotas',   subcategoria: 'Alimento Perros', emoji: '🐕',  colorSector: '#e8f5e9' },
  
  // Otros
  kiosco:       { sector: 'Kiosco',     subcategoria: 'Golosinas',       emoji: '🏪',  colorSector: '#fce4ec' },
  cigarrillo:   { sector: 'Kiosco',     subcategoria: 'Cigarrillos',     emoji: '🚬',  colorSector: '#fce4ec' },
  diarios:      { sector: 'Kiosco',     subcategoria: 'Diarios',         emoji: '📰',  colorSector: '#fce4ec' },
  
  // Default para productos no categorizados
  default:      { sector: 'Almacén',    subcategoria: 'Otros',           emoji: '📦',  colorSector: '#e8f5e9' }
}

// Datos reales de Maxiconsumo + Simulados para la comparativa
// El scraper nuevo guarda item.sector directamente; el viejo usa item.query
const sectorColorMap: Record<string, { color: string; emoji: string }> = {
  'Almacén':          { color: '#e8f5e9', emoji: '🛒' },
  'Bebidas':          { color: '#fff3e0', emoji: '🥤' },
  'Frescos':          { color: '#f3e5f5', emoji: '🥛' },
  'Limpieza':         { color: '#e3f2fd', emoji: '🧼' },
  'Cuidado Personal': { color: '#fce4ec', emoji: '💆' },
  'Mascotas':         { color: '#fff9c4', emoji: '🐾' },
  'Bazar':            { color: '#f1f8e9', emoji: '🏠' },
  'Kiosco':           { color: '#fce4ec', emoji: '🏪' },
  'Bebés':            { color: '#f3e5f5', emoji: '👶' },
  'Congelados':       { color: '#e1f5fe', emoji: '🧊' },
  'Desayuno y Merienda': { color: '#fff8e1', emoji: '☕' },
}

export const productos: Producto[] = (catalogoUnificado as any[]).map((item: any) => {
    // Mapeo de clave interna → nombre display correcto
    const nombreMayorista: Record<string, string> = {
      maxicarrefour: 'MaxiCarrefour',
      maxiconsumo:   'Maxiconsumo',
      yaguar:        'Yaguar',
    }

    // Convertir el objecto de precios en un array (solo los que tienen precio > 0)
    const preciosMapped: Precio[] = Object.entries(item.precios)
      .filter(([, precio]) => (precio as number) > 0)
      .map(([mayorista, precio]) => ({
        mayorista: nombreMayorista[mayorista] ?? (mayorista.charAt(0).toUpperCase() + mayorista.slice(1)),
        precio: precio as number,
        tipo: 'lista' as const,
        link: item.fuentes?.[mayorista]?.link || undefined,
        fechaScraping: item.fuentes?.[mayorista]?.fecha_scraping || undefined,
      }))


    // --- LÓGICA DE SECTORES Y SUBCATEGORÍAS ---
    const nombreLower = ` ${item.nombre_display.toLowerCase()} `
    let sector = (item.sector as string) || 'Almacén'

    // Si el Maestro asignó subcategoría, usarla directamente sin keyword matching
    const subcategoriaDelMaestro = ((item.subcategoria as string) || '').trim()

    // Correcciones de sector por keywords: solo para productos sin datos del Maestro
    if (!subcategoriaDelMaestro && sector !== 'Cuidado Personal' && (
      nombreLower.includes('shampoo') || nombreLower.includes('acondicionador') ||
      nombreLower.includes('desodorante') || nombreLower.includes('antitranspirante') ||
      nombreLower.includes('gel de ducha') || nombreLower.includes('colonia ') ||
      nombreLower.includes(' perfume ') || nombreLower.includes('pasta dental') ||
      nombreLower.includes('crema dental') || nombreLower.includes('cepillo dental') ||
      nombreLower.includes('enjuague bucal') || nombreLower.includes('depilatori') ||
      nombreLower.includes('protector solar') || nombreLower.includes('maquina de afeitar')
    )) { sector = 'Cuidado Personal' }

    if (!subcategoriaDelMaestro && sector !== 'Limpieza' && (
      nombreLower.includes('lavandina') || nombreLower.includes('insecticida') ||
      nombreLower.includes(' raid ') || nombreLower.includes('mata cucaracha') ||
      nombreLower.includes('jabon en polvo') || nombreLower.includes('skip ') ||
      nombreLower.includes(' ariel ') || nombreLower.includes('detergente ropa') ||
      nombreLower.includes('suavizante ropa') || nombreLower.includes('quitamanchas')
    )) { sector = 'Limpieza' }

    if (!subcategoriaDelMaestro && sector !== 'Mascotas' && (
      nombreLower.includes('alimento para perro') || nombreLower.includes('alimento para gato') ||
      nombreLower.includes('whiskas ') || nombreLower.includes('pedigree ') ||
      nombreLower.includes('dog chow') || nombreLower.includes('cat chow') ||
      nombreLower.includes('purina ') || nombreLower.includes('royal canin')
    )) { sector = 'Mascotas' }

    if (!subcategoriaDelMaestro && sector !== 'Bebidas' && (
      nombreLower.includes('gaseosa ') || nombreLower.includes('cerveza ') ||
      nombreLower.includes('vino ') || nombreLower.includes('vodka ') ||
      nombreLower.includes('whisky ') || nombreLower.includes('fernet ') ||
      nombreLower.includes('champagne ') || nombreLower.includes('sidra ') ||
      (nombreLower.includes('agua') && (nombreLower.includes('villavicencio') || nombreLower.includes('villa del sur') || nombreLower.includes('glaciar') || nombreLower.includes('mineral')))
    ) && sector === 'Almacén') { sector = 'Bebidas' }

    let subcategoria: string
    if (subcategoriaDelMaestro) {
      // El Maestro tiene la categoría verificada — usarla directamente
      subcategoria = subcategoriaDelMaestro
    } else if (sector === 'Almacén') {
      if (nombreLower.includes('aceite') || nombreLower.includes('vinagre') || nombreLower.includes('aceto')) subcategoria = 'Aceites y Vinagres'
      else if (nombreLower.includes('fideo') || nombreLower.includes('pasta') || nombreLower.includes('tallar') || nombreLower.includes('canelone') || nombreLower.includes('lasaña')) subcategoria = 'Pastas'
      else if (nombreLower.includes('harina') || nombreLower.includes('polenta') || nombreLower.includes('semola') || nombreLower.includes('premezcla') || nombreLower.includes('rebozador')) subcategoria = 'Harinas y Polenta'
      else if (nombreLower.includes('arroz') || nombreLower.includes('lenteja') || nombreLower.includes('garbanzo') || nombreLower.includes('poroto') || nombreLower.includes('legumbre') || nombreLower.includes('cereal') || nombreLower.includes('avena') || nombreLower.includes('granola') || nombreLower.includes('quinoa')) subcategoria = 'Arroz, Legumbres y Cereales'
      else if (nombreLower.includes('yerba') || nombreLower.includes('cafe') || nombreLower.includes(' te ') || nombreLower.includes('infusion') || nombreLower.includes('cocido') || nombreLower.includes('tereré')) subcategoria = 'Yerba, Café y Té'
      else if (nombreLower.includes('azucar') || nombreLower.includes('edulcorante') || nombreLower.includes('stevia') || nombreLower.includes('sucralosa') || nombreLower.includes('endulzante')) subcategoria = 'Azúcar y Edulcorantes'
      else if (nombreLower.includes('mermelada') || nombreLower.includes('dulce de leche') || nombreLower.includes('miel') || nombreLower.includes('pasta de mani') || nombreLower.includes('nutella') || nombreLower.includes('manjar')) subcategoria = 'Dulces y Mermeladas'
      else if (nombreLower.includes('galletit') || nombreLower.includes('bizcocho') || nombreLower.includes('tostada') || nombreLower.includes('wafer') || nombreLower.includes('oblea')) subcategoria = 'Galletitas'
      else if (nombreLower.includes('conserva') || nombreLower.includes('atun') || nombreLower.includes('caballa') || nombreLower.includes('sardina') || nombreLower.includes('salmon') || nombreLower.includes('pure de tomate') || nombreLower.includes('tomate triturado') || nombreLower.includes('choclo') || nombreLower.includes('arvejas') || nombreLower.includes('champiñon')) subcategoria = 'Conservas'
      else if (nombreLower.includes('salsa') || nombreLower.includes('aderezo') || nombreLower.includes('mayonesa') || nombreLower.includes('ketchup') || nombreLower.includes('mostaza') || nombreLower.includes('dressing') || nombreLower.includes('aceituna') || nombreLower.includes('pepino') || nombreLower.includes('encurtido')) subcategoria = 'Salsas y Aderezos'
      else if (nombreLower.includes('caldo') || nombreLower.includes('sopa') || nombreLower.includes('pure ') || nombreLower.includes('puré ') || nombreLower.includes('sal ') || nombreLower.includes('sal)') || nombreLower.includes('especia') || nombreLower.includes('condimento') || nombreLower.includes('pimienta') || nombreLower.includes('oregano') || nombreLower.includes('pimenton') || nombreLower.includes('ajo en') || nombreLower.includes('laurel')) subcategoria = 'Caldos y Condimentos'
      else if (nombreLower.includes('leche') || nombreLower.includes('leche en polvo') || nombreLower.includes('leche uht')) subcategoria = 'Leche'
      else if (nombreLower.includes('postre') || nombreLower.includes('gelatina') || nombreLower.includes('flan') || nombreLower.includes('mousse') || nombreLower.includes('budín')) subcategoria = 'Postres y Repostería'
      else subcategoria = 'Almacén General'
    } else if (sector === 'Bebidas') {
      if (nombreLower.includes('vino') || nombreLower.includes('malbec') || nombreLower.includes('cabernet') || nombreLower.includes('merlot') || nombreLower.includes('chardonnay') || nombreLower.includes('torrontes')) subcategoria = 'Vinos'
      else if (nombreLower.includes('champagne') || nombreLower.includes('sidra') || nombreLower.includes('espumante') || nombreLower.includes('prosecco')) subcategoria = 'Espumantes y Sidras'
      else if (nombreLower.includes('cerveza') || nombreLower.includes('birra')) subcategoria = 'Cervezas'
      else if (nombreLower.includes('gaseosa') || nombreLower.includes('coca') || nombreLower.includes('pepsi') || nombreLower.includes('manaos') || nombreLower.includes('sprite') || nombreLower.includes('cunnington') || nombreLower.includes('fanta') || nombreLower.includes('paso de los toros') || nombreLower.includes('schweppes') || nombreLower.includes('7up')) subcategoria = 'Gaseosas'
      else if (nombreLower.includes('agua') || nombreLower.includes('soda') || nombreLower.includes('villavicencio') || nombreLower.includes('villa del sur') || nombreLower.includes('glaciar') || nombreLower.includes('bonaqua') || nombreLower.includes('eco de los andes') || nombreLower.includes('ser ') || nombreLower.includes('nestea')) subcategoria = 'Aguas y Sodas'
      else if (nombreLower.includes('vodka') || nombreLower.includes('whisky') || nombreLower.includes('whiskey') || nombreLower.includes('ron ') || nombreLower.includes('gin ') || nombreLower.includes('tequila') || nombreLower.includes('caña') || nombreLower.includes('grappa') || nombreLower.includes('anís')) subcategoria = 'Bebidas Blancas'
      else if (nombreLower.includes('fernet') || nombreLower.includes('aperitivo') || nombreLower.includes('gancia') || nombreLower.includes('campari') || nombreLower.includes('bitter') || nombreLower.includes('amargo') || nombreLower.includes('cynar') || nombreLower.includes('licor')) subcategoria = 'Aperitivos y Licores'
      else if (nombreLower.includes('jugo') || nombreLower.includes('nectar') || nombreLower.includes('citric') || nombreLower.includes('baggio') || nombreLower.includes('cepita') || nombreLower.includes('ades') || nombreLower.includes('levite')) subcategoria = 'Jugos'
      else if (nombreLower.includes('energizante') || nombreLower.includes('red bull') || nombreLower.includes('monster') || nombreLower.includes('speed') || nombreLower.includes('isotonica') || nombreLower.includes('gatorade') || nombreLower.includes('powerade')) subcategoria = 'Energizantes e Isotónicas'
      else subcategoria = 'Otras Bebidas'
    } else if (sector === 'Frescos') {
      if (nombreLower.includes('leche') || nombreLower.includes('yogur') || nombreLower.includes('yakult') || nombreLower.includes('activia')) subcategoria = 'Lácteos'
      else if (nombreLower.includes('queso')) subcategoria = 'Quesos'
      else if (nombreLower.includes('manteca') || nombreLower.includes('crema') || nombreLower.includes('margarina') || nombreLower.includes('ricota')) subcategoria = 'Grasas y Cremas'
      else if (nombreLower.includes('jamon') || nombreLower.includes('salame') || nombreLower.includes('fiambre') || nombreLower.includes('mortadela') || nombreLower.includes('paleta') || nombreLower.includes('salchich') || nombreLower.includes('salchicha') || nombreLower.includes('panceta') || nombreLower.includes('chorizo')) subcategoria = 'Fiambres y Embutidos'
      else if (nombreLower.includes('pan ') || nombreLower.includes('lactal') || nombreLower.includes('baguette') || nombreLower.includes('facturas') || nombreLower.includes('medialunas') || nombreLower.includes('tostado') || nombreLower.includes('integral') || nombreLower.includes('brioche')) subcategoria = 'Panificados'
      else if (nombreLower.includes('pasta fresca') || nombreLower.includes('ñoqui') || nombreLower.includes('ravioles') || nombreLower.includes('capelletti') || nombreLower.includes('tapa') || nombreLower.includes('empanada')) subcategoria = 'Pastas y Tapas'
      else if (nombreLower.includes('dulce de leche') || nombreLower.includes('postre') || nombreLower.includes('mousse') || nombreLower.includes('flan')) subcategoria = 'Postres y Dulces'
      else if (nombreLower.includes('huevo')) subcategoria = 'Huevos'
      else subcategoria = 'Otros Frescos'
    } else if (sector === 'Limpieza') {
      if (nombreLower.includes('jabon en polvo') || nombreLower.includes('jabon ropa') || nombreLower.includes('detergente ropa') || nombreLower.includes('lavarropas') || nombreLower.includes('skip') || nombreLower.includes('ariel') || nombreLower.includes('drive') || nombreLower.includes('ala ') || nombreLower.includes('persil')) subcategoria = 'Ropa'
      else if (nombreLower.includes('suavizante') || nombreLower.includes('quitamanchas') || nombreLower.includes('prelavado')) subcategoria = 'Ropa'
      else if (nombreLower.includes('lavandina') || nombreLower.includes('limpiador') || nombreLower.includes('desinfectante') || nombreLower.includes('lysoform') || nombreLower.includes('pino') || nombreLower.includes('cera ') || nombreLower.includes('lustramueble') || nombreLower.includes('limpia vidrio') || nombreLower.includes('inodoro') || nombreLower.includes('baño')) subcategoria = 'Limpieza del Hogar'
      else if (nombreLower.includes('lavavajilla') || nombreLower.includes('jabon vajilla') || nombreLower.includes('esponja') || nombreLower.includes('virulana') || nombreLower.includes('trapo') || nombreLower.includes('guante') || nombreLower.includes('detergente') && !nombreLower.includes('ropa')) subcategoria = 'Vajilla y Cocina'
      else if (nombreLower.includes('papel higienico') || nombreLower.includes('papel de cocina') || nombreLower.includes('servilleta') || nombreLower.includes('pañuelo') || nombreLower.includes('toalla descartable') || nombreLower.includes('papel descartable')) subcategoria = 'Papel'
      else if (nombreLower.includes('bolsa') || nombreLower.includes('film') || nombreLower.includes('papel aluminio') || nombreLower.includes('papel film') || nombreLower.includes('rollo film')) subcategoria = 'Bolsas y Film'
      else if (nombreLower.includes('aromatizante') || nombreLower.includes('desodorante ambiente') || nombreLower.includes('freshmatic') || nombreLower.includes('glade') || nombreLower.includes('airwick') || nombreLower.includes('felfort') || nombreLower.includes('incienso') || nombreLower.includes('vela')) subcategoria = 'Aromatizantes'
      else if (nombreLower.includes('insecticida') || nombreLower.includes('repelente') || nombreLower.includes('raid') || nombreLower.includes('mosquito') || nombreLower.includes('cucaracha') || nombreLower.includes('mata')) subcategoria = 'Insecticidas'
      else subcategoria = 'Limpieza del Hogar'
    } else if (sector === 'Cuidado Personal') {
      if (nombreLower.includes('shampoo') || nombreLower.includes('acondicionador') || nombreLower.includes('coloracion') || nombreLower.includes('tinte') || nombreLower.includes('cabello') || nombreLower.includes('capilar') || nombreLower.includes('gel fijador') || nombreLower.includes('fijador') || nombreLower.includes('gomina') || nombreLower.includes('tratamiento capilar') || nombreLower.includes('crema peinar') || nombreLower.includes('rizos')) subcategoria = 'Capilar'
      else if (nombreLower.includes('desodorante') || nombreLower.includes('antitranspirante') || nombreLower.includes('talco')) subcategoria = 'Desodorantes'
      else if (nombreLower.includes('dental') || nombreLower.includes('cepillo dent') || nombreLower.includes('enjuague bucal') || nombreLower.includes('hilo dental') || nombreLower.includes('protesis') || nombreLower.includes('blanqueador')) subcategoria = 'Dental'
      else if (nombreLower.includes('jabon') || nombreLower.includes('gel de ducha') || nombreLower.includes('gel ducha') || nombreLower.includes('bath') || nombreLower.includes('body wash') || nombreLower.includes('jabon liquido')) subcategoria = 'Jabones y Geles'
      else if (nombreLower.includes('pañal') || nombreLower.includes('toallita') || nombreLower.includes('bebe') || nombreLower.includes('bebé') || nombreLower.includes('crema pañal') || nombreLower.includes('mamadera') || nombreLower.includes('hipoglos')) subcategoria = 'Bebés'
      else if (nombreLower.includes('toalla femenina') || nombreLower.includes('protector diario') || nombreLower.includes('tampon') || nombreLower.includes('tampón') || nombreLower.includes('femenin') || nombreLower.includes('incontinencia')) subcategoria = 'Higiene Femenina'
      else if (nombreLower.includes('crema') || nombreLower.includes('humectante') || nombreLower.includes('locion') || nombreLower.includes('vaselina') || nombreLower.includes('protector solar') || nombreLower.includes('autobronceante') || nombreLower.includes('after sun') || nombreLower.includes('nivea') || nombreLower.includes('dove') || nombreLower.includes('neutrogena')) subcategoria = 'Cremas'
      else if (nombreLower.includes('perfume') || nombreLower.includes('colonia') || nombreLower.includes('eau de') || nombreLower.includes('bodysplash') || nombreLower.includes('body splash') || nombreLower.includes('fragancia')) subcategoria = 'Perfumes'
      else if (nombreLower.includes('afeitar') || nombreLower.includes('gillette') || nombreLower.includes('maquina de afeitar') || nombreLower.includes('depila') || nombreLower.includes('cera depi') || nombreLower.includes('vaporizador')) subcategoria = 'Depilación y Afeitado'
      else if (nombreLower.includes('algodón') || nombreLower.includes('algodon') || nombreLower.includes('hisopo') || nombreLower.includes('apósito') || nombreLower.includes('curita') || nombreLower.includes('alcohol')) subcategoria = 'Primeros Auxilios'
      else subcategoria = 'Cuidado Corporal'
    } else if (sector === 'Mascotas') {
      if (nombreLower.includes('gato') || nombreLower.includes('gatit') || nombreLower.includes('felino') || nombreLower.includes('cat ') || nombreLower.includes('whiskas') || nombreLower.includes('felix') || nombreLower.includes('friskies')) subcategoria = 'Gatos'
      else if (nombreLower.includes('higiene') || nombreLower.includes('shampoo') || nombreLower.includes('antiparasit') || nombreLower.includes('pulga') || nombreLower.includes('collar') || nombreLower.includes('pipeta')) subcategoria = 'Higiene y Cuidado'
      else subcategoria = 'Perros'
    } else if (sector === 'Desayuno y Merienda') {
      if (nombreLower.includes('galletit') || nombreLower.includes('bizcocho') || nombreLower.includes('wafer') || nombreLower.includes('oblea') || nombreLower.includes('tostada')) subcategoria = 'Galletitas'
      else if (nombreLower.includes('cereal') || nombreLower.includes('avena') || nombreLower.includes('granola') || nombreLower.includes('müsli') || nombreLower.includes('musli')) subcategoria = 'Cereales'
      else if (nombreLower.includes('mermelada') || nombreLower.includes('dulce de leche') || nombreLower.includes('miel') || nombreLower.includes('pasta de mani') || nombreLower.includes('nutella') || nombreLower.includes('mantequilla de mani')) subcategoria = 'Dulces y Untables'
      else if (nombreLower.includes('chocolate') || nombreLower.includes('cacao') || nombreLower.includes('cocoa') || nombreLower.includes('nesquik') || nombreLower.includes('milo')) subcategoria = 'Chocolates y Cacao'
      else if (nombreLower.includes('cafe') || nombreLower.includes('yerba') || nombreLower.includes(' te ') || nombreLower.includes('cocido') || nombreLower.includes('infusion')) subcategoria = 'Infusiones'
      else if (nombreLower.includes('alfajor') || nombreLower.includes('barrita') || nombreLower.includes('barra de cereal') || nombreLower.includes('budín') || nombreLower.includes('muffin') || nombreLower.includes('magdalena')) subcategoria = 'Barras y Alfajores'
      else subcategoria = 'Desayuno General'
    } else if (sector === 'Kiosco') {
      if (nombreLower.includes('chocolate') || nombreLower.includes('bombon') || nombreLower.includes('kitkat') || nombreLower.includes('toblerone') || nombreLower.includes('milka') || nombreLower.includes('cofler')) subcategoria = 'Chocolates'
      else if (nombreLower.includes('alfajor') || nombreLower.includes('alfajores')) subcategoria = 'Alfajores'
      else if (nombreLower.includes('caramelo') || nombreLower.includes('gomita') || nombreLower.includes('pastilla') || nombreLower.includes('chupet') || nombreLower.includes('turron') || nombreLower.includes('mani') || nombreLower.includes('garrapiñada')) subcategoria = 'Golosinas'
      else if (nombreLower.includes('chicle') || nombreLower.includes('goma de mascar') || nombreLower.includes('orbit') || nombreLower.includes('trident') || nombreLower.includes('mentitas')) subcategoria = 'Chicles'
      else if (nombreLower.includes('pila') || nombreLower.includes('bateria') || nombreLower.includes('encendedor') || nombreLower.includes('fosforo') || nombreLower.includes('preservativo') || nombreLower.includes('bic')) subcategoria = 'Varios Kiosco'
      else subcategoria = 'Golosinas'
    } else if (sector === 'Congelados') {
      if (nombreLower.includes('hamburguesa') || nombreLower.includes('medallón') || nombreLower.includes('medallon')) subcategoria = 'Hamburguesas'
      else if (nombreLower.includes('rebozado') || nombreLower.includes('milanesa') || nombreLower.includes('nugget') || nombreLower.includes('crocante')) subcategoria = 'Rebozados'
      else if (nombreLower.includes('papa') || nombreLower.includes('papas fritas') || nombreLower.includes('bastón')) subcategoria = 'Papas'
      else if (nombreLower.includes('vegetal') || nombreLower.includes('espinaca') || nombreLower.includes('brócoli') || nombreLower.includes('choclo') || nombreLower.includes('arveja')) subcategoria = 'Vegetales'
      else if (nombreLower.includes('pizza') || nombreLower.includes('empanada') || nombreLower.includes('tarta') || nombreLower.includes('canelone') || nombreLower.includes('lasaña')) subcategoria = 'Comidas Listas'
      else if (nombreLower.includes('pollo') || nombreLower.includes('pescado') || nombreLower.includes('langostino') || nombreLower.includes('calamar')) subcategoria = 'Aves y Pescados'
      else subcategoria = 'Congelados General'
    } else if (sector === 'Bazar') {
      if (nombreLower.includes('vaso') || nombreLower.includes('plato') || nombreLower.includes('taza') || nombreLower.includes('bowl') || nombreLower.includes('cubierto') || nombreLower.includes('cuchillo') || nombreLower.includes('tenedor')) subcategoria = 'Vajilla'
      else if (nombreLower.includes('olla') || nombreLower.includes('sarten') || nombreLower.includes('cacerola') || nombreLower.includes('fuente') || nombreLower.includes('molde') || nombreLower.includes('bandeja') || nombreLower.includes('termo') || nombreLower.includes('mate')) subcategoria = 'Cocina'
      else if (nombreLower.includes('bolsa') || nombreLower.includes('film') || nombreLower.includes('papel aluminio') || nombreLower.includes('papel manteca') || nombreLower.includes('nylon')) subcategoria = 'Bolsas y Film'
      else if (nombreLower.includes('descartable') || nombreLower.includes('vaso descartable') || nombreLower.includes('plato descartable') || nombreLower.includes('bandeja descartable') || nombreLower.includes('cubierto plast')) subcategoria = 'Descartables'
      else subcategoria = 'Bazar General'
    } else {
      subcategoria = sector
    }

    // Normalizar nombres de subcategoría a los canónicos del Maestro
    const SUBCAT_NORMALIZE: Record<string, string> = {
      // Bebidas
      'Aperitivos y Licores': 'Aperitivos',
      'Aguas Y Sodas': 'Aguas y Sodas',
      'Energizantes e Isotónicas': 'Energizantes',
      'Espumantes y Sidras': 'Sidras',
      'Jugos': 'Jugos De Fruta',
      'Otras Bebidas': 'Otros',
      // Almacén
      'Aceites y Vinagres': 'Aceites',
      'Pastas': 'Pastas Secas',
      'Harinas y Polenta': 'Harinas',
      'Arroz, Legumbres y Cereales': 'Arroz',
      'Yerba, Café y Té': 'Yerbas',
      'Azúcar y Edulcorantes': 'Azúcar',
      'Dulces y Mermeladas': 'Dulces',
      'Salsas y Aderezos': 'Aderezos',
      'Caldos y Condimentos': 'Caldos',
      'Leche': 'Leches',
      'Postres y Repostería': 'Reposteria',
      'Almacén General': 'Otros',
      // Frescos
      'Lácteos': 'Leches',
      'Quesos': 'Quesos Blandos',
      'Grasas y Cremas': 'Cremas Lacteas',
      'Fiambres y Embutidos': 'Fiambres',
      'Pastas y Tapas': 'Pastas Frescas',
      'Postres y Dulces': 'Postres',
      'Otros Frescos': 'Otros',
      // Limpieza
      'Ropa': 'Jabones Para La Ropa',
      'Limpieza del Hogar': 'Lavandinas Liquidas',
      'Vajilla y Cocina': 'Lavavajillas',
      'Papel': 'Papel Higienico',
      'Bolsas y Film': 'Bolsas',
      'Aromatizantes': 'Aromatizantes De Ambientes',
      'Insecticidas': 'Moscas Y Mosquitos',
      // Cuidado Personal
      'Capilar': 'Shampoo',
      'Desodorantes': 'Desodorantes Corporales',
      'Dental': 'Cremas Dentales',
      'Jabones y Geles': 'Jabones Y Geles De Ducha',
      'Bebés': 'Cuidado Del Bebe',
      'Higiene Femenina': 'Protección Femenina',
      'Cremas': 'Cremas Corporales',
      'Depilación y Afeitado': 'Depilación',
      'Primeros Auxilios': 'Alcoholes',
      'Cuidado Corporal': 'Cremas Corporales',
      // Mascotas
      'Perros': 'Alimento Para Mascotas',
      'Gatos': 'Alimento Para Mascotas',
      'Higiene y Cuidado': 'Higiene De Mascotas',
      // Kiosco
      'Golosinas': 'Caramelos, Gomitas Y Pastillas',
      'Varios Kiosco': 'Otros',
      // Desayuno y Merienda
      'Dulces y Untables': 'Dulces',
      'Chocolates y Cacao': 'Cacaos',
      'Infusiones': 'Yerbas',
      'Barras y Alfajores': 'Barras De Cereales',
      'Desayuno General': 'Otros',
      // Congelados → subcats del Maestro (Frescos)
      'Hamburguesas': 'Hamburguesas Y Medallones',
      'Rebozados': 'Rebozados Congelados',
      'Papas': 'Papas Congeladas',
      'Vegetales': 'Vegetales Congelados',
      'Comidas Listas': 'Comidas Congeladas',
      'Aves y Pescados': 'Pollos',
      'Congelados General': 'Otros',
      // Bazar
      'Vajilla': 'Vasos',
      'Cocina': 'Utensilos De Cocina',
      'Descartables': 'Descartables',
      'Bazar General': 'Otros',
    }
    if (SUBCAT_NORMALIZE[subcategoria]) {
      subcategoria = SUBCAT_NORMALIZE[subcategoria]
    }

    const scMeta = sectorColorMap[sector] ?? { color: '#e8f5e9', emoji: '🛒' }

    return {
      id: item.id_unificado,
      nombre: item.nombre_display,
      sector,
      subcategoria,
      emoji: scMeta.emoji,
      colorSector: scMeta.color,
      precios: preciosMapped,
      imageUrl: item.imagen,
      imagenFallbacks: Object.values((item.fuentes as Record<string, { imagen?: string }>) || {})
        .map(f => f.imagen || '')
        .filter(img => img && img !== item.imagen),
      disponible: true,
      abc: item.abc || '',
    }
  })

// Definición de sectores y sus subcategorías para los filtros
const sectoresRaw = [
  { 
    nombre: 'Almacén',    
    emoji: '🏪', 
    color: '#e8f5e9', 
    subcategorias: [
      'Aceites y Vinagres', 'Arroz y Legumbres', 'Pastas', 'Harinas y Polenta', 
      'Yerba, Café y Té', 'Azúcar y Edulcorantes', 'Dulces y Mermeladas', 'Galletitas',
      'Conservas', 'Salsas y Aderezos', 'Caldos y Condimentos', 'Leche',
      'Postres y Repostería', 'Almacén General'
    ]
  },
  {
    nombre: 'Bebidas',
    emoji: '🥤',
    color: '#fff3e0',
    subcategorias: ['Gaseosas', 'Aguas y Sodas', 'Cervezas', 'Vinos', 'Espumantes y Sidras', 'Bebidas Blancas', 'Aperitivos y Licores', 'Jugos', 'Energizantes e Isotónicas', 'Otras Bebidas']
  },
  {
    nombre: 'Frescos',
    emoji: '🥛',
    color: '#f3e5f5',
    subcategorias: ['Lácteos', 'Quesos', 'Grasas y Cremas', 'Fiambres y Embutidos', 'Panificados', 'Pastas y Tapas', 'Postres y Dulces', 'Huevos', 'Otros Frescos']
  },
  {
    nombre: 'Limpieza',
    emoji: '🧹',
    color: '#e3f2fd',
    subcategorias: ['Ropa', 'Limpieza del Hogar', 'Vajilla y Cocina', 'Papel', 'Bolsas y Film', 'Aromatizantes', 'Insecticidas']
  },
  { 
    nombre: 'Cuidado Personal',   
    emoji: '💆', 
    color: '#fce4ec', 
    subcategorias: ['Capilar', 'Desodorantes', 'Jabones y Geles', 'Dental', 'Bebés', 'Higiene Femenina', 'Cremas', 'Perfumes', 'Depilación y Afeitado', 'Primeros Auxilios', 'Cuidado Corporal']
  },
  {
    nombre: 'Bazar',
    emoji: '🏺',
    color: '#f3e5f5',
    subcategorias: ['Vajilla', 'Cocina', 'Bolsas y Film', 'Descartables', 'Bazar General']
  },
  {
    nombre: 'Congelados',
    emoji: '🧊',
    color: '#e1f5fe',
    subcategorias: ['Hamburguesas', 'Rebozados', 'Papas', 'Vegetales', 'Comidas Listas', 'Aves y Pescados', 'Congelados General']
  },
  { 
    nombre: 'Verdulería',   
    emoji: '🥬', 
    color: '#e8f5e9', 
    subcategorias: ['Frutas', 'Verduras', 'Hortalizas'] 
  },
  { 
    nombre: 'Quesos',   
    emoji: '🧀', 
    color: '#fff3e0', 
    subcategorias: ['Quesos Duros', 'Quesos Blandos', 'Quesos Crema', 'Quesos Azules'] 
  },
  {
    nombre: 'Kiosco',
    emoji: '🍬',
    color: '#fce4ec',
    subcategorias: ['Chocolates', 'Alfajores', 'Golosinas', 'Chicles', 'Varios Kiosco']
  },
  {
    nombre: 'Mascotas',
    emoji: '🐕',
    color: '#e8f5e9',
    subcategorias: ['Perros', 'Gatos', 'Higiene y Cuidado']
  },
  {
    nombre: 'Desayuno y Merienda',
    emoji: '☕',
    color: '#fff8e1',
    subcategorias: ['Galletitas', 'Cereales', 'Dulces y Untables', 'Chocolates y Cacao', 'Infusiones', 'Barras y Alfajores', 'Desayuno General']
  },
  { 
    nombre: 'Electrónica',   
    emoji: '📱', 
    color: '#e3f2fd', 
    subcategorias: ['Pequeños Electrodomésticos', 'Baterías', 'Cables'] 
  },
  { 
    nombre: 'Textil',   
    emoji: '👕',
    color: '#fce4ec', 
    subcategorias: ['Ropa Hogar', 'Toallas', 'Sábanas'] 
  },
  { 
    nombre: 'Librería',   
    emoji: '📚', 
    color: '#fff3e0', 
    subcategorias: ['Útiles Escolares', 'Oficina', 'Papelería'] 
  },
  { 
    nombre: 'Juguetería',   
    emoji: '🎮', 
    color: '#e1f5fe', 
    subcategorias: ['Juguetes', 'Juegos', 'Peluches'] 
  },
  { 
    nombre: 'Iluminación',   
    emoji: '💡', 
    color: '#fff8e1', 
    subcategorias: ['Lámparas', 'Focos', 'Veladores'] 
  },
  { 
    nombre: 'Parrilla',   
    emoji: '🔥', 
    color: '#ffebee', 
    subcategorias: ['Carbón', 'Leña', 'Accesorios'] 
  },
  { 
    nombre: 'Granja',   
    emoji: '🐄', 
    color: '#e8f5e9', 
    subcategorias: ['Alimentos Balanceados', 'Forraje', 'Accesorios'] 
  }
]

// Exportamos solo los sectores con suficientes productos (≥50) para evitar sectores huerfanos
export const sectores = sectoresRaw.filter(s =>
  productos.filter(p => p.sector === s.nombre).length >= 20
).map(s => {
  // Extraemos las subcategorías reales presentes para este sector
  const subcatsReales = Array.from(new Set(
    productos
      .filter(p => p.sector === s.nombre)
      .map(p => p.subcategoria)
  ))
  return { ...s, subcategorias: subcatsReales.length > 0 ? subcatsReales : s.subcategorias }
})



// Función para calcular las bombas del día (productos con mayor diferencia de precio entre mayoristas)
export function calcularBombas(): ProductoBomba[] {
  return productos
    .filter(p => {
      const preciosValidos = p.precios.filter(pr => pr.precio > 0)
      return preciosValidos.length >= 2
    })
    .map(p => {
      const preciosValidos = p.precios.filter(pr => pr.precio > 0)
      const precios = preciosValidos.map(pr => pr.precio)
      const precioMinimo = Math.min(...precios)
      const precioMaximo = Math.max(...precios)
      const ganador = preciosValidos.find(pr => pr.precio === precioMinimo)!
      const ahorroEnPlata = Math.round(precioMaximo - precioMinimo)
      const ahorroVsMaximo = Math.round((ahorroEnPlata / precioMaximo) * 100)

      return {
        ...p,
        precioMinimo,
        precioMaximo,
        mayoristaMejorPrecio: ganador.mayorista,
        ahorroVsMaximo,
        ahorroEnPlata,
        tipoMejorPrecio: ganador.tipo,
      }
    })
    .sort((a, b) => {
      // Prioridad 1: productos ABC=A primero (productos de alto volumen conocidos)
      const abcOrder: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }
      const aAbc = abcOrder[a.abc ?? ''] ?? 4
      const bAbc = abcOrder[b.abc ?? ''] ?? 4
      if (aAbc !== bAbc) return aAbc - bAbc
      // Prioridad 2: productos con 3 mayoristas
      const a3 = a.precios.filter(pr => pr.precio > 0).length === 3 ? 1 : 0
      const b3 = b.precios.filter(pr => pr.precio > 0).length === 3 ? 1 : 0
      if (a3 !== b3) return b3 - a3
      // Prioridad 3: mayor ahorro porcentual
      return b.ahorroVsMaximo - a.ahorroVsMaximo
    })
    .slice(0, 50)
}

// Ahorro máximo que puede lograr eligiendo siempre el mejor precio (solo ABC=A)
export function calcularAhorroTotal(): number {
  return calcularBombas().reduce((acc, b) => acc + b.ahorroEnPlata, 0)
}

// Cambios recientes simulados
export const cambiosRecientes = [
  { producto: 'Aceite Cocinero 1.5L', mayorista: 'Maxiconsumo', cambio: -5, fecha: 'Hace 2h' },
  { producto: 'Harina Cañuelas 1kg', mayorista: 'Yaguar', cambio: 3, fecha: 'Hace 4h' },
  { producto: 'Coca Cola 2.25L', mayorista: 'MaxiCarrefour', cambio: -2, fecha: 'Hace 6h' },
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

// Extrae tamaño del nombre del producto: "X500G", "x1L", "X750ML", "X1KG", etc.
export function extraerTamano(nombre: string): string | null {
  const match = nombre.match(/[Xx](\d+(?:[.,]\d+)?)\s*(G|GR|KG|ML|L)\b/i)
  if (!match) return null
  const num = parseFloat(match[1].replace(',', '.'))
  const unit = match[2].toUpperCase()
  if (unit === 'G' || unit === 'GR') return `${num}G`
  if (unit === 'KG') return `${num}KG`
  if (unit === 'ML') return `${num}ML`
  if (unit === 'L') return `${num}L`
  return null
}

// Calcula precio por unidad: precio=799, tamano="500G" → "$1,60 por 100g"
export function calcularPrecioPorUnidad(precio: number, tamano: string | null): string | null {
  if (!tamano) return null
  const match = tamano.match(/^(\d+(?:\.\d+)?)(G|KG|ML|L)$/)
  if (!match) return null
  const num = parseFloat(match[1])
  const unit = match[2]
  if (unit === 'G') {
    const por100 = (precio / num) * 100
    return `$${por100.toFixed(0)} por 100g`
  }
  if (unit === 'KG') return `$${(precio / num).toFixed(0)} por kg`
  if (unit === 'ML') {
    const por100 = (precio / num) * 100
    return `$${por100.toFixed(0)} por 100ml`
  }
  if (unit === 'L') return `$${(precio / num).toFixed(0)} por litro`
  return null
}
