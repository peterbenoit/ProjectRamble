// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

loadLocalEnv()

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    ...(process.env.NODE_ENV === 'production' ? ['@vite-pwa/nuxt'] : []),
    '@nuxt/eslint',
    'shadcn-nuxt',
  ],

  // Expose public env vars to the browser; keep private ones server-only.
  // See docs/API_INTEGRATIONS.md#environment-variables
  runtimeConfig: {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    public: {
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },

  // shadcn-vue component directory
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  // PWA config — only active in production (module excluded in dev)
  // See docs/ARCHITECTURE.md#offline-strategy
  pwa: {
    manifest: false, // We manage public/manifest.json manually
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      additionalManifestEntries: [
        { url: '/data/byways/florida.geojson', revision: null },
      ],
      runtimeCaching: [
        {
          urlPattern: /^\/api\/places\/.*/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'places-api-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
          },
        },
      ],
      navigateFallback: null,
    },
  },

  // Allow GeoJSON imports in components and lib files
  vite: {
    assetsInclude: ['**/*.geojson'],
  },

  // Tailwind is configured in tailwind.config.js
})

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
