// Verificación UX integral con Chrome real — screenshots a scripts/shots/
// Uso: node scripts/verificar-ux.mjs
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'fs'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://localhost:3000'
const OUT = 'scripts/shots/'

mkdirSync(OUT, { recursive: true })

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' })
const resultados = []

try {
  // ── 1. MOBILE: rango de precios en detalle ──
  const movil = await browser.newPage()
  await movil.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true })
  await movil.goto(`${BASE}/?vista=detalle`, { waitUntil: 'networkidle2' })
  await sleep(1500)
  // Scroll hasta la sección de rango
  const rango = await movil.evaluate(() => {
    const headers = [...document.querySelectorAll('div')].filter(d => d.textContent === 'Rango de precios' && d.children.length === 0)
    if (!headers.length) return { encontrado: false }
    const h = headers[0]
    h.scrollIntoView({ block: 'center' })
    const barra = h.nextElementSibling
    const labels = [...barra.querySelectorAll('.tnum')].map(l => {
      const r = l.getBoundingClientRect()
      const visible = r.width > 0 && r.left >= 0 && r.right <= window.innerWidth
      const st = getComputedStyle(l)
      return { texto: l.textContent, left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), visible, opacity: st.opacity, display: st.display }
    })
    return { encontrado: true, viewportW: window.innerWidth, labels }
  })
  resultados.push({ test: 'rango-mobile', ...rango })
  await sleep(400)
  await movil.screenshot({ path: `${OUT}1-rango-mobile.png` })

  // ── 2. MOBILE: + Lista en Inicio (toast + agregado real) ──
  const inicio = await browser.newPage()
  await inicio.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true })
  await inicio.goto(BASE, { waitUntil: 'networkidle2' })
  await sleep(1500)
  const clickLista = await inicio.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Lista' && b.offsetParent !== null)
    if (!btns.length) return { encontrado: false }
    btns[0].click()
    return { encontrado: true }
  })
  await sleep(900)
  const postClick = await inicio.evaluate(() => {
    const toast = document.querySelector('[data-sonner-toast]')
    const listas = JSON.parse(localStorage.getItem('brujula_listas') || '[]')
    const items = listas.flatMap(l => l.items.map(i => ({ nombre: i.producto.nombre, precio: i.precioCompra, mayorista: i.mayorista, cantidad: i.cantidad })))
    return { toastVisible: !!toast, toastTexto: toast?.textContent ?? null, itemsEnLista: items }
  })
  resultados.push({ test: 'mas-lista-inicio', ...clickLista, ...postClick })
  await inicio.screenshot({ path: `${OUT}2-toast-inicio.png` })

  // ── 3. Mi Lista: números coherentes ──
  await inicio.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Lista' && b.offsetParent !== null)
    btns[1]?.click() // segundo deal también
  })
  await sleep(600)
  await inicio.goto(`${BASE}/?vista=herramientas`, { waitUntil: 'networkidle2' })
  await sleep(1500)
  const numerosLista = await inicio.evaluate(() => {
    const body = document.body.innerText
    const listas = JSON.parse(localStorage.getItem('brujula_listas') || '[]')
    const items = listas.flatMap(l => l.items)
    // Recalcular a mano el total esperado: mejor precio × cantidad
    let totalEsperado = 0
    for (const it of items) {
      const validos = it.producto.precios.filter(p => p.precio > 0)
      if (!validos.length) continue
      totalEsperado += Math.min(...validos.map(p => p.precio)) * (it.cantidad ?? 1)
    }
    return { totalEsperado: Math.round(totalEsperado * 100) / 100, textoVista: body.slice(0, 1200) }
  })
  resultados.push({ test: 'numeros-lista', ...numerosLista })
  await inicio.screenshot({ path: `${OUT}3-lista-mobile.png` })

  // ── 4. DESKTOP: filtros del catálogo ──
  const desk = await browser.newPage()
  await desk.setViewport({ width: 1280, height: 800 })
  await desk.goto(`${BASE}/?vista=catalogo`, { waitUntil: 'networkidle2' })
  await sleep(1500)
  const filtros = await desk.evaluate(async () => {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms))
    const out = {}
    const precios = () => [...document.querySelectorAll('.cat-grid .tnum')].map(e => e.textContent).filter(t => t.includes('$')).slice(0, 4)
    out.antesOrden = precios()
    // Ordenar → Menor precio
    const chips = [...document.querySelectorAll('.cat-filters button')]
    chips.find(b => b.textContent.includes('Ordenar'))?.click()
    await sleep(300)
    ;[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Menor precio')?.click()
    await sleep(600)
    out.despuesMenorPrecio = precios()
    // Solo comparables
    const meta = () => document.querySelector('.cat-meta span')?.textContent
    out.totalAntesComparables = meta()
    ;[...document.querySelectorAll('.cat-filters button')].find(b => b.textContent.includes('Solo comparables'))?.click()
    await sleep(600)
    out.totalConComparables = meta()
    // Favoritos (vacío → empty state)
    ;[...document.querySelectorAll('.cat-filters button')].find(b => b.textContent.includes('Favoritos'))?.click()
    await sleep(600)
    out.emptyFavoritos = document.body.innerText.includes('Todavía no tenés favoritos')
    return out
  })
  resultados.push({ test: 'filtros-catalogo', ...filtros })
  await desk.screenshot({ path: `${OUT}4-filtros-desktop.png` })
} finally {
  await browser.close()
}

console.log(JSON.stringify(resultados, null, 2))
