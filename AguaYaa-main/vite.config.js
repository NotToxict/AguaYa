import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // 1. QUITAMOS "base: '/AguaYaa/'" para que funcione en la raíz de Vercel
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'AguaYa',
        short_name: 'AguaYaa',
        description: 'Tu app de entrega de agua tipo marketplace.',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        
        // 2. CORREGIMOS LAS RUTAS (Quitamos /AguaYaa/)
        start_url: '/', 
        scope: '/',
        
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png', // Sin /AguaYaa/ al principio
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