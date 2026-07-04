// Fotos de las tarjetas de "Explorá por categoría".
// w/h = fracción del lienzo que ocupa el producto real (medido por píxeles con
// scripts del design-lab) — la tarjeta lo usa para escalar cada foto de modo
// que todos los productos se vean del mismo tamaño visual.
//
// Las locales (/categories/productos/) son las elegidas por Facu.
// Las remotas son relleno temporal del catálogo: reemplazar cuando Facu cargue
// las carpetas BAZAR / CONGELADOS / KIOSCO / MASCOTAS / DESAYUNO en public/.

export interface FotoCategoria {
  src: string
  w: number
  h: number
}

export const CATEGORIA_FOTOS: Record<string, FotoCategoria[]> = {
  'Almacén': [
    { src: '/categories/productos/almacen-3.webp', w: 0.81, h: 1.0 },
    { src: '/categories/productos/almacen-2.webp', w: 0.36, h: 1.0 },
    { src: '/categories/productos/almacen-4.webp', w: 0.61, h: 1.0 },
    { src: '/categories/productos/almacen-1.webp', w: 0.42, h: 0.81 },
  ],
  'Bebidas': [
    { src: '/categories/productos/bebidas-4.jpg', w: 0.40, h: 1.0 },
    { src: '/categories/productos/bebidas-2.webp', w: 0.29, h: 0.97 },
    { src: '/categories/productos/bebidas-1.webp', w: 0.21, h: 0.84 },
    { src: '/categories/productos/bebidas-3.webp', w: 0.23, h: 0.80 },
  ],
  'Frescos': [
    { src: '/categories/productos/frescos-3.webp', w: 0.99, h: 0.92 },
    { src: '/categories/productos/frescos-1.jpg', w: 0.68, h: 0.93 },
    { src: '/categories/productos/frescos-2.jpg', w: 0.90, h: 0.91 },
    { src: '/categories/productos/frescos-4.jpg', w: 0.92, h: 0.68 },
  ],
  'Limpieza': [
    { src: '/categories/productos/limpieza-1.jpg', w: 0.57, h: 0.80 },
    { src: '/categories/productos/limpieza-4.webp', w: 0.49, h: 0.79 },
    { src: '/categories/productos/limpieza-2.webp', w: 0.32, h: 0.75 },
    { src: '/categories/productos/limpieza-3.webp', w: 0.69, h: 0.69 },
  ],
  'Cuidado Personal': [
    { src: '/categories/productos/perfumeria-1.webp', w: 0.53, h: 0.95 },
    { src: '/categories/productos/perfumeria-4.webp', w: 0.34, h: 0.95 },
    { src: '/categories/productos/perfumeria-3.webp', w: 0.77, h: 0.56 },
    { src: '/categories/productos/perfumeria-2.webp', w: 0.62, h: 0.37 },
  ],

  // ── Relleno temporal (catálogo) — pendiente de fotos de Facu ──
  'Bazar': [
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/3616958812618.jpg?v=0107262044', w: 0.59, h: 0.82 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7798332055777.jpg?v=0107262044', w: 0.63, h: 0.82 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7790117062024.jpg?v=0107262044', w: 0.84, h: 0.24 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7798135921088.jpg?v=0107262044', w: 0.83, h: 0.23 },
  ],
  'Congelados': [
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7797906054819.jpg', w: 1.0, h: 1.0 },
    { src: 'https://www.maxiconsumo.com/media/catalog/product/cache/092e30bb2eaafa6a7c07f420783df0d8/2/6/26278_177708932569ec3b2d7857e7.33466357.jpg', w: 0.49, h: 0.84 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7797906055014.jpg', w: 0.99, h: 1.0 },
    { src: 'https://www.maxiconsumo.com/media/catalog/product/cache/092e30bb2eaafa6a7c07f420783df0d8/2/5/25761_176620235369461bf12e7483.04824409.jpg', w: 0.47, h: 0.98 },
  ],
  'Kiosco': [
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/77915481.jpg?v=0107262041', w: 0.87, h: 0.73 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7622300457303.jpg?v=0107262041', w: 0.83, h: 0.69 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/77976307.jpg?v=0107262041', w: 0.88, h: 0.70 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7790957002808.jpg', w: 0.87, h: 0.42 },
  ],
  'Mascotas': [
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7797453001571.jpg?v=0107262044', w: 0.91, h: 1.0 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7797453972291.jpg?v=0107262044', w: 0.90, h: 1.0 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7613287229977.jpg?v=0107262044', w: 0.72, h: 0.91 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7797453972345.jpg?v=0107262044', w: 0.90, h: 1.0 },
  ],
  'Desayuno y Merienda': [
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7798153810517.jpg', w: 0.96, h: 1.0 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7790150160824.jpg', w: 0.70, h: 0.85 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/8445291857957.jpg?v=0107262042', w: 1.0, h: 0.95 },
    { src: 'https://tupedido.carrefour.com.ar/imagenesPDA/7790580121303.jpg', w: 0.84, h: 1.0 },
  ],
}
