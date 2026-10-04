import { toast } from 'sonner'
import { SITIO_URL } from '@/lib/sitio'

// El link abre el catálogo ya buscado (?q=): antes se compartía solo el nombre,
// y quien lo recibía no tenía cómo llegar a la app
export function compartirProducto(nombre: string) {
  const url = `${SITIO_URL}/?q=${encodeURIComponent(nombre)}`
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ title: nombre, text: `${nombre} — Brújula de Precios`, url }).catch(() => null)
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(`${nombre} — ${url}`)
    toast.success('Link copiado')
  }
}
