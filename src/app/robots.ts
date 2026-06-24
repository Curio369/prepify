import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/exam', '/results', '/upload', '/admin', '/library', '/tracker'],
    },
    sitemap: 'https://curioverse.in/sitemap.xml',
  }
}
