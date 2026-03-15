'use client'

import { motion } from 'framer-motion'
import { Bell, Store, CreditCard, LogOut, ChevronRight } from 'lucide-react'

// Vista de Mi Cuenta con perfil y configuración
export function VistaCuenta() {
  // Datos de usuario simulados
  const usuario = {
    nombre: 'Juan Pérez',
    email: 'juan@comercio.com',
    iniciales: 'JP',
    plan: 'Pro',
    activo: true
  }
  
  const menuItems = [
    { icon: Bell, label: 'Alertas de precio', descripcion: 'Configurá notificaciones' },
    { icon: Store, label: 'Mis mayoristas', descripcion: 'Gestioná tus favoritos' },
    { icon: CreditCard, label: 'Suscripción', descripcion: 'Plan Pro activo' },
  ]
  
  return (
    <div className="pb-24 pt-4 px-4">
      {/* Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        {/* Avatar */}
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#e8f5ee' }}
        >
          <span 
            className="font-heading font-bold text-lg"
            style={{ color: '#006d38' }}
          >
            {usuario.iniciales}
          </span>
        </div>
        
        {/* Info */}
        <div>
          <h2 className="font-heading font-bold text-lg text-[#0f172a]">
            {usuario.nombre}
          </h2>
          <p className="font-body text-sm text-[#64748b]">
            {usuario.email}
          </p>
        </div>
      </motion.div>
      
      {/* Card de plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 mb-6"
        style={{ backgroundColor: '#006d38' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-body text-[10px] uppercase tracking-wider text-white/60 block">
              Tu plan
            </span>
            <span className="font-heading font-extrabold text-2xl text-white">
              {usuario.plan}
            </span>
          </div>
          
          <div 
            className="px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <span className="font-heading font-bold text-sm text-white">
              Activo
            </span>
          </div>
        </div>
      </motion.div>
      
      {/* Menú de opciones */}
      <div className="flex flex-col gap-2 mb-8">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
            className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-transform active:scale-98"
            style={{ backgroundColor: '#f2f4f6' }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: '#e8f5ee' }}
            >
              <item.icon className="w-5 h-5" style={{ color: '#006d38' }} />
            </div>
            
            <div className="flex-1">
              <span className="font-heading font-semibold text-sm text-[#0f172a] block">
                {item.label}
              </span>
              <span className="font-body text-xs text-[#64748b]">
                {item.descripcion}
              </span>
            </div>
            
            <ChevronRight className="w-5 h-5 text-[#94a3b8]" />
          </motion.button>
        ))}
      </div>
      
      {/* Botón cerrar sesión */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full flex items-center justify-center gap-2 h-14 rounded-xl font-heading font-semibold transition-colors"
        style={{ 
          border: '2px solid #ef4444',
          color: '#ef4444'
        }}
      >
        <LogOut className="w-5 h-5" />
        Cerrar sesión
      </motion.button>
    </div>
  )
}
