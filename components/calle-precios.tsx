'use client'

// La calle de "Elegí tu precio" (maqueta aprobada por Facu 12/10/2026, artifact ATUY5Uk985…).
// Un mercado por súper parado en su precio, los mayoristas como galpones atrás, y el carrito
// = tu precio de venta. Se toca un mercado/la calle (el carrito va solo) o se arrastra con
// inercia e imanes. Render a demanda: solo dibuja mientras algo se mueve.

import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { crearKit, cargarImg, primeraFoto, liberarEscena, fmt, clamp } from '@/lib/calle-3d'

export interface FuenteCalle { nombre: string; precio: number; logo: string }
export interface CalleControl { ir: (p: number) => void }

interface Props {
  costo: number
  cadenas: FuenteCalle[]      // ordenadas de menor a mayor
  mayoristas: FuenteCalle[]
  productoImg: string[]       // foto principal + alternativas, en orden de preferencia
  min: number
  max: number
  imanes: number[]
  inicial: number
  control: MutableRefObject<CalleControl | null>
  onValor: (v: number, quieto: boolean) => void
}

const W = 12
const FRIC = 3.4

// motor: arrastre con inercia, resorte e imanes en cada precio
class Motor {
  v: number; vel = 0; target: number | null = null; drag = false; idle = true; k = 220; z = 0.7
  constructor(public min: number, public max: number, public imanes: number[], v: number) { this.v = v }
  get r() { return this.max - this.min }
  ir(t: number, suave: boolean) { this.target = clamp(t, this.min, this.max); this.idle = false; this.k = suave ? 32 : 220; this.z = suave ? 1 : 0.7 }
  lanzar(vel: number) {
    this.vel = vel; this.idle = false; this.target = null; this.k = 220; this.z = 0.7
    const fin = clamp(this.v + vel / FRIC, this.min, this.max)
    let best: number | null = null
    for (const p of this.imanes) if (best === null || Math.abs(p - fin) < Math.abs(best - fin)) best = p
    if (best !== null && Math.abs(best - fin) < this.r * 0.045) this.target = best
    else if (fin <= this.min || fin >= this.max) this.target = fin
  }
  paso(dt: number) {
    if (this.drag || this.idle) return
    const r = this.r
    if (this.target === null) {
      this.v += this.vel * dt; this.vel *= Math.exp(-dt * FRIC)
      if (this.v < this.min || this.v > this.max) { this.target = clamp(this.v, this.min, this.max); return }
      if (Math.abs(this.vel) < r * 0.004) { this.vel = 0; this.idle = true }
    } else {
      const c = 2 * Math.sqrt(this.k) * this.z, a = this.k * (this.target - this.v) - c * this.vel
      this.vel += a * dt; this.v += this.vel * dt
      if (Math.abs(this.target - this.v) < r * 0.0006 && Math.abs(this.vel) < r * 0.003) { this.v = this.target; this.vel = 0; this.target = null; this.idle = true }
    }
  }
}

export default function CallePrecios(props: Props) {
  const { cadenas, min, max } = props
  const box = useRef<HTMLDivElement>(null)
  const hud = useRef<HTMLSpanElement>(null)
  const ultimas = useRef(props)
  ultimas.current = props
  const [gen, setGen] = useState(0)   // sube si el navegador pierde el 3D: se rearma de cero
  const [sinGL, setSinGL] = useState(false)
  const [usado, setUsado] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const { costo, mayoristas, productoImg, imanes, inicial, control } = ultimas.current
    const REF = cadenas
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches
    const FAM = getComputedStyle(document.body).fontFamily || 'sans-serif'
    // canvas nuevo en cada montaje: reusar uno al que ya se le cortó el 3D lo deja muerto
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
    const motor = new Motor(min, max, imanes, inicial)
    let ajustar: (() => void) | null = null
    const ro = new ResizeObserver(() => ajustar?.())
    const scene = new THREE.Scene()

    const arrancar = async () => {
      await Promise.all([document.fonts.load(`700 124px ${FAM}`), document.fonts.load(`600 44px ${FAM}`)]).catch(() => null)
      const logos: Record<string, HTMLImageElement | null> = {}
      await Promise.all([...REF, ...mayoristas].map(async f => { logos[f.nombre] = await cargarImg(f.logo, false) }))
      const prodImg = await primeraFoto(productoImg)
      if (!vivo) return

      const K = crearKit(renderer, FAM)
      const cam = new THREE.PerspectiveCamera(32, 1, 0.5, 120)
      const { sol, plano } = K.barrio(scene, W / 2 + 6, { left: -9, right: 9, top: 7, bottom: -7 }, [13, 30])
      const xDe = (p: number) => (p - min) / (max - min) * W - W / 2
      // precios casi iguales caen en el mismo punto y los carteles se tapan: se separan a una distancia
      // mínima solo en pantalla (el precio real de cada uno no cambia, tocar/imán siguen usándolo)
      const separar = (ps: number[], d: number) => {
        const o = ps.map((_, i) => i).sort((a, b) => ps[a] - ps[b]), x = o.map(i => xDe(ps[i]))
        for (let k = 0; k < 60; k++) for (let j = 1; j < x.length; j++) { const f = d - (x[j] - x[j - 1]); if (f > 0.001) { x[j - 1] -= f / 2; x[j] += f / 2 } }
        const r: number[] = []; o.forEach((i, j) => { r[i] = x[j] }); return r
      }
      const xMerc = separar(REF.map(r => r.precio), 1.3), xGalp = separar(mayoristas.map(m => m.precio), 1.9)

      // zona de pérdida (rojo) antes del costo, raya y cartelito "te costó" en la vereda
      const xc = xDe(costo)
      if (xc > -W / 2 + 0.01) { const pz = plano(xc + W / 2 + 6, 1.5, 0xb4432f, (xc - W / 2 - 6) / 2, 0.4, 0.009, { transparent: true, opacity: 0.28 }); pz.receiveShadow = false }
      const raya = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 1.5), new THREE.MeshBasicMaterial({ color: 0x1a1a1a })); raya.rotation.x = -Math.PI / 2; raya.position.set(xc, 0.012, 0.4); scene.add(raya)
      {
        const [c, g] = K.lienzo(512, 240)
        g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, 512, 240); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = K.fuente(600, 52); g.fillText('te costó', 256, 86); g.font = K.fuente(700, 104); g.fillText(fmt(costo), 256, 196)
        const s = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.66), new THREE.MeshBasicMaterial({ map: K.tex(c) })); s.position.set(xc, 1.2, 1.6); s.rotation.x = -0.4; scene.add(s)
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 0.04), K.negro); p.position.set(xc, 0.47, 1.6); p.castShadow = true; scene.add(p)
      }
      const camino = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.1), new THREE.MeshBasicMaterial({ color: 0x15803d })); camino.rotation.x = -Math.PI / 2; camino.position.set(0, 0.014, 0.4); scene.add(camino)

      const tocables: THREE.Object3D[] = []
      type Local = { cart: THREE.Mesh; mat: THREE.MeshBasicMaterial; t0: THREE.Texture; t1: THREE.Texture; p: number; pop: number }
      const flechaT = (() => {
        const [c, g] = K.lienzo(128, 256)
        g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(64, 6); g.lineTo(124, 110); g.lineTo(86, 110); g.lineTo(86, 250); g.lineTo(42, 250); g.lineTo(42, 110); g.lineTo(4, 110); g.closePath(); g.fill()
        return K.tex(c)
      })()
      // los mercados: uno por súper, parado en su precio
      const mercados: Local[] = REF.map(({ nombre, precio: p }, i) => {
        const alto = 0.95 + (i % 3) * 0.12, s = K.supermercado(logos[nombre], alto)
        const t0 = K.tex(K.cartelCanvas(logos[nombre], fmt(p), null)), t1 = K.tex(K.cartelCanvas(logos[nombre], fmt(p), '#1a1a1a'))
        const { cart, mat } = K.cartelColgado(s.g, alto, 0.62, 0.3, 1.05, 0.74); mat.map = t0
        s.cuerpo.userData.p = cart.userData.p = p; tocables.push(s.cuerpo, cart)
        s.g.position.set(xMerc[i], 0, i % 2 ? -2.75 : -1.6); scene.add(s.g)
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.52), new THREE.MeshBasicMaterial({ map: flechaT, transparent: true, opacity: 0.9, depthWrite: false }))
        fl.rotation.x = -Math.PI / 2; fl.position.set(xMerc[i], 0.013, -0.02); scene.add(fl)
        return { cart, mat, t0, t1, p, pop: 0 }
      })
      // los mayoristas: galpones atrás, en su precio de compra
      const galpones: Local[] = mayoristas.map(({ nombre, precio: p }, i) => {
        const gp = K.galpon(logos[nombre])
        const t0 = K.tex(K.cartelCanvas(logos[nombre], fmt(p), null, 'mayorista')), t1 = K.tex(K.cartelCanvas(logos[nombre], fmt(p), '#1a1a1a', 'mayorista'))
        const { cart, mat } = K.cartelColgado(gp.g, gp.alto, 1.05, 0.62, 1.15, 0.9); mat.map = t0
        gp.cuerpo.userData.p = cart.userData.p = p; tocables.push(gp.cuerpo, cart)
        gp.g.position.set(xGalp[i], 0, -4.1); scene.add(gp.g)
        return { cart, mat, t0, t1, p, pop: 0 }
      })
      { // al final de la calle: el arco de "o más"
        const ax = xDe(max) + 1.0
        for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.2, 0.07), K.negro); p.position.set(ax, 0.6, 0.4 + s * 0.8); p.castShadow = true; scene.add(p) }
        const [c, g] = K.lienzo(512, 140); g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, 512, 140); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = K.fuente(700, 74); g.fillText(fmt(max) + ' o más', 256, 96)
        const t = K.tex(c)
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 1.7), new THREE.MeshBasicMaterial({ map: t })); b.position.set(ax, 1.18, 0.4); scene.add(b)
        const cara = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.32), new THREE.MeshBasicMaterial({ map: t })); cara.position.set(ax - 0.035, 1.18, 0.4); cara.rotation.y = -Math.PI / 2; scene.add(cara)
      }
      // el carrito con el producto adentro
      const { g: carro, ruedas } = K.carrito()
      let sprite: THREE.Sprite | null = null
      if (prodImg) {
        const h = 1.05
        sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: K.tex(K.sinFondo(prodImg)), transparent: true }))
        sprite.scale.set(h * prodImg.width / prodImg.height, h, 1); sprite.position.set(0, 0.45 + h / 2 - 0.04, -0.05); carro.add(sprite)
      }
      carro.position.z = 0.42
      scene.add(carro)

      let camX = 0, lean = 0, prevX: number | null = null, prevVel = 0, wob = 0, wobV = 0, intro = 1, arrastrando = false
      const rayo = new THREE.Raycaster(), ndc = new THREE.Vector2(), suelo0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3()
      const apuntar = (cx: number, cy: number) => { const rc = el.getBoundingClientRect(); cam.updateMatrixWorld(); ndc.set((cx - rc.left) / rc.width * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1); rayo.setFromCamera(ndc, cam) }
      const precioEn = (cx: number, cy: number) => { apuntar(cx, cy); return rayo.ray.intersectPlane(suelo0, hit) ? min + (hit.x + W / 2) / W * (max - min) : null }
      const tocar = (cx: number, cy: number) => {
        apuntar(cx, cy)
        const h = rayo.intersectObjects(tocables)[0]
        if (h) return h.object.userData.p as number
        return rayo.ray.intersectPlane(suelo0, hit) ? clamp(min + (hit.x + W / 2) / W * (max - min), min, max) : null
      }
      const cerca = (max - min) * 0.012
      const update = (v: number, vel: number, dt: number) => {
        const x = xDe(v)
        if (prevX !== null) { const d = x - prevX; ruedas.forEach(w => { w.rotation.x -= d / (0.1 * 0.6) }) }
        prevX = x; carro.position.x = x
        const acc = (vel - prevVel) / Math.max(dt, 0.001); prevVel = vel
        const leanT = RM ? 0 : clamp(vel / (max - min) * 0.3, -0.1, 0.1); lean += (leanT - lean) * (1 - Math.exp(-dt * 10)); carro.rotation.z = -lean
        if (!RM && sprite) { const f = clamp(acc / (max - min), -6, 6) * 0.05; wobV += (f - 70 * wob - 7 * wobV) * dt; wob += wobV * dt; sprite.material.rotation = clamp(wob, -0.3, 0.3) }
        camino.scale.x = Math.max(0.001, x + W / 2 + 6); camino.position.x = -W / 2 - 6 + camino.scale.x / 2
        camX += (x * 0.35 - camX) * (RM ? 1 : 1 - Math.exp(-dt * (arrastrando ? 9 : 5)))
        // el encuadre se aleja si el recuadro es angosto, para que entren todos los carteles sin tener que mover nada
        const fit = Math.max(1, 1.5 / cam.aspect) * 1.1
        const mira = new THREE.Vector3(camX, 0.55, -1.75), seguir = new THREE.Vector3(camX + 0.35 * fit, 0.55 + 5.55 * fit, -1.75 + 10.35 * fit)
        if (intro < 1) {
          intro = Math.min(1, intro + dt / 2.0); const e = 1 - Math.pow(1 - intro, 3)
          cam.position.set(seguir.x * e, 12.5 + (seguir.y - 12.5) * e, 12 + (seguir.z - 12) * e); cam.lookAt(mira.x * e, 0.2 + (mira.y - 0.2) * e, -1.5 + (mira.z + 1.5) * e)
        } else { cam.position.copy(seguir); cam.lookAt(mira) }
        sol.position.set(camX - 5, 11, 7); sol.target.position.set(camX, 0, -1)
        let act = -1, dmin = Infinity
        mercados.forEach((m, i) => { const d = Math.abs(m.p - v); if (d < dmin) { dmin = d; act = i } })
        mercados.forEach((m, i) => {
          m.mat.map = i === act && dmin < cerca ? m.t1 : m.t0
          if (m.pop > 0.001) { m.pop *= Math.exp(-dt * 5); m.cart.scale.setScalar(1 + 0.22 * Math.sin((1 - m.pop) * Math.PI * 2) * m.pop) } else m.cart.scale.setScalar(1)
        })
        galpones.forEach(gp => { gp.mat.map = Math.abs(gp.p - v) < cerca ? gp.t1 : gp.t0 })
        if (hud.current) { hud.current.style.left = (v - min) / (max - min) * 100 + '%'; hud.current.textContent = act >= 0 && dmin < cerca ? 'Pasando por ' + REF[act].nombre : 'Estás acá' }
        return intro >= 1 && Math.abs(x * 0.35 - camX) < 0.002 && Math.abs(leanT - lean) < 0.001 && Math.abs(wob) < 0.002 && Math.abs(wobV) < 0.01 && mercados.every(m => m.pop < 0.001)
      }

      ajustar = () => { const w = el.clientWidth, h = el.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); renderer.render(scene, cam) }
      ro.observe(el)
      ajustar()

      // ---- loop a demanda: solo dibuja mientras algo se mueve
      let corriendo = false, ultimo = 0, prevV = motor.v
      const loop = (now: number) => {
        if (!vivo) return
        const dt = Math.min(0.05, (now - ultimo) / 1000 || 0.016); ultimo = now
        motor.paso(dt)
        imanes.forEach(p => {
          if ((prevV - p) * (motor.v - p) < 0) {
            if (navigator.vibrate) navigator.vibrate(8)
            const i = REF.findIndex(r => r.precio === p); if (mercados[i]) mercados[i].pop = 1
          }
        })
        prevV = motor.v
        const quieto = update(motor.v, motor.vel, dt)
        renderer.render(scene, cam)
        el.setAttribute('aria-valuenow', String(Math.round(motor.v))); el.setAttribute('aria-valuetext', fmt(motor.v))
        ultimas.current.onValor(motor.v, motor.idle && !motor.drag)
        if (motor.idle && !motor.drag && quieto) { corriendo = false; return }
        raf = requestAnimationFrame(loop)
      }
      const despertar = () => { if (!corriendo) { corriendo = true; ultimo = performance.now(); raf = requestAnimationFrame(loop) } }
      control.current = { ir: p => { motor.ir(p, true); despertar() } }

      // ---- tocar o arrastrar: el carrito sigue al dedo sobre la calle
      let lastX = 0, lastY = 0, muestras: [number, number][] = [], bajoX = 0, bajoY = 0, bajoT = 0
      const op = { signal: corte.signal }
      el.addEventListener('pointerdown', e => {
        try { el.setPointerCapture(e.pointerId) } catch { /* sin captura igual anda */ }
        motor.drag = true; motor.idle = false; motor.target = null; motor.vel = 0
        lastX = bajoX = e.clientX; lastY = bajoY = e.clientY; bajoT = performance.now(); muestras = []
        arrastrando = true; setUsado(true); despertar()
      }, op)
      el.addEventListener('pointermove', e => {
        if (!motor.drag) return
        const now = performance.now(), a = precioEn(lastX, lastY), b = precioEn(e.clientX, e.clientY)
        const dv = a === null || b === null ? 0 : b - a
        let nv = motor.v + dv
        if (nv < motor.min || nv > motor.max) nv = motor.v + dv * 0.3
        motor.v = nv; muestras.push([now, dv]); muestras = muestras.filter(m => now - m[0] < 90)
        lastX = e.clientX; lastY = e.clientY; despertar()
      }, op)
      const soltar = (e: PointerEvent) => {
        if (!motor.drag) return
        motor.drag = false; arrastrando = false
        if (e.type === 'pointerup' && Math.hypot(e.clientX - bajoX, e.clientY - bajoY) < 8 && performance.now() - bajoT < 450) {
          const p = tocar(e.clientX, e.clientY)
          if (p !== null) motor.ir(p, true); else motor.lanzar(0)
          despertar(); return
        }
        const now = performance.now(), dur = muestras.length ? (now - muestras[0][0]) / 1000 : 1
        motor.vel = muestras.length && dur > 0 ? muestras.reduce((s, m) => s + m[1], 0) / Math.max(dur, 0.016) : 0
        motor.lanzar(clamp(motor.vel, -motor.r * 1.6, motor.r * 1.6)); despertar()
      }
      el.addEventListener('pointerup', soltar, op); el.addEventListener('pointercancel', soltar, op)
      el.addEventListener('keydown', e => {
        const paso = e.shiftKey ? 500 : 50
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { motor.ir(motor.v + paso, false); e.preventDefault(); despertar() }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { motor.ir(motor.v - paso, false); e.preventDefault(); despertar() }
      }, op)
      // si el navegador pierde el 3D (pasa en el celu al cambiar de app), se rearma de cero
      cv.addEventListener('webglcontextlost', e => e.preventDefault(), op)
      cv.addEventListener('webglcontextrestored', () => setGen(g => g + 1), op)

      // ---- entrada: la cámara baja y el carrito llega rodando a tu precio
      update(motor.v, 0, 1); renderer.render(scene, cam)
      if (!RM) {
        const destino = motor.v
        const io = new IntersectionObserver(es => {
          if (!es.some(x => x.isIntersecting)) return
          io.disconnect()
          if (!vivo || motor.drag || !motor.idle) return
          motor.v = min; prevV = min; intro = 0; motor.ir(destino, true); despertar()
        }, { threshold: 0.35 })
        io.observe(el)
        corte.signal.addEventListener('abort', () => io.disconnect())
      }
    }

    arrancar()
    return () => {
      vivo = false
      cancelAnimationFrame(raf)
      corte.abort()
      ro.disconnect()
      ultimas.current.control.current = null
      liberarEscena(scene)
      renderer.dispose()
      renderer.forceContextLoss()
      cv.remove()
    }
    // se arma una vez por producto/fuente (el padre usa key); gen = rearmar tras perder el 3D
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gen])

  if (sinGL) return <div className="etp-esc etp-cargando">Este navegador no puede mostrar el 3D. Podés escribir el precio arriba.</div>

  return (
    <div
      ref={box}
      className={`etp-esc calle${usado ? ' usado' : ''}`}
      tabIndex={0}
      role="slider"
      aria-label="Recorrido de precios: tocá un mercado o arrastrá el carrito para cambiar tu precio"
      aria-valuemin={min}
      aria-valuemax={max}
    >
      <style>{`
        .calle { touch-action: none; overscroll-behavior: contain; cursor: grab; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; overflow: hidden; }
        .calle:active { cursor: grabbing; }
        .calle:focus-visible { outline: 2px solid var(--gold); outline-offset: -2px; }
        .calle canvas { display: block; width: 100%; height: 100%; }
        .calle .ts { position: absolute; left: 0; right: 0; height: 32%; pointer-events: none; -webkit-backdrop-filter: blur(2.6px); backdrop-filter: blur(2.6px); }
        .calle .ts.arr { top: 0; height: 9%; -webkit-mask-image: linear-gradient(#000 20%, transparent); mask-image: linear-gradient(#000 20%, transparent); }
        .calle .ts.aba { bottom: 0; -webkit-mask-image: linear-gradient(transparent, #000 80%); mask-image: linear-gradient(transparent, #000 80%); }
        .calle .hud { position: absolute; left: 16px; right: 16px; top: 12px; height: 34px; pointer-events: none; z-index: 2; }
        .calle .hud .l { position: absolute; left: 0; right: 0; top: 24px; height: 2px; background: var(--ink); opacity: .45; }
        .calle .hud .t { position: absolute; top: 19px; width: 2px; height: 12px; background: var(--ink); transform: translateX(-1px); }
        .calle .hud .m { position: absolute; top: 0; transform: translateX(-50%); font-size: 11px; font-weight: 700; background: var(--green); color: #fff; padding: 2px 7px; white-space: nowrap; }
        .calle .hud .m::after { content: ''; position: absolute; left: 50%; top: 100%; margin-left: -5px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid var(--green); }
        .calle .pista { position: absolute; left: 0; right: 0; bottom: 10px; text-align: center; font-size: 12.5px; font-weight: 600; color: var(--ink); pointer-events: none; transition: opacity 400ms ease; z-index: 2; }
        .calle .pista span { background: rgba(255,255,255,.88); padding: 4px 10px; }
        .calle.usado .pista { opacity: 0; }
      `}</style>
      <div className="hud" aria-hidden="true">
        <span className="l" />
        {cadenas.map(c => <i key={c.nombre} className="t" style={{ left: `${(c.precio - min) / (max - min) * 100}%` }} />)}
        <span ref={hud} className="m">Estás acá</span>
      </div>
      <div className="ts arr" /><div className="ts aba" />
      <div className="pista"><span>Tocá un mercado o la calle · o arrastrá el carrito</span></div>
    </div>
  )
}
