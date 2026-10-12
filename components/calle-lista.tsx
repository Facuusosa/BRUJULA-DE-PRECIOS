'use client'

// La calle de Mi Lista (maqueta P3 aprobada por Facu 12/10/2026, artifact EHZLt5jZhd8…).
// El carrito sale de TU NEGOCIO y recorre las paradas en el orden de la calle; en cada local
// el que te atiende (delantal y gorra del color de la marca) te tira tus productos al carrito.
// Los locales que no se usan muestran cuántos productos tienen ("4/5"). Al terminar, la cámara
// se aleja para ver el recorrido entero. Tocar un local = qué tiene + "Voy / No voy".

import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { FUENTES } from '@/lib/data'
import { crearKit, cargarImg, primeraFoto, liberarEscena, fmt, clamp, suave } from '@/lib/calle-3d'
import { faltanEn, totalEn, type ItemPlan, type Plan } from '@/lib/plan-compra'

export interface CalleListaControl { enfocar: (fuente: string) => void }

interface Props {
  plan: Plan
  items: ItemPlan[]
  fotos: Record<string, string[]>   // producto -> fotos en orden de preferencia
  seleccionados: string[]
  control: MutableRefObject<CalleListaControl | null>
  onAlternar: (fuente: string) => void
}

// lugar en la calle de cada local (x) y fila (z): súper adelante, galpones atrás, intercalados
const POS: Record<string, [number, number]> = {
  negocio: [-7.4, -1.7], Coto: [-4.6, -1.7], Yaguar: [-3.2, -4.1], Carrefour: [-1.8, -1.7], MaxiCarrefour: [0.1, -4.1],
  Dia: [1.0, -1.7], Maxiconsumo: [3.2, -4.1], Masonline: [3.8, -1.7], Nini: [6.4, -4.1], Jumbo: [6.6, -1.7],
}

export default function CalleLista(props: Props) {
  const { plan, items } = props
  const box = useRef<HTMLDivElement>(null)
  const carga = useRef<HTMLSpanElement>(null)
  const ultimas = useRef(props)
  ultimas.current = props
  const mundo = useRef<{ plan: () => void } | null>(null)
  const [gen, setGen] = useState(0)
  const [sinGL, setSinGL] = useState(false)
  const [paso, setPaso] = useState<React.ReactNode>('Saliendo de tu negocio')
  const [otra, setOtra] = useState(false)
  const [info, setInfo] = useState<string | null>(null)
  const repetir = useRef<() => void>(() => {})

  const claveItems = items.map(it => it.id).join('|')
  const clavePlan = plan.asig.map(a => `${a.item.id}:${a.fuente}:${a.item.q}`).join('|')

  useEffect(() => {
    const el = box.current
    if (!el) return
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
    const FAM = getComputedStyle(document.body).fontFamily || 'sans-serif'
    const ITEMS = ultimas.current.items
    const cv = document.createElement('canvas')
    el.prepend(cv)
    const corte = new AbortController()
    let vivo = true, raf = 0
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true })
    } catch {
      cv.remove()
      setSinGL(true)
      return
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
    const scene = new THREE.Scene()
    let ajustar: (() => void) | null = null
    const ro = new ResizeObserver(() => ajustar?.())

    const armar = async () => {
      await Promise.all([document.fonts.load(`700 124px ${FAM}`), document.fonts.load(`600 44px ${FAM}`)]).catch(() => null)
      const logos: Record<string, HTMLImageElement | null> = {}
      await Promise.all(FUENTES.map(async f => { logos[f.nombre] = await cargarImg(f.logo, false) }))
      const imgs = await Promise.all(ITEMS.map(it => primeraFoto(ultimas.current.fotos[it.id] ?? [])))
      if (!vivo) return

      const K = crearKit(renderer, FAM)
      const fotos = imgs.map(im => (im ? { t: K.tex(K.sinFondo(im)), a: im.width / im.height } : null))
      const cam = new THREE.PerspectiveCamera(32, 1, 0.5, 120)
      const { sol } = K.barrio(scene, 16, { left: -10, right: 10, top: 8, bottom: -8 }, [14, 32])

      const tocables: THREE.Object3D[] = []
      { // tu negocio: punto de salida
        const [x, z] = POS.negocio, g = new THREE.Group(), alto = 0.9
        const casa = new THREE.Mesh(new THREE.BoxGeometry(1.1, alto, 0.9), K.blanco); casa.position.y = alto / 2; casa.castShadow = casa.receiveShadow = true; g.add(casa)
        const tech = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.0), K.negro); tech.position.y = alto + 0.05; g.add(tech)
        const tol = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.32), new THREE.MeshStandardMaterial({ map: K.tex(K.rayasCanvas('#15803d')), roughness: 0.8 })); tol.position.set(0, alto - 0.3, 0.58); tol.rotation.x = 0.4; tol.castShadow = true; g.add(tol)
        const vid = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.28), K.vidrio); vid.position.set(-0.15, 0.34, 0.452); g.add(vid)
        const pu = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.4), K.negro); pu.position.set(0.35, 0.2, 0.453); g.add(pu)
        const [c, k] = K.lienzo(512, 200); k.fillStyle = '#1a1a1a'; k.fillRect(0, 0, 512, 200); k.fillStyle = '#fff'; k.textAlign = 'center'; k.font = K.fuente(700, 84); k.fillText('TU NEGOCIO', 256, 130)
        const cart = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.43), new THREE.MeshBasicMaterial({ map: K.tex(c) })); cart.position.set(0, alto + 0.42, 0.15); cart.rotation.x = -0.28; g.add(cart)
        for (const s of [-1, 1]) { const pp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), K.negro); pp.position.set(s * 0.35, alto + 0.15, 0.15); g.add(pp) }
        g.position.set(x, 0, z); scene.add(g)
      }

      // el que te atiende: delantal y gorra del color de la marca
      const vendedor = (marca: number) => {
        const g = new THREE.Group(), m = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })
        const piel = m(0xd9a77f), pant = m(0x2b2b2b), rem = m(0xf4f2ee), del = m(marca)
        const caja = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); b.position.set(x, y, z); b.castShadow = true; g.add(b); return b }
        caja(0.06, 0.24, 0.07, pant, -0.045, 0.12, 0); caja(0.06, 0.24, 0.07, pant, 0.045, 0.12, 0)
        caja(0.2, 0.26, 0.12, rem, 0, 0.37, 0)
        caja(0.17, 0.22, 0.015, del, 0, 0.33, 0.066)
        const cab = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), piel); cab.position.y = 0.58; cab.castShadow = true; g.add(cab)
        const gorra = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.078, 0.04, 16), del); gorra.position.y = 0.64; g.add(gorra)
        caja(0.1, 0.012, 0.07, del, 0, 0.625, 0.08)
        caja(0.04, 0.2, 0.05, rem, -0.125, 0.38, 0)
        const hombro = new THREE.Group(); hombro.position.set(0.125, 0.48, 0); g.add(hombro)
        const br = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.05), rem); br.position.y = -0.1; br.castShadow = true; hombro.add(br)
        const mano = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), piel); mano.position.y = -0.21; hombro.add(mano)
        g.scale.setScalar(1.7)
        return { g, brazo: hombro }
      }

      const pinCanvas = (n: number) => {
        const [c, g] = K.lienzo(128, 128)
        g.fillStyle = '#15803d'; g.beginPath(); g.arc(64, 56, 50, 0, Math.PI * 2); g.fill()
        g.beginPath(); g.moveTo(40, 92); g.lineTo(88, 92); g.lineTo(64, 124); g.closePath(); g.fill()
        g.lineWidth = 8; g.strokeStyle = '#fff'; g.beginPath(); g.arc(64, 56, 46, 0, Math.PI * 2); g.stroke()
        g.fillStyle = '#fff'; g.font = K.fuente(700, 64); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 64, 60)
        return c
      }

      type Local = {
        nombre: string; may: boolean; g: THREE.Group; mat: THREE.MeshBasicMaterial; pin: THREE.Sprite; anillo: THREE.Mesh; ramal: THREE.Mesh
        alto: number; x: number; pop: number; texs: Record<string, THREE.Texture>; ven: THREE.Group; brazo: THREE.Group; tiro: number; vx: number; vz: number
      }
      const locales: Record<string, Local> = {}
      for (const f of FUENTES) {
        const pos = POS[f.nombre]; if (!pos) continue
        const [x, z] = pos, may = f.tipo === 'mayorista'
        const alto = may ? 1.1 : 0.95 + ((Math.round(x * 3) % 3) + 3) % 3 * 0.12
        const l = may ? K.galpon(logos[f.nombre]) : K.supermercado(logos[f.nombre], alto)
        const { cart, mat } = K.cartelColgado(l.g, alto, may ? 0.88 : 0.66, may ? 0.45 : 0.3, 1.0, 0.78)
        const pin = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false })); pin.scale.set(0.5, 0.5, 1); pin.position.set(0, alto + 1.6, 0.2); pin.renderOrder = 5; pin.visible = false; l.g.add(pin)
        // anillo verde en la vereda frente a cada parada, y el ramal hasta la puerta
        const anillo = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 40), new THREE.MeshBasicMaterial({ color: 0x15803d, transparent: true, opacity: 0.9, depthWrite: false })); anillo.rotation.x = -Math.PI / 2; anillo.position.set(x, 0.016, 0.4); anillo.visible = false; scene.add(anillo)
        const ramal = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1), new THREE.MeshBasicMaterial({ color: 0x15803d })); ramal.rotation.x = -Math.PI / 2; ramal.visible = false; scene.add(ramal)
        const zIni = 0.1, zFin = z + l.frente; ramal.scale.y = zIni - zFin; ramal.position.set(x, 0.015, (zIni + zFin) / 2)
        l.cuerpo.userData.f = cart.userData.f = f.nombre; tocables.push(l.cuerpo, cart)
        l.g.position.set(x, 0, z); scene.add(l.g)
        const vz = -0.72, ven = vendedor(l.marca); ven.g.position.set(x, 0, vz); ven.g.visible = false; scene.add(ven.g)
        locales[f.nombre] = { nombre: f.nombre, may, g: l.g, mat, pin, anillo, ramal, alto, x, pop: 0, texs: {}, ven: ven.g, brazo: ven.brazo, tiro: 1, vx: x, vz }
      }

      // camino verde pintado sobre la calle (crece mientras avanza el carrito)
      const camino = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: 0x15803d })); camino.rotation.x = -Math.PI / 2; camino.position.set(0, 0.014, 0.4); scene.add(camino)
      const { g: carro, ruedas } = K.carrito(); carro.position.set(POS.negocio[0], 0, 0.42); scene.add(carro)
      // los productos ya cargados viven adentro del carrito
      const enCarro = ITEMS.map((_, i) => {
        const f = fotos[i]; if (!f) return null
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: f.t, transparent: true })), h = 0.62
        sp.scale.set(h * f.a, h, 1); sp.position.set(-0.22 + (i % 2) * 0.44, 0.45 + h / 2 - 0.05, -0.38 + Math.floor(i / 2) * 0.38 % 1.2); sp.visible = false; carro.add(sp); return sp
      })
      type Vuelo = { sp: THREE.Sprite; i: number; u: number; de: THREE.Vector3; sub: number }
      const volando: Vuelo[] = []

      // ---------- estado del recorrido
      type Parada = { f: string; asig: Plan['asig'] }
      let paradas: Parada[] = [], fase: 'quieto' | 'manejar' | 'cargar' | 'listo' = 'quieto', idx = 0, t = 0, desde = 0, hasta = 0
      let total = 0, cargaVis = 0, porCargar: Plan['asig'] = [], rebote = 0, ahora = 0
      let camX = POS.negocio[0], camLejos = 0, foco: string | null = null, focoT = 0, prevX = carro.position.x, lean = 0, intro = 0
      const textoLocal = (L: Local, modo: 'parada' | 'normal', texto: string) => {
        const k = modo + texto
        if (!L.texs[k]) L.texs[k] = K.tex(K.cartelCanvas(logos[L.nombre], texto, modo === 'parada' ? '#15803d' : null, L.may ? 'mayorista' : undefined))
        return L.texs[k]
      }
      const pinTex: THREE.Texture[] = []
      const aplicarPlan = () => {
        const pl = ultimas.current.plan
        paradas = pl.lugares.slice().sort((a, b) => (POS[a]?.[0] ?? 0) - (POS[b]?.[0] ?? 0)).map(f => ({ f, asig: pl.asig.filter(a => a.fuente === f) }))
        for (const k in locales) {
          const L = locales[k], i = paradas.findIndex(p => p.f === k)
          if (i >= 0) {
            L.mat.map = textoLocal(L, 'parada', fmt(paradas[i].asig.reduce((s, a) => s + a.precio * a.item.q, 0)))
            L.pin.material.map = pinTex[i] || (pinTex[i] = K.tex(pinCanvas(i + 1))); L.pin.material.needsUpdate = true
            L.pin.visible = L.anillo.visible = L.ramal.visible = L.ven.visible = true; L.ven.rotation.y = 0
          } else {
            const its = ultimas.current.items
            L.mat.map = textoLocal(L, 'normal', `${its.length - faltanEn(its, k).length}/${its.length}`)
            L.pin.visible = L.anillo.visible = L.ramal.visible = L.ven.visible = false
          }
          L.mat.needsUpdate = true
        }
        total = pl.total
      }
      const nombreDe = (id: string) => ITEMS.find(i => i.id === id)?.nombre ?? ''
      const terminar = () => {
        fase = 'listo'; setOtra(true); camLejos = 1
        setPaso(<><b>Listo:</b> {paradas.length === 1 ? '1 lugar' : `${paradas.length} lugares`}</>)
      }
      let cargadoTotal = 0
      const arrancar = () => {
        aplicarPlan(); foco = null; camLejos = 0
        enCarro.forEach(s => { if (s) s.visible = false }); volando.forEach(v => scene.remove(v.sp)); volando.length = 0
        cargadoTotal = cargaVis = 0; idx = 0; t = 0; desde = POS.negocio[0]
        carro.position.x = desde; prevX = desde; setOtra(false)
        if (!paradas.length) { fase = 'listo'; setPaso('Elegí al menos un lugar'); despertar(); return }
        hasta = POS[paradas[0].f][0]
        fase = 'manejar'; setPaso(<>Saliendo de <b>tu negocio</b></>)
        if (RM) { // sin animaciones: el final directo
          paradas.forEach(p => p.asig.forEach(a => { const i = ITEMS.findIndex(it => it.id === a.item.id); if (enCarro[i]) enCarro[i]!.visible = true }))
          carro.position.x = POS[paradas[paradas.length - 1].f][0]; cargadoTotal = cargaVis = total; terminar()
        }
        despertar()
      }
      repetir.current = arrancar

      const actualizar = (dt: number) => {
        let quieto = true
        if (intro < 1) { intro = Math.min(1, intro + dt / 2.2); quieto = false }
        if (fase === 'manejar') {
          quieto = false; t += dt
          const dur = Math.max(0.7, Math.abs(hasta - desde) * 0.3), u = Math.min(1, t / dur)
          carro.position.x = desde + (hasta - desde) * suave(u)
          if (u >= 1) {
            fase = 'cargar'; t = 0; porCargar = paradas[idx].asig.slice(); locales[paradas[idx].f].pop = 1
            setPaso(<>Parada {idx + 1} de {paradas.length} · <b>{paradas[idx].f}</b></>)
          }
        } else if (fase === 'cargar') {
          quieto = false; t += dt
          if (porCargar.length && t > (RM ? 0.05 : 0.6)) {
            t = 0
            const a = porCargar.shift()!, i = ITEMS.findIndex(it => it.id === a.item.id), L = locales[paradas[idx].f], f = fotos[i]
            if (f) {
              const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: f.t, transparent: true, depthTest: false })); sp.renderOrder = 6
              sp.scale.set(0.5 * f.a, 0.5, 1); scene.add(sp)
              L.tiro = 0; L.ven.rotation.y = Math.atan2(carro.position.x - L.vx, carro.position.z - L.vz)
              volando.push({ sp, i, u: RM ? 0 : -0.5, de: new THREE.Vector3(L.vx, 1.17, L.vz), sub: a.precio * a.item.q })
            } else cargadoTotal += a.precio * a.item.q
            setPaso(<>Parada {idx + 1} de {paradas.length} · <b>{paradas[idx].f}</b><br />cargando {nombreDe(a.item.id)} ×{a.item.q}</>)
          }
          if (!porCargar.length && !volando.length && t > 0.35) {
            idx++
            if (idx < paradas.length) { fase = 'manejar'; t = 0; desde = carro.position.x; hasta = POS[paradas[idx].f][0]; setPaso(<>Yendo a <b>{paradas[idx].f}</b></>) }
            else terminar()
          }
        }
        // productos en el aire: arco desde la mano del que atiende hasta el carrito
        for (let j = volando.length - 1; j >= 0; j--) {
          const v = volando[j]; v.u = Math.min(1, v.u + dt / 0.6); quieto = false
          const a = new THREE.Vector3(carro.position.x, 0.75, carro.position.z), u = Math.max(0, v.u)
          v.sp.position.lerpVectors(v.de, a, u); v.sp.position.y += Math.sin(Math.PI * u) * 1.5
          v.sp.material.rotation = Math.sin(u * Math.PI * 2) * 0.35
          if (u >= 1) { scene.remove(v.sp); v.sp.material.dispose(); volando.splice(j, 1); if (enCarro[v.i]) enCarro[v.i]!.visible = true; cargadoTotal += v.sub; rebote = 1 }
        }
        // ruedas, inclinación y rebote del carrito al recibir cada producto
        const dx = carro.position.x - prevX; prevX = carro.position.x
        ruedas.forEach(w => { w.rotation.x -= dx / (0.1 * 0.6) })
        const leanT = RM ? 0 : clamp(dx / Math.max(dt, 0.001) * 0.035, -0.1, 0.1); lean += (leanT - lean) * (1 - Math.exp(-dt * 10)); carro.rotation.z = -lean
        if (Math.abs(lean) > 0.001) quieto = false
        if (rebote > 0.001) { rebote *= Math.exp(-dt * 7); carro.position.y = Math.abs(Math.sin((1 - rebote) * Math.PI * 3)) * 0.08 * rebote; quieto = false } else carro.position.y = 0
        camino.scale.x = Math.max(0.001, carro.position.x - POS.negocio[0]); camino.position.x = POS.negocio[0] + camino.scale.x / 2
        // el número "en el carrito" sube con cada producto
        if (Math.abs(cargadoTotal - cargaVis) > 1) { cargaVis += (cargadoTotal - cargaVis) * (1 - Math.exp(-dt * 8)); quieto = false } else cargaVis = cargadoTotal
        if (carga.current) carga.current.textContent = fmt(cargaVis)
        for (const k in locales) {
          const L = locales[k]
          // brazo: lleva atrás, tira, vuelve (el producto sale de la mano justo al soltar)
          if (L.tiro < 1) { L.tiro = Math.min(1, L.tiro + dt / 0.55); const u = L.tiro; L.brazo.rotation.x = u < 0.4 ? 2.6 * suave(u / 0.4) : u < 0.6 ? 2.6 - 3.9 * suave((u - 0.4) / 0.2) : -1.3 * (1 - suave((u - 0.6) / 0.4)); quieto = false }
          if (L.pop > 0.001) { L.pop *= Math.exp(-dt * 4.5); L.g.scale.setScalar(1 + 0.07 * Math.sin((1 - L.pop) * Math.PI * 3) * L.pop); quieto = false } else L.g.scale.setScalar(1)
          if (L.pin.visible) L.pin.position.y = L.alto + 1.6 + (RM ? 0 : Math.sin(ahora / 450 + L.x) * 0.06)
        }
        // cámara: sigue al carrito; al terminar se aleja para ver todo; si tocás una parada, va hasta ahí
        let objX = carro.position.x, alejar = 0
        if (fase === 'listo' && paradas.length) { const xs = [POS.negocio[0], ...paradas.map(p => POS[p.f][0])]; objX = (Math.min(...xs) + Math.max(...xs)) / 2; alejar = clamp((Math.max(...xs) - Math.min(...xs)) / 12, 0.3, 1) }
        if (foco) { objX = POS[foco][0]; alejar = 0; focoT -= dt; if (focoT <= 0) foco = null }
        const kc = RM ? 1 : 1 - Math.exp(-dt * 3.2)
        camX += (objX - camX) * kc; camLejos += (alejar - camLejos) * kc
        if (Math.abs(objX - camX) > 0.002 || Math.abs(alejar - camLejos) > 0.002) quieto = false
        const e = 1 - Math.pow(1 - intro, 3), lej = camLejos
        const pos = new THREE.Vector3(camX + 0.35, 7.2 + lej * 2.6, 8.2 + lej * 3.4), mira = new THREE.Vector3(camX, 0.55, -2.5 - lej * 0.4)
        cam.position.set(pos.x, 13 + (pos.y - 13) * e, 13 + (pos.z - 13) * e); cam.lookAt(mira.x, 0.2 + (mira.y - 0.2) * e, mira.z)
        sol.position.set(camX - 5, 11, 7); sol.target.position.set(camX, 0, -1)
        return quieto
      }

      // ---------- render a demanda: solo dibuja mientras algo se mueve y se ve
      let corriendo = false, ultimo = 0, visible = false, primera = true
      const loop = (ts: number) => {
        if (!vivo) return
        const dt = Math.min(0.05, (ts - ultimo) / 1000 || 0.016); ultimo = ts; ahora = ts
        const quieto = actualizar(dt)
        renderer.render(scene, cam)
        if (visible && !quieto) raf = requestAnimationFrame(loop); else corriendo = false
      }
      const despertar = () => { if (!corriendo && visible) { corriendo = true; ultimo = performance.now(); raf = requestAnimationFrame(loop) } }
      ajustar = () => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); renderer.render(scene, cam) }
      ro.observe(el)
      const io = new IntersectionObserver(es => {
        visible = es[0].isIntersecting
        if (visible && primera) { primera = false; arrancar() }
        despertar()
      }, { threshold: 0.25 })
      io.observe(el)
      corte.signal.addEventListener('abort', () => io.disconnect())

      // tocar un local: qué tiene y "voy / no voy"
      const rayo = new THREE.Raycaster(), ndc = new THREE.Vector2()
      let abajo: [number, number] | null = null
      el.addEventListener('pointerdown', e => { abajo = [e.clientX, e.clientY] }, { signal: corte.signal })
      cv.addEventListener('pointerup', e => {
        if (!abajo || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 8) return
        const rc = cv.getBoundingClientRect()
        ndc.set((e.clientX - rc.left) / rc.width * 2 - 1, -((e.clientY - rc.top) / rc.height) * 2 + 1); cam.updateMatrixWorld(); rayo.setFromCamera(ndc, cam)
        const h = rayo.intersectObjects(tocables)[0]
        if (h) { const f = h.object.userData.f as string; locales[f].pop = 1; setInfo(f); if (navigator.vibrate) navigator.vibrate(8); despertar() }
      }, { signal: corte.signal })

      mundo.current = { plan: () => { if (!primera) arrancar(); else aplicarPlan(); despertar() } }
      ultimas.current.control.current = {
        enfocar: f => {
          if (!locales[f]) return
          foco = f; focoT = 3.2; locales[f].pop = 1; despertar()
          el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'nearest' })
        },
      }
      cv.addEventListener('webglcontextlost', e => e.preventDefault(), { signal: corte.signal })
      cv.addEventListener('webglcontextrestored', () => setGen(g => g + 1), { signal: corte.signal })
      ajustar(); aplicarPlan(); renderer.render(scene, cam)
    }

    armar()
    return () => {
      vivo = false
      cancelAnimationFrame(raf)
      corte.abort()
      ro.disconnect()
      mundo.current = null
      ultimas.current.control.current = null
      liberarEscena(scene)
      renderer.dispose()
      renderer.forceContextLoss()
      cv.remove()
    }
    // se rearma si cambian los productos de la lista (o si el navegador perdió el 3D)
  }, [gen, claveItems])

  // cambió dónde se compra algo (o cuánto): el carrito vuelve a hacer el recorrido
  useEffect(() => { mundo.current?.plan() }, [clavePlan])

  // el globito del local tocado se cierra solo a los 6 segundos (a Facu le molestaba fijo)
  useEffect(() => {
    if (!info) return
    const t = setTimeout(() => setInfo(null), 6000)
    return () => clearTimeout(t)
  }, [info])

  if (sinGL) return <div className="ml-escena ml-cargando">Tu navegador no muestra 3D. La lista de abajo funciona igual.</div>

  const f = info ? FUENTES.find(x => x.nombre === info) : null
  const falta = info ? faltanEn(items, info) : []
  const va = info ? props.seleccionados.includes(info) : false

  return (
    <div ref={box} className="ml-escena cl">
      <style>{`
        .cl { touch-action: pan-y; cursor: pointer; overflow: hidden; }
        .cl canvas { display: block; width: 100%; height: 100%; }
        .cl .hud { position: absolute; left: 12px; top: 12px; right: 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; pointer-events: none; z-index: 2; }
        .cl .pild { background: rgba(255,255,255,.94); border-radius: 12px; padding: 7px 11px; box-shadow: 0 2px 10px rgba(0,0,0,.1); font-size: 13px; line-height: 1.3; color: var(--ink); }
        .cl .pild b { font-weight: 600; }
        .cl .carga { text-align: right; }
        .cl .carga .g { font-size: 17px; font-weight: 700; display: block; }
        .cl .otra { position: absolute; right: 12px; bottom: 12px; border: none; background: var(--ink); color: #fff; border-radius: 999px; padding: 9px 14px; font: 500 13px var(--font-sans); cursor: pointer; z-index: 2; }
        .cl .toque { position: absolute; left: 12px; right: 12px; bottom: 56px; z-index: 3; background: rgba(255,255,255,.97); border-radius: 14px; padding: 10px 36px 10px 12px; box-shadow: 0 6px 20px rgba(0,0,0,.16); font-size: 13.5px; line-height: 1.4; color: var(--ink); cursor: default; }
        .cl .toque b { font-weight: 600; }
        .cl .toque .cerrar { position: absolute; top: 4px; right: 4px; width: 32px; height: 32px; border: none; background: none; font-size: 20px; line-height: 1; cursor: pointer; color: var(--gray); }
        .cl .toque .ml-mini { margin-top: 8px; display: inline-block; }
      `}</style>
      <div className="hud">
        <span className="pild">{paso}</span>
        <span className="pild carga"><span>En el carrito</span><span ref={carga} className="g tnum">$0</span></span>
      </div>
      {otra && <button className="otra" onClick={() => repetir.current()}>Ver el recorrido otra vez</button>}
      {info && f && (
        <div className="toque" role="status">
          <button className="cerrar" aria-label="Cerrar" onClick={() => setInfo(null)}>×</button>
          <b>{f.nombre}</b> · {f.tipo === 'mayorista' ? 'mayorista' : 'súper'}<br />
          {falta.length
            ? <>Tiene {items.length - falta.length} de {items.length}: le falta {falta.map(z => z.nombre).join(', ')}.</>
            : <>Tiene los {items.length}. Todo ahí: <b className="tnum">{fmt(totalEn(items, f.nombre))}</b>.</>}
          <br />
          <button className="ml-mini" onClick={() => { props.onAlternar(f.nombre); setInfo(null) }}>{va ? 'No voy a este lugar' : 'Voy a este lugar'}</button>
        </div>
      )}
    </div>
  )
}
