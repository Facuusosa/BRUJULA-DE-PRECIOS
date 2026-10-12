// La cuenta de Mi Lista (diseño P3 aprobado por Facu 12/10/2026): dónde conviene comprar
// cada producto según a qué lugares va el comerciante. Sin dependencias de la app, para
// poder probarlo solo (ver plan-compra.check.mts).
//
// Regla de oro (bug "todo en Nini $30.304", 04/10): un total SOLO se muestra como "todo
// ahí" si ese lugar tiene todos los productos. Nunca se completa un faltante con el
// precio de otro lugar a escondidas.

export interface ItemPlan {
  id: string
  nombre: string
  q: number
  p: Record<string, number>   // fuente -> precio unitario (solo > 0)
}

export interface Asignacion { item: ItemPlan; fuente: string; precio: number; elegidoPorVos: boolean }

export interface Plan {
  total: number
  asig: Asignacion[]
  falta: ItemPlan[]
  lugares: string[]   // lugares donde efectivamente se compra algo
}

export const precioEn = (it: ItemPlan, f: string) => it.p[f] || 0

export const faltanEn = (items: ItemPlan[], f: string) => items.filter(it => !precioEn(it, f))

export const totalEn = (items: ItemPlan[], f: string) => items.reduce((s, it) => s + precioEn(it, f) * it.q, 0)

// Cada producto en el más barato de los lugares dados; `elegidos` (producto -> lugar) manda si ese lugar lo tiene
export function planCon(items: ItemPlan[], lugares: string[], elegidos: Record<string, string> = {}): Plan {
  let total = 0
  const asig: Asignacion[] = [], falta: ItemPlan[] = []
  for (const it of items) {
    const yo = elegidos[it.id]
    let fuente = yo && precioEn(it, yo) ? yo : ''
    if (!fuente) {
      for (const f of lugares) if (precioEn(it, f) && (!fuente || precioEn(it, f) < precioEn(it, fuente))) fuente = f
    }
    if (!fuente) { falta.push(it); continue }
    const precio = precioEn(it, fuente)
    total += precio * it.q
    asig.push({ item: it, fuente, precio, elegidoPorVos: fuente === yo })
  }
  return { total, asig, falta, lugares: [...new Set(asig.map(a => a.fuente))] }
}

function combos<T>(arr: T[], k: number, start = 0, acc: T[] = [], out: T[][] = []): T[][] {
  if (acc.length === k) { out.push(acc.slice()); return out }
  for (let i = start; i < arr.length; i++) { acc.push(arr[i]); combos(arr, k, i + 1, acc, out); acc.pop() }
  return out
}

// La compra más barata de TODO yendo a exactamente k lugares (null si no se puede)
export function mejorPlan(items: ItemPlan[], fuentes: string[], k: number): Plan | null {
  let best: Plan | null = null
  for (const c of combos(fuentes, k)) {
    const pl = planCon(items, c)
    if (pl.falta.length || pl.lugares.length < k) continue
    if (!best || pl.total < best.total) best = pl
  }
  return best
}

export interface Resumen {
  porLugares: (Plan | null)[]   // [_, 1 lugar, 2 lugares, 3 lugares]
  barato: Plan                  // lo recomendado
  unoPorTipo: Record<'mayorista' | 'cadena', { fuente: string; total: number } | null>
}

// Sumar otro lugar solo si ahorra al menos $1.000 o el 2%: ir a otro negocio cuesta tiempo y viaje
export function resumir(items: ItemPlan[], fuentes: { nombre: string; tipo: 'mayorista' | 'cadena' }[]): Resumen {
  const nombres = fuentes.map(f => f.nombre)
  const porLugares = [null, 1, 2, 3].map(k => (k ? mejorPlan(items, nombres, k) : null))
  let barato: Plan | null = null
  for (const p of porLugares) if (p && (!barato || barato.total - p.total >= Math.max(1000, barato.total * 0.02))) barato = p
  const unoPorTipo = { mayorista: null, cadena: null } as Resumen['unoPorTipo']
  for (const tipo of ['mayorista', 'cadena'] as const) {
    unoPorTipo[tipo] = fuentes
      .filter(f => f.tipo === tipo && !faltanEn(items, f.nombre).length)
      .map(f => ({ fuente: f.nombre, total: totalEn(items, f.nombre) }))
      .sort((a, b) => a.total - b.total)[0] ?? null
  }
  // si ninguna combinación de hasta 3 lugares tiene todo, se mezcla lo que haya (con faltantes a la vista)
  return { porLugares, barato: barato ?? planCon(items, nombres), unoPorTipo }
}

// Faltan cosas: el lugar que tiene más de lo que falta y, entre esos, el más barato
export function lugarParaFaltantes(falta: ItemPlan[], fuentes: string[]) {
  return fuentes
    .map(f => ({ fuente: f, cubre: falta.filter(it => precioEn(it, f)).length, total: falta.reduce((s, it) => s + precioEn(it, f) * it.q, 0) }))
    .filter(x => x.cubre)
    .sort((a, b) => b.cubre - a.cubre || a.total - b.total)[0] ?? null
}
