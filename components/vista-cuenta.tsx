'use client'

import { Bell, Store, CreditCard, ChevronRight, LogOut } from 'lucide-react'

export function VistaCuenta() {
  const usuario = {
    nombre: 'Juan Perez',
    email: 'juan@comercio.com',
    iniciales: 'JP',
    plan: 'Pro',
  }

  const menuItems = [
    { Icon: Bell,       label: 'Alertas de precio', desc: 'Configura notificaciones' },
    { Icon: Store,      label: 'Mis mayoristas',     desc: 'Gestiona tus favoritos' },
    { Icon: CreditCard, label: 'Suscripcion',        desc: 'Plan Pro activo' },
  ]

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100%', paddingBottom: '40px' }}>
      <style>{`
        .cuenta-inner {
          max-width: 500px;
          margin: 0 auto;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 768px) {
          .cuenta-inner {
            padding: 40px 20px;
          }
        }
      `}</style>

      <div className="cuenta-inner">

        {/* Avatar + Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', paddingTop: '8px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: '#0a0a0a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#d4a574' }}>{usuario.iniciales}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#0a0a0a', fontFamily: 'var(--font-barlow-condensed), "Barlow Condensed", sans-serif', textTransform: 'uppercase', letterSpacing: '0.01em' }}>{usuario.nombre}</p>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#4a5568' }}>{usuario.email}</p>
          </div>
        </div>

        {/* Card plan */}
        <div style={{
          background: '#0a0a0a',
          borderRadius: '16px',
          padding: '20px',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>
              TU PLAN
            </span>
            <span style={{
              background: '#d4a574', color: '#0a0a0a',
              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
            }}>
              {usuario.plan}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4a574' }} />
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)' }}>Activo</span>
          </div>
          <button style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '8px', color: '#fff',
            fontSize: '13px', fontWeight: 600, padding: '8px 16px', cursor: 'pointer',
          }}>
            Gestionar suscripcion
          </button>
        </div>

        {/* Label sección */}
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#4a5568', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '-8px' }}>
          MI CUENTA
        </div>

        {/* Cards menú */}
        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          {menuItems.map(({ Icon, label, desc }, i) => (
            <div key={label}>
              {i > 0 && <div style={{ height: '1px', background: '#f0f0f0', margin: '0 20px' }} />}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '18px 20px', cursor: 'pointer',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#e8f5e9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={20} color="#0a0a0a" strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0a0a0a' }}>{label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>{desc}</p>
                </div>
                <ChevronRight size={18} color="#9ca3af" />
              </div>
            </div>
          ))}
        </div>

        {/* Cerrar sesion */}
        <button style={{
          width: '100%', background: 'transparent',
          border: '1.5px solid #ef4444', borderRadius: '10px',
          color: '#ef4444', fontSize: '14px', fontWeight: 700,
          padding: '14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <LogOut size={18} />
          Cerrar sesion
        </button>

      </div>
    </div>
  )
}
