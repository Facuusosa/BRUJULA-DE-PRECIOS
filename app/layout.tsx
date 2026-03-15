import type { Metadata, Viewport } from 'next'
import { Manrope, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Fuente para títulos y precios
const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
  display: 'swap',
})

// Fuente para cuerpo
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Brújula Mayorista',
  description: 'Compará precios de mayoristas y ahorrá en tu negocio',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#006d38',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${inter.variable} font-body antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
