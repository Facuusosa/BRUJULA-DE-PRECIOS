import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { SITIO_URL } from '@/lib/sitio'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'block',
})

const descripcion = 'Compará precios de mayoristas y cadenas, y ahorrá en cada compra'

// La tarjeta con foto que arman WhatsApp/Instagram sale de opengraph-image.png (convención de Next)
export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: 'Brújula de Precios',
  description: descripcion,
  openGraph: {
    title: 'Brújula de Precios',
    description: descripcion,
    siteName: 'Brújula de Precios',
    locale: 'es_AR',
    type: 'website',
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      {/* poppins.className además de .variable: en prod --font-sans computaba vacía
          (conflicto :root vs @theme de Tailwind v4) y caía a fuente de sistema */}
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          duration={2200}
          toastOptions={{
            style: {
              background: '#ffffff',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13.5px',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
