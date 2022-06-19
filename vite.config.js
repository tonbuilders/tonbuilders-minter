import reactRefresh from '@vitejs/plugin-react-refresh'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

/**
 * https://vitejs.dev/config/
 * @type { import('vite').UserConfig }
 */
export default {
  base: '/tonbuilders-minter/',
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },
  plugins: [reactRefresh()],
  server: {
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      //port: 443,
    }
  }
}
