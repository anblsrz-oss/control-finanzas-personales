import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, pathToFileURL, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Versión de la app (de package.json) para el aviso de actualización.
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf-8'),
)

// Prerender de las páginas públicas (scripts/prerender.mjs): solo en la web. Sin la variable,
// el build es el de siempre (lo usan cap:sync y el CI del APK).
const prerenderOn = process.env.VERCEL === '1' || process.env.PRERENDER === '1'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt': no recarga sola; mostramos un aviso "Actualizar" al usuario.
      registerType: 'prompt',
      integration: {
        // Corre con dist/ ya escrito y antes de que workbox lea sus archivos, así el precache
        // coincide con lo publicado.
        beforeBuildServiceWorker: async (options) => {
          if (!prerenderOn) return
          const { prerender } = await import(/* @vite-ignore */ pathToFileURL(resolve('scripts/prerender.mjs')).href)
          await prerender({ root: process.cwd(), outDir: options.workbox.globDirectory, workbox: options.workbox })
        },
      },
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mi Control de Finanzas Personales',
        short_name: 'Mi Control Finanzas',
        description: 'Control y organización de tus finanzas personales',
        theme_color: '#1a3fae',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
