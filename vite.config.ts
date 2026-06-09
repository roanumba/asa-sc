import { defineConfig, loadEnv, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Plugin to replace %PUBLIC_URL% in HTML with the base URL
const replacePublicUrl = (base: string): Plugin => ({
  name: 'replace-public-url',
  transformIndexHtml(html) {
    return html.replace(/%PUBLIC_URL%/g, base.replace(/\/$/, ''))
  },
})

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), '');
  // For built assets, use relative base './' to make it deployable in any folder.
  // For Vite dev server, use '/' for server routing compatibility.
  const base = command === 'serve' ? '/' : './';

  return {
    plugins: [
      react(),
      replacePublicUrl(base),
    ],
    base: base,
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })),
    },
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
      },
      // Proxy API requests dynamically based on base URL
      proxy: {
        [`^${base.replace(/\/$/, '')}/server/.*`]: {
          target: 'http://localhost:8888',
          changeOrigin: true,
        }
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
  }
})
