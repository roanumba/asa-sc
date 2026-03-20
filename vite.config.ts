import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Plugin to replace %PUBLIC_URL% in HTML with the base URL
const replacePublicUrl = (): Plugin => ({
  name: 'replace-public-url',
  transformIndexHtml(html, ctx) {
    const base = ctx.server?.config.base || '/asa-aswa/';
    return html.replace(/%PUBLIC_URL%/g, base.replace(/\/$/, ''))
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    replacePublicUrl(),
  ],
  base: '/asa-aswa/',
  server: {
    port: 3000,
    open: true,
    // HMR configuration for optimal performance
    hmr: {
      overlay: true,
    },
    // Watch options for better HMR reliability
    watch: {
      usePolling: false,
    }
  },
  build: {
    outDir: 'build',
    sourcemap: mode === 'development',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'bootstrap-vendor': ['bootstrap', 'react-bootstrap'],
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  // Optimize dependency pre-bundling for faster HMR
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-bootstrap', 'bootstrap']
  }
}))
