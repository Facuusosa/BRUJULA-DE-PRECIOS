// Piezas compartidas por las dos calles 3D ("Elegí tu precio" y Mi Lista): el mismo barrio,
// el mismo carrito. Portadas de las maquetas (three r128) a three 0.169: colorSpace en vez de
// encoding y luces x PI (desde r155 las luces son físicas y se veían apagadas).
import * as THREE from 'three'

export const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR')
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
export const suave = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)

export const cargarImg = (src: string, cors: boolean) => new Promise<HTMLImageElement | null>(r => {
  if (!src) return r(null)
  const i = new Image()
  if (cors) i.crossOrigin = 'anonymous'
  i.onload = () => r(i); i.onerror = () => r(null); i.src = src
})

// primera foto que cargue con permiso de lectura (Maxiconsumo y tupedido no lo dan)
export async function primeraFoto(srcs: string[]) {
  for (const s of srcs) { const im = await cargarImg(s, true); if (im) return im }
  return null
}

export function crearKit(renderer: THREE.WebGLRenderer, fam: string) {
  const tex = (c: HTMLCanvasElement) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t }
  const lienzo = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')!] as const }
  const fuente = (peso: number, px: number) => `${peso} ${px}px ${fam}`

  // la foto sin el fondo blanco, así el producto "está" adentro del carrito
  const sinFondo = (img: HTMLImageElement) => {
    const [c, g] = lienzo(img.width, img.height); g.drawImage(img, 0, 0)
    try {
      const d = g.getImageData(0, 0, c.width, c.height), a = d.data
      for (let i = 0; i < a.length; i += 4) { const m = Math.min(a[i], a[i + 1], a[i + 2]); if (m > 238) a[i + 3] = 0; else if (m > 222) a[i + 3] = (238 - m) * 16 }
      g.putImageData(d, 0, 0)
    } catch { /* sin permiso de lectura: va con fondo */ }
    return c
  }
  // color de cada marca, sacado de su propio logo (no inventado)
  const colorMarca = (img: HTMLImageElement | null) => {
    if (!img) return 0x1a1a1a
    const [, g] = lienzo(48, 48); g.drawImage(img, 0, 0, 48, 48)
    const d = g.getImageData(0, 0, 48, 48).data, cubos: Record<number, THREE.Color[]> = {}, hsl = { h: 0, s: 0, l: 0 }
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 200) continue
      const col = new THREE.Color(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255); col.getHSL(hsl)
      if (hsl.s < 0.38 || hsl.l < 0.16 || hsl.l > 0.86) continue
      const k = Math.round(hsl.h * 12) % 12; (cubos[k] = cubos[k] || []).push(col)
    }
    const mejor = Object.values(cubos).sort((x, y) => y.length - x.length)[0]
    if (!mejor || mejor.length < 20) return 0x1a1a1a
    return mejor.reduce((s, c) => s.add(c), new THREE.Color(0, 0, 0)).multiplyScalar(1 / mejor.length).getHex()
  }
  const hexCss = (n: number) => '#' + n.toString(16).padStart(6, '0')
  const logoCanvas = (img: HTMLImageElement | null) => { const [c, g] = lienzo(320, 96); g.fillStyle = '#fff'; g.fillRect(0, 0, 320, 96); if (img) { const s = Math.min(280 / img.width, 72 / img.height), w = img.width * s, h = img.height * s; g.drawImage(img, 160 - w / 2, 48 - h / 2, w, h) } return c }
  const rayasCanvas = (col: string) => { const [c, g] = lienzo(256, 64); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffffff' : col; g.fillRect(i * 32, 0, 32, 64) } return c }
  // cartel de precio colgado sobre cada local; `inv` = resaltado (negro o verde según la pantalla)
  const cartelCanvas = (logo: HTMLImageElement | null, texto: string, inv: string | null, sub?: string) => {
    const [c, g] = lienzo(512, sub ? 400 : 360), H = c.height
    g.fillStyle = inv ?? '#ffffff'; g.fillRect(0, 0, 512, H)
    g.lineWidth = 16; g.strokeStyle = inv === '#15803d' ? '#0f5f2c' : '#1a1a1a'; g.strokeRect(8, 8, 496, H - 16)
    if (logo) { const s = Math.min(330 / logo.width, 96 / logo.height), w = logo.width * s, h = logo.height * s; g.fillStyle = '#fff'; g.fillRect(256 - w / 2 - 14, 34, w + 28, h + 16); g.drawImage(logo, 256 - w / 2, 42, w, h) }
    g.fillStyle = inv ? '#ffffff' : '#1a1a1a'; g.textAlign = 'center'
    let fs = 124; do { g.font = fuente(700, fs); fs -= 4 } while (g.measureText(texto).width > 460 && fs > 40)
    g.fillText(texto, 256, logo ? 292 : 230)
    if (sub) { g.font = fuente(600, 44); g.fillStyle = inv === '#15803d' ? '#d6f0de' : inv ? '#e6c79a' : '#6f6f6f'; g.fillText(sub, 256, 362) }
    return c
  }

  const negro = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.55 })
  const blanco = new THREE.MeshStandardMaterial({ color: 0xfbfaf7, roughness: 0.85 })
  const vidrio = new THREE.MeshStandardMaterial({ color: 0x2a2e30, roughness: 0.2, metalness: 0.3 })

  // cielo, sol, calle, veredas, árboles y faroles entre -mitad y +mitad
  const barrio = (scene: THREE.Scene, mitad: number, sombra: { left: number; right: number; top: number; bottom: number }, niebla: [number, number]) => {
    scene.background = new THREE.Color(0xe9e4d8); scene.fog = new THREE.Fog(0xe9e4d8, niebla[0], niebla[1])
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc6b2, 0.7 * Math.PI))
    const sol = new THREE.DirectionalLight(0xfff3df, 0.95 * Math.PI); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024)
    Object.assign(sol.shadow.camera, { ...sombra, near: 1, far: 40 }); sol.shadow.bias = -0.0006
    scene.add(sol); scene.add(sol.target)
    const plano = (w: number, h: number, color: number, x: number, z: number, y = 0.005, extra: THREE.MeshStandardMaterialParameters = {}) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color, roughness: 1, ...extra }))
      m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m
    }
    plano(90, 50, 0xd6cfbd, 0, -2, 0)
    plano(mitad * 2, 0.95, 0xebe6da, 0, -0.78)
    plano(mitad * 2, 0.8, 0xebe6da, 0, 1.55)
    plano(mitad * 2, 1.5, 0x8f897e, 0, 0.4, 0.007)
    const blancoB = new THREE.MeshBasicMaterial({ color: 0xffffff })
    for (let x = -mitad; x < mitad; x += 0.9) { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.06), blancoB); r.rotation.x = -Math.PI / 2; r.position.set(x, 0.01, 0.4); scene.add(r) }
    const tronco = new THREE.MeshStandardMaterial({ color: 0x7a6650, roughness: 1 }), copa = new THREE.MeshStandardMaterial({ color: 0x86a06c, roughness: 0.9, flatShading: true })
    let semilla = 5
    const rnd = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647
    for (let x = -mitad + 1; x < mitad - 1; x += 1.7) {
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 6), tronco); tr.position.set(x + rnd() * 0.3, 0.2, 1.75); tr.castShadow = true; scene.add(tr)
      const co = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24 + rnd() * 0.08, 0), copa); co.position.set(tr.position.x, 0.52, 1.75); co.rotation.y = rnd() * 3; co.castShadow = true; scene.add(co)
    }
    for (let x = -mitad + 0.2; x < mitad - 1; x += 2.4) {
      const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.85, 6), negro); fp.position.set(x, 0.42, -0.45); fp.castShadow = true; scene.add(fp)
      const fl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.1), negro); fl.position.set(x + 0.06, 0.86, -0.42); scene.add(fl)
    }
    return { sol, plano }
  }

  // el carrito: alambre negro, ruedas que giran
  const carrito = () => {
    const g = new THREE.Group(), ink = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.55 })
    const add = (geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, rz = 0) => { const m = new THREE.Mesh(geo, ink); m.position.set(x, y, z); m.rotation.x = rx; m.rotation.z = rz; m.castShadow = true; g.add(m); return m }
    const barV = new THREE.BoxGeometry(0.022, 0.6, 0.022)
    for (let i = 0; i < 7; i++) for (const s of [-1, 1]) add(barV, s * 0.475, 0.75, -0.6 + i * 0.2)
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) add(barV, -0.4 + i * 0.2, 0.75, s * 0.625)
    const rimX = new THREE.BoxGeometry(0.97, 0.04, 0.04), rimZ = new THREE.BoxGeometry(0.04, 0.04, 1.29)
    for (const s of [-1, 1]) { add(rimX, 0, 1.05, s * 0.625); add(rimZ, s * 0.475, 1.05, 0); add(rimX, 0, 0.45, s * 0.625); add(rimZ, s * 0.475, 0.45, 0) }
    add(new THREE.BoxGeometry(0.95, 0.025, 1.25), 0, 0.45, 0)
    add(new THREE.CylinderGeometry(0.035, 0.035, 1.05, 12), 0, 1.3, 0.9, 0, Math.PI / 2)
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.03, 0.42, 0.03), s * 0.47, 1.12, 0.77, -0.55)
    for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.03, 0.03, 1.2), s * 0.4, 0.14, 0); add(new THREE.BoxGeometry(0.03, 0.32, 0.03), s * 0.4, 0.29, -0.5); add(new THREE.BoxGeometry(0.03, 0.32, 0.03), s * 0.4, 0.29, 0.5) }
    const ruedas: THREE.Mesh[] = [], wg = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 18), wm = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.85 })
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = new THREE.Mesh(wg, wm); w.rotation.z = Math.PI / 2; w.position.set(sx * 0.4, 0.1, sz * 0.55); w.castShadow = true; g.add(w); ruedas.push(w) }
    g.rotation.y = -Math.PI / 2; g.scale.setScalar(0.6)
    return { g, ruedas }
  }

  // un súper: casita blanca, faja y toldo del color de la marca, logo al frente
  const supermercado = (logo: HTMLImageElement | null, alto: number) => {
    const g = new THREE.Group(), marca = colorMarca(logo)
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.25, alto, 0.95), blanco); cuerpo.position.y = alto / 2; cuerpo.castShadow = cuerpo.receiveShadow = true; g.add(cuerpo)
    const tech = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.1, 1.06), negro); tech.position.y = alto + 0.05; tech.castShadow = true; g.add(tech)
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(1.27, 0.26, 0.97), new THREE.MeshStandardMaterial({ color: marca, roughness: 0.55 })); fascia.position.y = alto - 0.13; fascia.castShadow = true; g.add(fascia)
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.2), new THREE.MeshBasicMaterial({ map: tex(logoCanvas(logo)) })); lg.position.set(0, alto - 0.13, 0.488); g.add(lg)
    const vid = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.3), vidrio); vid.position.set(-0.1, 0.36, 0.477); g.add(vid)
    const puerta = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.4), negro); puerta.position.set(0.42, 0.2, 0.478); g.add(puerta)
    const tol = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.04, 0.32), new THREE.MeshStandardMaterial({ map: tex(rayasCanvas(hexCss(marca))), roughness: 0.8 })); tol.position.set(0, alto - 0.36, 0.6); tol.rotation.x = 0.4; tol.castShadow = true; g.add(tol)
    return { g, cuerpo, marca, frente: 0.5 }
  }

  // un mayorista: galpón de chapa con techo a dos aguas y la banda de la marca
  const chapaT = (() => { const [c, g] = lienzo(64, 64); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#d3cfc6' : '#e6e3dc'; g.fillRect(i * 8, 0, 8, 64) } const t = tex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); return t })()
  const porT = (() => { const [c, g] = lienzo(64, 64); g.fillStyle = '#8d8a83'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#7a776f'; for (let y = 0; y < 64; y += 8) g.fillRect(0, y, 64, 2); return tex(c) })()
  const chapaM = new THREE.MeshStandardMaterial({ map: chapaT, roughness: 0.75, metalness: 0.15 }), porM = new THREE.MeshStandardMaterial({ map: porT, roughness: 0.7 }), techoG = new THREE.MeshStandardMaterial({ color: 0x5b5850, roughness: 0.7, metalness: 0.2 })
  const galpon = (logo: HTMLImageElement | null) => {
    const g = new THREE.Group(), alto = 1.1, ancho = 1.75, marca = colorMarca(logo)
    const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, 1.2), chapaM); cuerpo.position.y = alto / 2; cuerpo.castShadow = cuerpo.receiveShadow = true; g.add(cuerpo)
    for (const s of [-1, 1]) { const ag = new THREE.Mesh(new THREE.BoxGeometry(ancho + 0.1, 0.05, 0.72), techoG); ag.position.set(0, alto + 0.17, s * 0.3); ag.rotation.x = s * 0.5; ag.castShadow = true; g.add(ag) }
    const banda = new THREE.Mesh(new THREE.BoxGeometry(ancho + 0.02, 0.24, 0.05), new THREE.MeshStandardMaterial({ color: marca, roughness: 0.55 })); banda.position.set(0, alto - 0.14, 0.61); g.add(banda)
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.2), new THREE.MeshBasicMaterial({ map: tex(logoCanvas(logo)) })); lg.position.set(0, alto - 0.14, 0.64); g.add(lg)
    const porton = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.6), porM); porton.position.set(-0.3, 0.3, 0.605); g.add(porton)
    const pu = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.4), negro); pu.position.set(0.55, 0.2, 0.606); g.add(pu)
    return { g, cuerpo, marca, alto, frente: 0.62 }
  }

  // cartel colgado de dos palos sobre el techo
  const cartelColgado = (g: THREE.Group, alto: number, alzada: number, palo: number, w: number, h: number) => {
    const mat = new THREE.MeshBasicMaterial(), cart = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
    cart.position.set(0, alto + alzada, 0.2); cart.rotation.x = -0.28; g.add(cart)
    for (const s of [-1, 1]) { const pp = new THREE.Mesh(new THREE.BoxGeometry(0.03, palo, 0.03), negro); pp.position.set(s * 0.34, alto + palo / 2 + 0.05, 0.2); g.add(pp) }
    return { cart, mat }
  }

  return { tex, lienzo, fuente, sinFondo, colorMarca, rayasCanvas, cartelCanvas, negro, blanco, vidrio, barrio, carrito, supermercado, galpon, cartelColgado }
}

// libera todo lo que la escena subió a la placa de video
export function liberarEscena(scene: THREE.Scene) {
  scene.traverse(o => {
    const m = o as THREE.Mesh
    m.geometry?.dispose()
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
    mats.forEach(mt => { (mt as THREE.MeshBasicMaterial).map?.dispose(); mt.dispose() })
  })
}
