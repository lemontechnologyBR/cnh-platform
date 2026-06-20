import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['cnh-logo.png', 'cnhdobrasil.png', 'favicon.svg'],
      manifest: {
        name: 'CNH Digital',
        short_name: 'CNH Digital',
        description: 'Carteira Digital de Trânsito — CNH do Brasil',
        theme_color: '#1351B4',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: 'cnhdobrasil.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'cnhdobrasil.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'cnhdobrasil.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,mjs}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    watch: {
      ignored: ['**/public/fonts/**'],
    },
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
