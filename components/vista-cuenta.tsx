'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { User, Store, Star, Lock, Bell, MessageCircle, HelpCircle, FileText, ChevronRight, ArrowRight } from 'lucide-react'
import { productos } from '@/lib/data'
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
  rubro: 'Almacen' | 'Kiosco' | 'Minimercado' | 'Otro'
  avisosBombas?: boolean
}

const LOGOS: Record<string, string> = {
  'Maxiconsumo':   '/mayoristas/maxiconsumo.webp',
  'Yaguar':        '/mayoristas/yaguar.png',
  'MaxiCarrefour': '/mayoristas/maxicarrefour.jpg',
}

function diasDesde(fecha: string): string {
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000)
  if (dias <= 0) return 'Actualizado hoy'
  if (dias === 1) return 'Actualizado ayer'
  return `Actualizado hace ${dias} días`
}

function Switch({ on, locked, onToggle }: { on: boolean; locked?: boolean; onToggle?: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={locked}
      aria-checked={on}
      role="switch"
      style={{
        width: '44px', height: '26px', borderRadius: '99px',
        background: on ? 'var(--green)' : 'var(--line)',
        position: 'relative', flexShrink: 0,
        border: 'none',
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.45 : 1,
        transition: 'background 200ms ease',
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: '3px',
        width: '20px', height: '20px', borderRadius: '99px', background: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transform: on ? 'translateX(18px)' : 'translateX(0)',
        transition: 'transform 200ms var(--ease-out)',
        display: 'block',
      }} />
    </button>
  )
}

export function VistaCuenta({ onIrAPlanes }: VistaCuentaProps) {
  const [perfil, setPerfil] = useState<BrujulaPerfil>({ nombre: '' })
  const [config, setConfig] = useState<BrujulaConfig>({ nombreNegocio: '', rubro: 'Kiosco', avisosBombas: true })
  const [listasCount, setListasCount] = useState(0)
  const [editandoNombre, setEditandoNombre] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [cargado, setCargado] = useState(false)

  useEffect(() => {
    const savedPerfil = localStorage.getItem('brujula_perfil')
    if (savedPerfil) { try { setPerfil(JSON.parse(savedPerfil)) } catch {} }
    const savedConfig = localStorage.getItem('brujula_config')
    if (savedConfig) { try { setConfig(prev => ({ ...prev, ...JSON.parse(savedConfig) })) } catch {} }
    const savedListas = localStorage.getItem('brujula_listas')
    if (savedListas) { try { setListasCount(JSON.parse(savedListas).length) } catch {} }
    setCargado(true)
  }, [])

  useEffect(() => {
    if (cargado) localStorage.setItem('brujula_perfil', JSON.stringify(perfil))
  }, [perfil, cargado])

  useEffect(() => {
    if (cargado) localStorage.setItem('brujula_config', JSON.stringify(config))
  }, [config, cargado])

  const comparados = useMemo(() => productos.filter(p => p.precios.filter(pr => pr.precio > 0).length >= 2).length, [])

  const ahorroTotal = useMemo(() =>
    productos.reduce((sum, p) => {
      const validos = p.precios.filter(pr => pr.precio > 0)
      if (validos.length < 2) return sum
      const min = Math.min(...validos.map(v => v.precio))
      const max = Math.max(...validos.map(v => v.precio))
      return sum + (max - min)
    }, 0), []
  )

  // Productos donde Maxiconsumo (el mayorista PRO) tiene el mejor precio
  const perdidasMaxiconsumo = useMemo(() =>
    productos.filter(p => {
      const validos = p.precios.filter(pr => pr.precio > 0)
      if (validos.length < 2) return false
      const mejor = validos.reduce((a, b) => (a.precio <= b.precio ? a : b))
      return mejor.mayorista === 'Maxiconsumo'
    }).length, []
  )

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

  const proPillStyle: React.CSSProperties = {
    fontSize: '9.5px', fontWeight: 600, letterSpacing: '0.08em',
    color: 'var(--gold)', border: '1px solid var(--gold)',
    borderRadius: '999px', padding: '2px 8px', flexShrink: 0,
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
              {perfil.nombre || 'Tu negocio'}
            </h1>
            <div style={{ fontSize: '12.5px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>
              {config.rubro === 'Almacen' ? 'Almacén' : config.rubro} · Buenos Aires
            </div>
            <span style={{
              display: 'inline-flex', marginTop: '6px',
              background: 'var(--pill)', color: '#ffffff',
              fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.1em',
              borderRadius: '999px', padding: '3px 11px',
            }}>
              PLAN FREE
            </span>
          </div>
        </div>

        {/* Stats con CountUp */}
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
              {cargado ? <CountUp from={0} to={Math.round(ahorroTotal / 1000000)} duration={0.9} prefix="$" suffix=" M" separator="." /> : `$${Math.round(ahorroTotal / 1000000)} M`}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--gray)', fontWeight: 400, marginTop: '1px', lineHeight: 1.3 }}>
              ahorro detectado en catálogo
            </div>
          </div>
          <div className="perfil-stat-card" style={{ flex: 1, background: 'var(--plate)', borderRadius: '10px', padding: '12px 14px' }}>
            <div className="tnum perfil-stat-val" style={{ fontSize: '17px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--ink)' }}>
              {cargado ? <CountUp from={0} to={listasCount} duration={0.5} /> : listasCount}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--gray)', fontWeight: 400, marginTop: '1px', lineHeight: 1.3 }}>
              listas activas
            </div>
          </div>
        </div>

        {/* Banner de upgrade → Planes */}
        <button
          className="perfil-anim perfil-gr-press"
          onClick={onIrAPlanes}
          style={{
            animationDelay: '150ms',
            margin: '18px 20px 0',
            width: 'calc(100% - 40px)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
            border: '1.5px solid var(--gold)', borderRadius: '12px',
            padding: '14px 16px',
            background: 'linear-gradient(100deg, rgba(200,144,85,0.07), transparent 70%)',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <div>
            <div className="perfil-upgrade-title" style={{ fontSize: '13.5px', fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)' }}>
              Te estás perdiendo el más barato
            </div>
            <div className="tnum perfil-upgrade-sub" style={{ fontSize: '11.5px', color: 'var(--gray)', fontWeight: 300, marginTop: '2px' }}>
              Maxiconsumo tuvo el mejor precio en {perdidasMaxiconsumo.toLocaleString('es-AR')} productos
            </div>
          </div>
          <span style={{
            flexShrink: 0,
            width: '34px', height: '34px', borderRadius: '99px',
            background: 'var(--gold)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowRight size={16} strokeWidth={2.5} />
          </span>
        </button>

        {/* Mi negocio */}
        <div className="perfil-anim perfil-section-label" style={{ ...groupLabelStyle, animationDelay: '180ms' }}>Mi negocio</div>
        <div className="perfil-anim" style={{ ...groupStyle, animationDelay: '180ms' }}>
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
            <select
              value={config.rubro}
              onChange={e => setConfig(prev => ({ ...prev, rubro: e.target.value as BrujulaConfig['rubro'] }))}
              aria-label="Rubro del negocio"
              style={{
                fontSize: '13px', color: 'var(--gray)', fontWeight: 300,
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-sans)', cursor: 'pointer', textAlign: 'right',
              }}
            >
              <option value="Kiosco">Kiosco</option>
              <option value="Almacen">Almacén</option>
              <option value="Minimercado">Minimercado</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <button className="perfil-gr-press perfil-group-row" style={grStyle} onClick={onIrAPlanes}>
            <Star size={20} strokeWidth={1.7} color="var(--gold)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Mi plan</div>
              <div className="perfil-group-sub" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>Gratis · 2 de 3 mayoristas</div>
            </div>
            <span style={proPillStyle}>VER PLANES</span>
            <ChevronRight size={16} color="var(--line)" style={{ flexShrink: 0 }} />
          </button>

          <div style={{ ...grStyle, borderBottom: 'none' }}>
            <Lock size={20} strokeWidth={1.7} color="var(--gray)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Email y contraseña</div>
              <div className="perfil-group-sub" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>Accedé desde cualquier dispositivo</div>
            </div>
            <span style={proPillStyle}>PRO</span>
          </div>
        </div>

        {/* Mis mayoristas */}
        <div className="perfil-anim perfil-section-label" style={{ ...groupLabelStyle, animationDelay: '210ms' }}>Mis mayoristas</div>
        <div className="perfil-anim" style={{ ...groupStyle, animationDelay: '210ms' }}>
          {(['MaxiCarrefour', 'Yaguar', 'Maxiconsumo'] as const).map((m, idx) => {
            const esPro = m === 'Maxiconsumo'
            return (
              <div key={m} style={{ ...grStyle, borderBottom: idx === 2 ? 'none' : '1px solid var(--plate)' }}>
                <span style={{
                  width: '56px', height: '24px', borderRadius: '5px',
                  border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Image
                    src={LOGOS[m]}
                    alt={m}
                    width={46}
                    height={15}
                    style={{ maxWidth: '46px', maxHeight: '15px', objectFit: 'contain', width: 'auto', height: 'auto' }}
                    unoptimized
                  />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>{m}</div>
                  <div className="tnum" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>
                    {esPro ? 'Desbloquealo con PRO' : (ultimaActualizacion[m] ? diasDesde(ultimaActualizacion[m]) : 'Precios incluidos')}
                  </div>
                </div>
                {esPro && <span style={proPillStyle}>PRO</span>}
                <Switch on={!esPro} locked={esPro} />
              </div>
            )
          })}
        </div>

        {/* Avisos */}
        <div className="perfil-anim perfil-section-label" style={{ ...groupLabelStyle, animationDelay: '240ms' }}>Avisos</div>
        <div className="perfil-anim" style={{ ...groupStyle, animationDelay: '240ms' }}>
          <div style={{ ...grStyle, borderBottom: 'none' }}>
            <Bell size={20} strokeWidth={1.7} color="var(--ink)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="perfil-group-lbl" style={{ fontSize: '14px', fontWeight: 400, color: 'var(--ink)' }}>Avisarme de bombas nuevas</div>
              <div className="perfil-group-sub" style={{ fontSize: '11px', color: 'var(--gray)', fontWeight: 300, marginTop: '1px' }}>Cuando un producto tuyo baje fuerte</div>
            </div>
            <Switch
              on={config.avisosBombas !== false}
              onToggle={() => setConfig(prev => ({ ...prev, avisosBombas: prev.avisosBombas === false }))}
            />
          </div>
        </div>

        {/* Ayuda */}
        <div className="perfil-anim perfil-section-label" style={{ ...groupLabelStyle, animationDelay: '270ms' }}>Ayuda</div>
        <div className="perfil-anim" style={{ ...groupStyle, animationDelay: '270ms' }}>
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
        <div className="perfil-anim" style={{ animationDelay: '300ms', padding: '30px 20px 0' }}>
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
