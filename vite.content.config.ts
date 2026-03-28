import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import pkg from './package.json';
import { contentPort, isDev, outDir, resolveParent, sourcemap } from './scripts/utils';

export default defineConfig(() => ({
  root: resolveParent('src'),
  define: {
    '__DEV__': isDev,
    'import.meta.env.PKG_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.PKG_NAME': JSON.stringify(pkg.name),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.DEBUG': JSON.stringify(process.env.DEBUG || 'false'),
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
  ],
  base: './',
  css: {
    modules: {
      localsConvention: 'camelCaseOnly' as const,
    },
  },
  server: {
    port: contentPort,
    host: true,
    cors: true,
    hmr: {
      host: 'localhost',
    },
  },
  build: {
    outDir: resolveParent(outDir),
    emptyOutDir: false,
    sourcemap: (isDev || sourcemap) ? 'inline' as const : false,
    minify: false,
    rollupOptions: {
      input: { contentScript: resolveParent('src/pages/content/index.ts') },
      output: {
        format: 'iife' as const,
        entryFileNames: 'scripts/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  cacheDir: resolveParent('node_modules/.vite-content'),
  optimizeDeps: {
    exclude: ['path', 'fast-glob'],
  },
}));
