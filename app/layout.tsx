import type { Metadata, Viewport } from 'next'
import { Poppins, Barlow_Condensed } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'block',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-barlow-condensed',
  display: 'block',
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
      <body className={`${poppins.variable} ${barlowCondensed.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
