import type { MetadataRoute } from 'next'

// Sin sitemap a propósito: la app vive en una sola URL. Se agrega cuando existan URLs por producto.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/outreach.html', '/api/'] },
  }
}
