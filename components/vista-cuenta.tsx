'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { User, Store, Check, MessageCircle, HelpCircle, FileText, ChevronRight, ShoppingCart } from 'lucide-react'
import { productos, FUENTES } from '@/lib/data'
import CountUp from '@/components/reactbits/TextAnimations/CountUp/CountUp'

const WHATSAPP_NUMERO = '541168079566'
const WHATSAPP_MSG_SUGERIR = encodeURIComponent('Hola! Quiero sugerir un producto o mayorista para Brújula de Precios: ')

interface VistaCuentaProps {
  onIrAPlanes?: () => void
}

interface BrujulaPerfil {
  nombre: string
}

interface BrujulaConfig {
  nombreNegocio: string
  rubro: string
  // Setea el filtro por defecto del catálogo: comerciante → Mayoristas, consumidor → Cadenas
  perfilUso?: 'comerciante' | 'consumidor'
}

function diasDesde(fecha: string): string {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)
  if (dias <= 0) return 'Actualizado hoy'
  if (dias === 1) return 'Actualizado ayer'
  return `Actualizado hace ${dias} días`
}

// Evita mostrar "$0 M": redondear siempre a millones perdía cualquier ahorro
// por debajo de $500.000 (se veía como si la app no detectara nada).
function formatoAhorro(valor: number): { to: number; suffix: string } {
  if (valor >= 1_000_000) return { to: Math.round((valor / 1_000_000) * 10) / 10, suffix: ' M' }
  if (valor >= 1_000) return { to: Math.round(valor / 1000), suffix: ' K' }
  return { to: Math.round(valor), suffix: '' }
}

export function VistaCuenta({ onIrAPlanes }: VistaCuentaProps) {
  const [perfil, setPerfil] = useState<BrujulaPerfil>({ nombre: '' })
  const [config, setConfig] = useState<BrujulaConfig>({ nombreNegocio: '', rubro: '' })
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    const savedPerfil = localStorage.getItem('brujula_perfil')
    if (savedPerfil) { try { setPerfil(JSON.parse(savedPerfil)) } catch {} }
    const savedConfig = localStorage.getItem('brujula_config')
    if (savedConfig) { try { setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) })) } catch {} }
    setCargado(true)
  }, [])

  useEffect(() => {
    if (cargado) localStorage.setItem('brujula_perfil', JSON.stringify(perfil))
  }, [perfil, cargado])

  useEffect(() => {
    if (cargado) localStorage.setItem('brujula_config', JSON.stringify(config))
  }, [config, cargado])

  // Métricas de compra: siempre sobre mayoristas (coto es referencia góndola)
  const comparados = useMemo(() => productos.filter(p => p.precios.filter(pr => pr.precio > 0 && pr.tipoFuente === 'mayorista').length >= 2).length, [])

  const ahorroTotal = useMemo(() =>
    productos.reduce((sum, p) => {
      const validos = p.precios.filter(pr => pr.precio > 0 && pr.tipoFuente === 'mayorista')
      if (validos.length < 2) return sum
      const min = Math.min(...validos.map(v => v.precio))
      const max = Math.max(...validos.map(v => v.precio))
      return sum + (max - min)
    }, 0), []
  )

  const ahorroFmt = useMemo(() => formatoAhorro(ahorroTotal), [ahorroTotal])

  const fechaDatos = useMemo(() => {
    let max = ''
    for (const p of productos) {
      for (const pr of p.precios) {
        if (pr.fechaScraping && pr.fechaScraping > max) max = pr.fechaScraping
      }
    }
    return max ? new Date(max).toLocaleDateString('es-AR') : ''
  }, [])

  const ultimaActualizacion = useMemo(() => {
    const out: Record<string, string> = {}
    for (const p of productos) {
      for (const pr of p.precios) {
        if (pr.fechaScraping && (!out[pr.mayorista] || pr.fechaScraping > out[pr.mayorista])) {
          out[pr.mayorista] = pr.fechaScraping
        }
      }
    }
    return out
  }, [])

  const inicial = (perfil.nombre || 'B').trim().charAt(0).toUpperCase()

  const handleBorrarDatos = () => {
    if (window.confirm('¿Borrar todas tus listas, favoritos y datos de perfil de este dispositivo?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const grStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '12px',
    minHeight: '54px',
    padding: '8px 16px',
    borderBottom: '1px solid var(--plate)',
    background: '#ffffff',
    width: '100%', textAlign: 'left',
  }

  const groupLabelStyle: React.CSSProperties = {
    padding: '28px 20px 8px',
    fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.14em',
    color: 'var(--gray)', textTransform: 'uppercase',
  }

  const groupStyle: React.CSSProperties = {
    margin: '0 20px',
    border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden',
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100%', paddingBottom: '40px' }}>
      <style>{`
        @keyframes perfil-rise { to { opacity: 1; transform: translateY(0); } }
        .perfil-anim { opacity: 0; transform: translateY(10px); animation: perfil-rise 380ms var(--ease-out) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .perfil-anim { transform: none; animation-duration: 150ms; }
        }
        .perfil-wrap { max-width: 700px; margin: 0 auto; }
        .perfil-gr-press { cursor: pointer; border: none; font-family: var(--font-sans); }
        @media (hover: hover) and (pointer: fine) {
          .perfil-gr-press:hover { background: #fafafa !important; }
        }
        @media (min-width: 1000px) {
          .perfil-wrap { max-width: 940px; padding: 0 32px; }
          .perfil-identity-name { font-size: 26px !important; }
          .perfil-avatar { width: 80px !important; height: 80px !important; font-size: 32px !important; }
          .perfil-stat-val { font-size: 22px !important; }
          .perfil-stat-card { padding: 18px 20px !important; }
          .perfil-upgrade-title { font-size: 15px !important; }
          .perfil-upgrade-sub { font-size: 13px !important; }
          .perfil-group-row { min-height: 62px !important; padding: 12px 20px !important; }
          .perfil-group-lbl { font-size: 15px !important; }
          .perfil-group-sub { font-size: 12px !important; }
          .perfil-group-wrap { margin: 0 0 !important; }
          .perfil-section-label { padding: 28px 0 8px !important; }
        }
      `}</style>

      <div className="perfil-wrap">

        {/* Identidad */}
        <div className="perfil-anim" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 20px 0' }}>
          <div className="perfil-avatar" style={{
            width: '60px', height: '60px', borderRadius: '999px',
            background: 'var(--plate)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '25px', fontWeight: 600, color: 'var(--gold)',
            flexShrink: 0,
          }}>
            {inicial}
          </div>
          <div>
            <h1 className="perfil-identity-name" style={{ fontSize: '21.4px', fontWeight: 600, letterSpacing: '-0.3px', margin: 0, color: 'var(--ink)' }}>
              {perfil.nombre || 'Bienvenido/a'}
            </h1>
            <div style={{ fontSize: '12.5px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>
              Buenos Aires
            </div>
          </div>
        </div>

        {/* Stats con CountUp — 2 columnas (nunca 3 iguales en mobile) */}
        <div className="perfil-anim" style={{ animationDelay: '100ms', display: 'flex', gap: '10px', padding: '18px 20px 0' }}>
          <div className="perfil-stat-card" style={{ flex: 1, background: 'var(--plate)', borderRadius: '10px', padding: '12px 14px' }}>
            <div className="tnum perfil-stat-val" style={{ fontSize: '17px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--ink)' }}>
              {cargado ? <CountUp from={0} to={comparados} duration={0.9} separator="." /> : comparados.toLocaleString('es-AR')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--gray)', fontWeight: 400, marginTop: '1px', lineHeight: 1.3 }}>
              productos comparados
            </div>
          </div>
          <div className="perfil-stat-card" style={{ flex: 1, background: 'var(--plate)', borderRadius: '10px', padding: '12px 14px' }}>
            <div className="tnum perfil-stat-val" style={{ fontSize: '17px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--green)' }}>
              {cargado
                ? <CountUp from={0} to={ahorroFmt.to} duration={0.9} prefix="$" suffix={ahorroFmt.suffix} separator="." />
                : `$${ahorroFmt.to.toLocaleString('es-AR')}${ahorroFmt.suffix}`}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--gray)', fontWeight: 400, marginTop: '1px', lineHeight: 1.3 }}>
              ahorro detectado en catálogo
            </div>
          </div>
        </div>

        {/* Mi perfil */}
        <div className="perfil-anim perfil-section-label" style={{ ...groupLabelStyle, animationDelay: '150ms' }}>Mi perfil</div>
        <div className="perfil-anim" style={{ ...groupStyle, animationDelay: '150ms' }}>
          <div className="perfil-group-row" style={grStyle}>
            <User size={20} strokeWidth={1.7} color="var(--ink)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Nombre</div>
            </div>
            {editandoNombre ? (
              <input
                autoFocus
                value={perfil.nombre}
                onChange={e => setPerfil({ nombre: e.target.value })}
                onBlur={() => setEditandoNombre(false)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditandoNombre(false) }}
                placeholder="Tu nombre"
                style={{
                  fontSize: '13px', color: 'var(--ink)', textAlign: 'right',
                  border: 'none', borderBottom: '1.5px solid var(--gold)', outline: 'none',
                  fontFamily: 'var(--font-sans)', background: 'transparent', width: '140px',
                }}
              />
            ) : (
              <>
                <span
                  onClick={() => setEditandoNombre(true)}
                  style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: 300, cursor: 'pointer' }}
                >
                  {perfil.nombre || 'Agregar'}
                </span>
                <ChevronRight size={16} color="var(--line)" style={{ flexShrink: 0, cursor: 'pointer' }} onClick={() => setEditandoNombre(true)} />
              </>
            )}
          </div>

          <div className="perfil-group-row" style={grStyle}>
            <Store size={20} strokeWidth={1.7} color="var(--ink)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Rubro</div>
            </div>
            <input
              value={config.rubro}
              onChange={e => setConfig(prev => ({ ...prev, rubro: e.target.value }))}
              placeholder="Kiosco, uso personal..."
              aria-label="Rubro"
              style={{
                fontSize: '13px', color: 'var(--gray)', fontWeight: 300, textAlign: 'right',
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', width: '160px',
              }}
            />
          </div>

          <div className="perfil-group-row" style={grStyle}>
            <ShoppingCart size={20} strokeWidth={1.7} color="var(--ink)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Uso la app como</div>
              <div className="perfil-group-sub" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>
                Define qué precios ves primero en el catálogo
              </div>
            </div>
            <select
              value={config.perfilUso ?? 'comerciante'}
              onChange={e => setConfig(prev => ({ ...prev, perfilUso: e.target.value as BrujulaConfig['perfilUso'] }))}
              aria-label="Perfil de uso"
              style={{
                fontSize: '13px', color: 'var(--gray)', fontWeight: 300,
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', cursor: 'pointer', textAlign: 'right',
              }}
            >
              <option value="comerciante">Comerciante</option>
              <option value="consumidor">Consumidor</option>
            </select>
          </div>
        </div>

        {/* Fuentes de precios: todos los competidores relevados, mayoristas + cadenas */}
        <div className="perfil-anim perfil-section-label" style={{ ...groupLabelStyle, animationDelay: '210ms' }}>Fuentes de precios</div>
        <div className="perfil-anim" style={{ ...groupStyle, animationDelay: '210ms' }}>
          {FUENTES.map((f, idx) => {
            const esCadena = f.tipo === 'cadena'
            return (
              <div key={f.nombre} style={{ ...grStyle, borderBottom: idx === FUENTES.length - 1 ? 'none' : '1px solid var(--plate)' }}>
                <span style={{
                  width: '56px', height: '24px', borderRadius: '5px',
                  border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Image
                    src={f.logo}
                    alt={f.nombre}
                    width={46}
                    height={15}
                    style={{ maxWidth: '46px', maxHeight: '15px', objectFit: 'contain', width: 'auto', height: 'auto' }}
                    unoptimized
                  />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>
                    {f.nombre}
                    {esCadena && (
                      <span style={{
                        marginLeft: '7px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.05em',
                        color: 'var(--green)', border: '1px solid var(--green)',
                        borderRadius: '4px', padding: '1px 5px', verticalAlign: 'middle',
                      }}>GÓNDOLA</span>
                    )}
                  </div>
                  <div className="tnum" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>
                    {ultimaActualizacion[f.nombre] ? diasDesde(ultimaActualizacion[f.nombre]) : 'Precios incluidos'}
                  </div>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 500, color: 'var(--green)', flexShrink: 0 }}>
                  <Check size={15} strokeWidth={2.5} />
                  Incluido
                </span>
              </div>
            )
          })}
        </div>

        {/* Ayuda */}
        <div className="perfil-anim perfil-section-label" style={{ ...groupLabelStyle, animationDelay: '240ms' }}>Ayuda</div>
        <div className="perfil-anim" style={{ ...groupStyle, animationDelay: '240ms' }}>
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MSG_SUGERIR}`}
            target="_blank"
            rel="noopener noreferrer"
            className="perfil-gr-press perfil-group-row"
            style={{ ...grStyle, textDecoration: 'none' }}
          >
            <MessageCircle size={20} strokeWidth={1.7} color="var(--ink)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Sugerir un producto o mayorista</div>
              <div className="perfil-group-sub" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>Por WhatsApp, te respondemos en el día</div>
            </div>
            <ChevronRight size={16} color="var(--line)" style={{ flexShrink: 0 }} />
          </a>

          <button
            className="perfil-gr-press perfil-group-row"
            style={grStyle}
            onClick={() => setExpandida(expandida === 'precios' ? null : 'precios')}
          >
            <HelpCircle size={20} strokeWidth={1.7} color="var(--ink)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Cómo funcionan los precios</div>
              <div className="perfil-group-sub" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>De dónde salen y cada cuánto se actualizan</div>
            </div>
            <ChevronRight size={16} color="var(--line)" style={{ flexShrink: 0, transform: expandida === 'precios' ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease-out)' }} />
          </button>
          {expandida === 'precios' && (
            <div style={{ padding: '4px 16px 14px 48px', fontSize: '12.5px', color: 'var(--gray)', fontWeight: 300, lineHeight: 1.5, background: '#ffffff', borderBottom: '1px solid var(--plate)' }}>
              Los precios salen directo de las webs de cada mayorista y se actualizan cada semana.
              Si un precio tiene más de 30 días, lo marcamos como desactualizado.
            </div>
          )}

          <button
            className="perfil-gr-press"
            style={{ ...grStyle, borderBottom: 'none' }}
            onClick={() => setExpandida(expandida === 'terminos' ? null : 'terminos')}
          >
            <FileText size={20} strokeWidth={1.7} color="var(--ink)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Términos y privacidad</div>
            </div>
            <ChevronRight size={16} color="var(--line)" style={{ flexShrink: 0, transform: expandida === 'terminos' ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease-out)' }} />
          </button>
          {expandida === 'terminos' && (
            <div style={{ padding: '4px 16px 14px 48px', fontSize: '12.5px', color: 'var(--gray)', fontWeight: 300, lineHeight: 1.5, background: '#ffffff' }}>
              Tus datos (listas, perfil, favoritos) se guardan solo en este dispositivo.
              Los precios son informativos y pueden variar en el mayorista. Brújula no vende productos ni intermedia compras.
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="perfil-anim" style={{ animationDelay: '270ms', padding: '30px 20px 0' }}>
          <button
            onClick={handleBorrarDatos}
            style={{
              fontSize: '13px', color: 'var(--destructive)', fontWeight: 400,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'var(--font-sans)',
            }}
          >
            Borrar mis datos de este dispositivo
          </button>
          <div className="tnum" style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '8px', fontWeight: 300 }}>
            Brújula de precios · v1.0{fechaDatos ? ` · datos actualizados ${fechaDatos}` : ''}
          </div>
        </div>
      </div>
    </div>
  )
}
