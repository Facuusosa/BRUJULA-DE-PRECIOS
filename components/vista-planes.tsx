'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, Check, Lock } from 'lucide-react'
import { productos, diasDesdeScrapingDe } from '@/lib/data'

const FUENTES_TRUST = ['Yaguar', 'MaxiCarrefour', 'Maxiconsumo', 'Coto']
import { LogoBrujula } from '@/components/logo-brujula'
import { ShuffleValue } from '@/components/shuffle-value'

const WHATSAPP_NUMERO = '541168079566'

interface VistaPlanesProps {
  onBack: () => void
}

const fmt = new Intl.NumberFormat('es-AR')

export function VistaPlanes({ onBack }: VistaPlanesProps) {
  const [billing, setBilling] = useState<'mensual' | 'anual'>('mensual')

  const perdidasMaxiconsumo = useMemo(() =>
    productos.filter(p => {
      const validos = p.precios.filter(pr => pr.precio > 0 && pr.tipoFuente === 'mayorista')
      if (validos.length < 2) return false
      const mejor = validos.reduce((a, b) => (a.precio <= b.precio ? a : b))
      return mejor.mayorista === 'Maxiconsumo'
    }).length, []
  )

  // Texto de trust honesto: si alguna de las 4 fuentes lleva más de un dia sin
  // actualizar (ej. un scraper que fallo), no podemos decir "esta semana" a secas.
  const textoActualizacion = useMemo(() => {
    let peor = 0
    for (const p of productos) {
      for (const pr of p.precios) {
        if (!FUENTES_TRUST.includes(pr.mayorista) || pr.precio <= 0) continue
        const dias = diasDesdeScrapingDe(pr)
        if (dias !== null && dias > peor) peor = dias
      }
    }
    if (peor === 0) return 'hoy'
    if (peor === 1) return 'ayer'
    return `hace ${peor} días`
  }, [])

  const msgUpgrade = encodeURIComponent(
    `Hola Facundo, quiero activar Brújula PRO (plan ${billing === 'anual' ? 'anual' : 'mensual'})`
  )

  const featLi: React.CSSProperties = {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    fontSize: '13.5px', fontWeight: 300, padding: '6px 0', lineHeight: 1.5,
    color: 'var(--ink)',
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100%' }}>
      <style>{`
        /* Entrada con blur — como el componente de pricing de 21st.dev */
        @keyframes planes-card-in {
          from { opacity: 0; transform: translateY(22px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .planes-anim { opacity: 0; animation: planes-card-in 600ms var(--ease-out) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .planes-anim { animation: none; opacity: 1; }
        }
        .planes-cards { display: grid; grid-template-columns: 1fr; gap: 18px; margin-top: 30px; }
        @media (min-width: 860px) {
          .planes-cards { grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
          .planes-card-free { order: 1; }
          .planes-card-pro { order: 2; }
        }
        /* Shiny sweep (ReactBits ShinyText adaptado) — solo en EL CTA, cada 3.5s */
        .planes-cta-pro { position: relative; overflow: hidden; }
        .planes-cta-pro::after {
          content: '';
          position: absolute; top: 0; bottom: 0; width: 40%;
          background: linear-gradient(105deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: planes-sweep 3.5s var(--ease-out) infinite;
        }
        @keyframes planes-sweep { 0% { left: -45%; } 38% { left: 110%; } 100% { left: 110%; } }
        @media (prefers-reduced-motion: reduce) { .planes-cta-pro::after { animation: none; } }
      `}</style>

      <div style={{ maxWidth: '1020px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Topbar */}
        <div className="planes-anim" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0 0' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', fontWeight: 500, color: 'var(--ink)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', padding: '6px 0',
            }}
          >
            <ChevronLeft size={20} strokeWidth={2} />
            Volver al perfil
          </button>
          <LogoBrujula size={32} />
        </div>

        {/* Hero */}
        <div className="planes-anim" style={{ animationDelay: '60ms', padding: '34px 0 0' }}>
          <h1 style={{
            fontSize: 'clamp(30px, 5vw, 46px)',
            fontWeight: 600, letterSpacing: '-1.2px', lineHeight: 1.12,
            textWrap: 'balance', maxWidth: '560px',
            margin: 0, color: 'var(--ink)',
          }}>
            Hay un plan perfecto para tu negocio
          </h1>
          <p className="tnum" style={{ marginTop: '12px', fontSize: '14.5px', color: 'var(--gray)', fontWeight: 300, maxWidth: '440px', lineHeight: 1.6 }}>
            Con 2 mayoristas ya encontrás ahorro. Con los 3 no te perdés nada:
            Maxiconsumo tuvo el mejor precio en <b style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt.format(perdidasMaxiconsumo)} productos</b>.
          </p>

          {/* Toggle de facturación */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            marginTop: '24px',
            background: 'var(--plate)', borderRadius: '999px', padding: '5px',
          }}>
            <button
              onClick={() => setBilling('mensual')}
              style={{
                border: 'none',
                background: billing === 'mensual' ? 'linear-gradient(160deg, var(--gold), var(--gold-deep))' : 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px', fontWeight: billing === 'mensual' ? 600 : 500,
                color: billing === 'mensual' ? '#ffffff' : 'var(--gray)',
                padding: '10px 20px', borderRadius: '999px', cursor: 'pointer',
                boxShadow: billing === 'mensual' ? '0 2px 8px rgba(176,122,63,0.35)' : 'none',
                transition: 'background 200ms var(--ease-out), color 200ms var(--ease-out)',
              }}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('anual')}
              style={{
                border: 'none',
                background: billing === 'anual' ? 'linear-gradient(160deg, var(--gold), var(--gold-deep))' : 'none',
                fontFamily: 'var(--font-sans)',
                fontSize: '13.5px', fontWeight: billing === 'anual' ? 600 : 500,
                color: billing === 'anual' ? '#ffffff' : 'var(--gray)',
                padding: '10px 20px', borderRadius: '999px', cursor: 'pointer',
                boxShadow: billing === 'anual' ? '0 2px 8px rgba(176,122,63,0.35)' : 'none',
                transition: 'background 200ms var(--ease-out), color 200ms var(--ease-out)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              Anual
              <span style={{
                fontSize: '10.5px', fontWeight: 600,
                background: billing === 'anual' ? 'rgba(255,255,255,0.25)' : '#ffffff',
                color: billing === 'anual' ? '#ffffff' : 'var(--green)',
                borderRadius: '999px', padding: '3px 8px',
              }}>
                Ahorrá 20%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="planes-cards">

          {/* PRO */}
          <div className="planes-card-pro planes-anim" style={{
            animationDelay: '140ms',
            border: '1.5px solid var(--gold)',
            borderRadius: '18px',
            padding: '30px 28px',
            background: 'linear-gradient(165deg, rgba(200,144,85,0.09), rgba(200,144,85,0.02) 55%, transparent)',
            position: 'relative',
            display: 'flex', flexDirection: 'column',
          }}>
            <span style={{
              position: 'absolute', top: '24px', right: '24px',
              background: 'linear-gradient(160deg, var(--gold), var(--gold-deep))',
              color: '#ffffff',
              fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.12em',
              borderRadius: '999px', padding: '5px 13px',
            }}>
              RECOMENDADO
            </span>
            <div style={{ fontSize: '21.4px', fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--ink)' }}>Brújula PRO</div>
            <p style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: 300, marginTop: '5px', lineHeight: 1.55, maxWidth: '330px' }}>
              Para el comerciante que compra todas las semanas y no quiere regalar margen.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '20px' }}>
              <ShuffleValue
                value={billing === 'anual' ? '$ 3.999' : '$ 4.999'}
                duration={360}
                style={{ fontSize: '38px', fontWeight: 700, letterSpacing: '-1px', color: 'var(--ink)' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: 300 }}>/ mes</span>
            </div>
            <div className="tnum" style={{ fontSize: '12px', color: 'var(--gray)', fontWeight: 300, marginTop: '2px', minHeight: '18px' }}>
              {billing === 'anual'
                ? <>Facturado anual $ 47.990 · <b style={{ color: 'var(--green)', fontWeight: 600 }}>ahorrás $ 12.000 al año</b></>
                : <>Se paga con <b style={{ color: 'var(--green)', fontWeight: 600 }}>un solo carrito bien comprado</b></>}
            </div>
            <a
              className="planes-cta-pro"
              href={`https://wa.me/${WHATSAPP_NUMERO}?text=${msgUpgrade}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: '20px',
                border: 'none', borderRadius: '999px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px', fontWeight: 600,
                padding: '15px 0', width: '100%',
                background: 'linear-gradient(160deg, var(--gold), var(--gold-deep))',
                color: '#ffffff',
                boxShadow: '0 6px 18px rgba(176,122,63,0.35)',
                textAlign: 'center', textDecoration: 'none', display: 'block',
                cursor: 'pointer',
              }}
            >
              Desbloquear los 3 mayoristas
            </a>
            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray)', fontWeight: 300, marginTop: '9px' }}>
              7 días gratis · Cancelás cuando quieras
            </div>
            <div style={{ marginTop: '22px' }}>
              <div style={{ fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--gray)', textTransform: 'uppercase' }}>
                Todo lo del plan gratis, más
              </div>
              <ul style={{ listStyle: 'none', marginTop: '10px', padding: 0 }}>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><b style={{ fontWeight: 600 }}>Los 3 mayoristas</b> — nunca te perdés el más barato</span>
                </li>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><b style={{ fontWeight: 600 }}>&quot;Dónde comprar&quot;</b> — te armamos la compra más barata entre varios</span>
                </li>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><b style={{ fontWeight: 600 }}>Listas ilimitadas</b> — por sector, por semana, como quieras</span>
                </li>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span><b style={{ fontWeight: 600 }}>Enviá tus listas por WhatsApp</b> a tu repartidor o socio</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FREE */}
          <div className="planes-card-free planes-anim" style={{
            animationDelay: '220ms',
            border: '1px solid var(--line)',
            borderRadius: '18px',
            padding: '30px 28px',
            background: '#ffffff',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: '21.4px', fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--ink)' }}>Gratis</div>
            <p style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: 300, marginTop: '5px', lineHeight: 1.55, maxWidth: '330px' }}>
              Para probar la brújula y empezar a comparar sin poner un peso.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px', marginTop: '20px' }}>
              <span className="tnum" style={{ fontSize: '38px', fontWeight: 700, letterSpacing: '-1px', color: 'var(--ink)' }}>$ 0</span>
              <span style={{ fontSize: '13px', color: 'var(--gray)', fontWeight: 300 }}>para siempre</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--gray)', fontWeight: 300, marginTop: '2px', minHeight: '18px' }}>
              Tu plan actual
            </div>
            <button
              onClick={onBack}
              style={{
                marginTop: '20px',
                borderRadius: '999px',
                fontFamily: 'var(--font-sans)',
                fontSize: '14.5px', fontWeight: 500,
                padding: '15px 0', width: '100%',
                background: '#ffffff', color: 'var(--ink)',
                border: '1.5px solid var(--ink)',
                cursor: 'pointer',
              }}
            >
              Seguir con el plan gratis
            </button>
            <div style={{ marginTop: '9px', minHeight: '18px' }} />
            <div style={{ marginTop: '22px' }}>
              <div style={{ fontSize: '10.7px', fontWeight: 600, letterSpacing: '0.14em', color: 'var(--gray)', textTransform: 'uppercase' }}>
                Incluye
              </div>
              <ul style={{ listStyle: 'none', marginTop: '10px', padding: 0 }}>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>2 mayoristas: MaxiCarrefour y Yaguar</span>
                </li>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Precio góndola de Coto en todos los productos</span>
                </li>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Comparador y calculadora de margen</span>
                </li>
                <li style={featLi}>
                  <Check size={17} strokeWidth={2.5} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>1 lista de compras</span>
                </li>
                <li style={{ ...featLi, color: 'var(--gray)' }}>
                  <Lock size={17} strokeWidth={1.8} color="var(--line)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Maxiconsumo</span>
                </li>
                <li style={{ ...featLi, color: 'var(--gray)' }}>
                  <Lock size={17} strokeWidth={1.8} color="var(--line)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>&quot;Dónde comprar&quot; en Mi Lista</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust */}
        <div className="tnum planes-anim" style={{
          animationDelay: '300ms',
          textAlign: 'center', fontSize: '12px', color: 'var(--gray)', fontWeight: 300,
          padding: '26px 30px 0', lineHeight: 1.6,
        }}>
          Precios actualizados <b style={{ color: 'var(--green)', fontWeight: 600 }}>{textoActualizacion}</b> de
          Yaguar, MaxiCarrefour, Maxiconsumo y Coto · {fmt.format(productos.length)} productos relevados
        </div>
      </div>
    </div>
  )
}
