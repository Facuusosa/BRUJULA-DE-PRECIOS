// Prueba de la cuenta de Mi Lista con la lista real de la maqueta P3 (precios del 12/10/2026).
// Correr: node --experimental-strip-types lib/plan-compra.check.mts
import assert from 'node:assert/strict'
import { planCon, resumir, lugarParaFaltantes, faltanEn, type ItemPlan } from './plan-compra.ts'

const ITEMS: ItemPlan[] = [{"id": "0", "nombre": "Fernet Branca 750 ml", "q": 6, "p": {"maxicarrefour": 17575.0, "maxiconsumo": 17599.9, "nini": 18709.005, "coto": 19700.0, "carrefour": 19700.0, "dia": 19700.0, "masonline": 19699.0, "jumbo": 19700.0}}, {"id": "1", "nombre": "Aceite Cocinero 1,5 L", "q": 12, "p": {"yaguar": 4999.0, "maxicarrefour": 5699.0, "maxiconsumo": 5149.89, "nini": 6259.076, "coto": 6925.0, "carrefour": 6925.0, "dia": 6925.0, "masonline": 5889.65, "jumbo": 5550.0}}, {"id": "2", "nombre": "Coca-Cola 2,25 L", "q": 6, "p": {"yaguar": 4700.0, "maxicarrefour": 4425.0, "coto": 5100.0, "carrefour": 6000.0, "dia": 6000.0, "masonline": 5999.0, "jumbo": 4447.5}}, {"id": "3", "nombre": "Yerba Playadito 1 kg", "q": 10, "p": {"yaguar": 4199.0, "maxicarrefour": 4199.0, "maxiconsumo": 3799.9, "nini": 4469.365, "coto": 5250.0, "carrefour": 5209.0, "dia": 4190.0, "masonline": 5289.0, "jumbo": 5208.0}}, {"id": "4", "nombre": "Arroz Gallo Oro 1 kg", "q": 10, "p": {"yaguar": 1769.0, "maxicarrefour": 2175.0, "nini": 2318.953, "coto": 1937.0, "carrefour": 2979.0, "dia": 2980.0, "masonline": 2979.0, "jumbo": 3000.0}}]
const FUENTES = [{"nombre": "yaguar", "tipo": "mayorista"}, {"nombre": "maxicarrefour", "tipo": "mayorista"}, {"nombre": "maxiconsumo", "tipo": "mayorista"}, {"nombre": "nini", "tipo": "mayorista"}, {"nombre": "coto", "tipo": "cadena"}, {"nombre": "carrefour", "tipo": "cadena"}, {"nombre": "dia", "tipo": "cadena"}, {"nombre": "masonline", "tipo": "cadena"}, {"nombre": "jumbo", "tipo": "cadena"}] as const

const r = resumir(ITEMS, [...FUENTES])
const $ = (n: number) => Math.round(n)

// los números que Facu vio en la maqueta
assert.equal($(r.porLugares[1]!.total), 264128)
assert.deepEqual(r.porLugares[1]!.lugares, ['maxicarrefour'])
assert.equal($(r.porLugares[2]!.total), 249476)
assert.deepEqual([...r.porLugares[2]!.lugares].sort(), ['maxiconsumo', 'yaguar'])
assert.equal($(r.porLugares[3]!.total), 247677)
// la 3ª parada ahorra $1.799 < $1.000 o 2% ($4.989): lo recomendado son 2 lugares
assert.equal(r.barato, r.porLugares[2])
assert.equal(r.unoPorTipo.mayorista!.fuente, 'maxicarrefour')
assert.equal($(r.unoPorTipo.cadena!.total), 293565)   // Jumbo, como en la maqueta v4

// bug "todo en Nini": Nini no tiene Coca ni Arroz -> nunca un total "todo ahí", los faltantes a la vista
const nini = planCon(ITEMS, ['nini'])
assert.equal(nini.falta.length, 1)                     // Coca-Cola (Arroz sí está)
assert.equal(faltanEn(ITEMS, 'nini').map(i => i.nombre).join(), 'Coca-Cola 2,25 L')
assert.equal(lugarParaFaltantes(nini.falta, FUENTES.map(f => f.nombre))!.fuente, 'maxicarrefour')

// "comprar en otro lado": la elección del usuario manda aunque sea más cara
const yo = planCon(ITEMS, ['yaguar', 'maxiconsumo', 'coto'], { '4': 'coto' })
assert.equal(yo.asig.find(a => a.item.id === '4')!.fuente, 'coto')
assert.equal(yo.asig.find(a => a.item.id === '4')!.elegidoPorVos, true)

// sin lugares: todo falta, total 0
assert.equal(planCon(ITEMS, []).falta.length, 5)

console.log('plan-compra OK')
