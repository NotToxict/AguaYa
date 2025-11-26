import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // CRÍTICO: Importar el plugin PWA

// https://vitejs.dev/config/
export default defineConfig({
  // CRÍTICO 1: Base path para GitHub Pages
  base: '/AguaYaa/', 
  
  plugins: [
    react(),
    // CRÍTICO 2: Configuración del plugin PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'images/*'], // Asegúrate de incluir imágenes
      manifest: {
        name: 'AguaYaa',
        short_name: 'AguaYaa',
        description: 'Tu app de entrega de agua tipo marketplace.',
        theme_color: '#1976d2', // Color de tu tema
        background_color: '#ffffff',
        // CRÍTICO 3: Rutas del Manifest para GitHub Pages
        start_url: '/AguaYaa/', 
        scope: '/AguaYaa/',
        display: 'standalone',
        icons: [
          // Debes colocar tus íconos en la carpeta /public/
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      devOptions: {
        enabled: true
      }
    }),
  ],
})