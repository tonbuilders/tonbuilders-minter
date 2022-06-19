import reactRefresh from '@vitejs/plugin-react-refresh'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import nodePolyfills from 'rollup-plugin-polyfill-node'
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
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // used during production bundling
        nodePolyfills()
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
