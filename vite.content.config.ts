import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import pkg from './package.json';
import { isDev, outDir, resolveParent, sourcemap } from './scripts/utils';

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
    react({ jsxRuntime: 'classic', fastRefresh: false }),
  ],
  base: './',
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    outDir: resolveParent(outDir),
    emptyOutDir: false,
    sourcemap: (isDev || sourcemap) ? 'inline' : false,
    minify: false,
    rollupOptions: {
      input: { contentScript: resolveParent('src/pages/content/index.ts') },
      output: {
        format: 'iife',
        entryFileNames: 'scripts/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
}));
