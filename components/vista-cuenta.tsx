'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, MessageCircle, Building2, User, CreditCard } from 'lucide-react'
import { PricingSection } from './pricing-section'
import { btnHover, iconTap, chipHover } from '@/lib/motion-variants'

const WHATSAPP_NUMERO = '541168079566'
const WHATSAPP_MSG = encodeURIComponent('Hola Facundo, quiero activar el plan Pro de Brujula de Precios')

interface BrujulaPerfil {
  nombre: string
}

interface BrujulaConfig {
  nombreNegocio: string
  rubro: 'Almacen' | 'Kiosco' | 'Minimercado' | 'Otro'
  mayoristasPreferidos: string[]
}

const MAYORISTAS = ['Yaguar', 'Maxiconsumo', 'MaxiCarrefour']
const RUBROS = ['Almacen', 'Kiosco', 'Minimercado', 'Otro'] as const

const TABS = [
  { id: 'perfil',      label: 'Perfil',       icon: User },
  { id: 'negocio',     label: 'Mi negocio',   icon: Building2 },
  { id: 'facturacion', label: 'Facturación',  icon: CreditCard },
] as const

type TabId = typeof TABS[number]['id']

export function VistaCuenta() {
  const [tabActiva, setTabActiva] = useState<TabId>('perfil')
  const [perfil, setPerfil] = useState<BrujulaPerfil>({ nombre: '' })
  const [config, setConfig] = useState<BrujulaConfig>({
    nombreNegocio: '',
    rubro: 'Almacen',
    mayoristasPreferidos: ['Yaguar', 'Maxiconsumo', 'MaxiCarrefour'],
  })
  const [guardadoPerfil, setGuardadoPerfil] = useState(false)
  const [guardadoNegocio, setGuardadoNegocio] = useState(false)

  useEffect(() => {
    const savedPerfil = localStorage.getItem('brujula_perfil')
    if (savedPerfil) { try { setPerfil(JSON.parse(savedPerfil)) } catch {} }
    const savedConfig = localStorage.getItem('brujula_config')
    if (savedConfig) { try { setConfig(JSON.parse(savedConfig)) } catch {} }
  }, [])

  const handleGuardarPerfil = () => {
    localStorage.setItem('brujula_perfil', JSON.stringify(perfil))
    setGuardadoPerfil(true)
    setTimeout(() => setGuardadoPerfil(false), 2000)
  }

  const handleGuardarNegocio = () => {
    localStorage.setItem('brujula_config', JSON.stringify(config))
    setGuardadoNegocio(true)
    setTimeout(() => setGuardadoNegocio(false), 2000)
  }

  const toggleMayorista = (m: string) => {
    setConfig(prev => ({
      ...prev,
      mayoristasPreferidos: prev.mayoristasPreferidos.includes(m)
        ? prev.mayoristasPreferidos.filter(x => x !== m)
        : [...prev.mayoristasPreferidos, m],
    }))
  }

  const iniciales = perfil.nombre
    ? perfil.nombre.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const tabIndex = TABS.findIndex(t => t.id === tabActiva)

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100%', paddingBottom: '40px' }}>
      <style>{`
        .cuenta-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #2a2a2a;
          border-radius: 8px;
          font-size: 14px;
          color: #f7f7f7;
          background: #141414;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        .cuenta-input:focus { border-color: #d4a574; }
        .cuenta-input option { background: #141414; color: #f7f7f7; }
        .cuenta-label {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }
        .cuenta-label-muted {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
          opacity: 0.6;
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 165, 116, 0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(212, 165, 116, 0); }
        }
        .pro-pulse { animation: borderPulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* Tab bar sticky */}
      <div style={{ position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10, borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex' }}>
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = tabActiva === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  whileHover={!isActive ? { backgroundColor: 'rgba(212,165,116,0.06)' } : {}}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '14px 8px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#d4a574' : '#6b7280',
                    borderRadius: '0',
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                </motion.button>
              )
            })}
          </div>
          {/* Underline deslizante */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: `${100 / TABS.length}%`,
            height: '2px', background: '#d4a574',
            transform: `translateX(${tabIndex * 100}%)`,
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>
      </div>

      {/* Contenido tabs */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── TAB PERFIL ── */}
        {tabActiva === 'perfil' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '28px 0 16px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: '#d4a574', color: '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', fontWeight: 800, letterSpacing: '0.02em',
                userSelect: 'none',
              }}>
                {iniciales}
              </div>
              {perfil.nombre && (
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#f7f7f7' }}>{perfil.nombre}</p>
              )}
            </div>

            <div style={{ background: '#141414', borderRadius: '12px', border: '1px solid #2a2a2a', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="cuenta-label" htmlFor="perfil-nombre">¿Cómo te llamás?</label>
                <input
                  id="perfil-nombre"
                  className="cuenta-input"
                  placeholder="Tu nombre o apodo"
                  value={perfil.nombre}
                  onChange={e => setPerfil({ nombre: e.target.value })}
                />
              </div>

              {/* Email bloqueado */}
              <div>
                <label className="cuenta-label-muted">Email (disponible en PRO)</label>
                <motion.div
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MSG}`, '_blank')}
                  whileHover={{ borderColor: '#d4a574' }}
                  transition={{ duration: 0.15 }}
                  style={{
                    padding: '12px 14px',
                    background: '#1a1a1a',
                    border: '1.5px solid #2a2a2a',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Lock size={14} color="#6b7280" />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>tu@email.com</span>
                  </div>
                  <span style={{ background: '#d4a574', color: '#0a0a0a', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>PRO</span>
                </motion.div>
              </div>

              {/* Contraseña bloqueada */}
              <div>
                <label className="cuenta-label-muted">Contraseña (disponible en PRO)</label>
                <motion.div
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MSG}`, '_blank')}
                  whileHover={{ borderColor: '#d4a574' }}
                  transition={{ duration: 0.15 }}
                  style={{
                    padding: '12px 14px',
                    background: '#1a1a1a',
                    border: '1.5px solid #2a2a2a',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Lock size={14} color="#6b7280" />
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>••••••••</span>
                  </div>
                  <span style={{ background: '#d4a574', color: '#0a0a0a', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>PRO</span>
                </motion.div>
              </div>

              <motion.button
                onClick={handleGuardarPerfil}
                {...btnHover}
                style={{
                  background: guardadoPerfil ? '#16a34a' : '#d4a574',
                  color: '#0a0a0a', border: 'none', borderRadius: '6px',
                  padding: '12px', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                  textTransform: 'uppercase',
                }}
              >
                {guardadoPerfil ? 'Guardado' : 'Guardar'}
              </motion.button>
            </div>
          </>
        )}

        {/* ── TAB MI NEGOCIO ── */}
        {tabActiva === 'negocio' && (
          <div style={{ background: '#141414', borderRadius: '12px', border: '1px solid #2a2a2a', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
              Estos datos personalizan tu experiencia en la app
            </p>

            <div>
              <label className="cuenta-label" htmlFor="nombre-negocio">Nombre del negocio</label>
              <input
                id="nombre-negocio"
                className="cuenta-input"
                placeholder="Tu almacen, kiosco, negocio..."
                value={config.nombreNegocio}
                onChange={e => setConfig(prev => ({ ...prev, nombreNegocio: e.target.value }))}
              />
            </div>

            <div>
              <label className="cuenta-label" htmlFor="rubro">Rubro</label>
              <select
                id="rubro"
                className="cuenta-input"
                value={config.rubro}
                onChange={e => setConfig(prev => ({ ...prev, rubro: e.target.value as BrujulaConfig['rubro'] }))}
                style={{ cursor: 'pointer' }}
              >
                {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <span className="cuenta-label">Mayoristas que usás</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {MAYORISTAS.map(m => (
                  <motion.label
                    key={m}
                    whileHover={{ backgroundColor: 'rgba(212,165,116,0.06)' }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      cursor: 'pointer', padding: '8px 10px', borderRadius: '8px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={config.mayoristasPreferidos.includes(m)}
                      onChange={() => toggleMayorista(m)}
                      style={{ width: '18px', height: '18px', accentColor: '#d4a574', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#f7f7f7', fontWeight: 500, flex: 1 }}>{m}</span>
                    {m === 'MaxiCarrefour' && (
                      <span style={{ background: '#d4a574', color: '#0a0a0a', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
                        PRO
                      </span>
                    )}
                  </motion.label>
                ))}
              </div>
            </div>

            <motion.button
              onClick={handleGuardarNegocio}
              {...btnHover}
              style={{
                background: guardadoNegocio ? '#16a34a' : '#d4a574',
                color: '#0a0a0a', border: 'none', borderRadius: '6px',
                padding: '12px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif',
                textTransform: 'uppercase',
              }}
            >
              {guardadoNegocio ? 'Guardado' : 'Guardar'}
            </motion.button>
          </div>
        )}

        {/* ── TAB FACTURACIÓN ── */}
        {tabActiva === 'facturacion' && (
          <>
            <PricingSection
              onWhatsApp={() => window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MSG}`, '_blank')}
            />

            {/* Contacto */}
            <div style={{ background: '#141414', borderRadius: '12px', border: '1px solid #2a2a2a', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f7f7f7' }}>¿Preguntas?</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Escribinos por WhatsApp</p>
                </div>
                <motion.button
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMERO}`, '_blank')}
                  {...btnHover}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#d4a574', color: '#0a0a0a',
                    border: 'none', borderRadius: '6px',
                    padding: '8px 14px', fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <MessageCircle size={16} />
                  Escribir
                </motion.button>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2a2a2a' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>Brujula de Precios v1.0</p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
