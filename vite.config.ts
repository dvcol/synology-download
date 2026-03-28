import type { PluginOption } from 'vite';

import { readdir, readFile } from 'node:fs/promises';
import { dirname, relative } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';

import pkg from './package.json';
import { isDev, isWeb, outDir, port, resolveParent, sourcemap } from './scripts/utils';

function getInput(hmr: boolean, _isWeb: boolean): Record<string, string> {
  if (hmr) return { background: resolveParent('src/pages/background/index.ts') };

  if (_isWeb) {
    return {
      web: resolveParent('src/pages/web/index.html'),
      main: resolveParent('src/pages/web/main.ts'),
      index: resolveParent('src/pages/web/index.ts'),
    };
  }
  return {
    background: resolveParent('src/pages/background/index.ts'),
    options: resolveParent('src/pages/options/index.html'),
    popup: resolveParent('src/pages/popup/index.html'),
    panel: resolveParent('src/pages/panel/index.html'),
  };
}

const i18nRegex = /.*src\/i18n\/([a-zA-Z]+)\/.*\.json/;
const slashRegex = /\\/g;
const htmlRegex = /"\/assets\//g;
const preambleScriptRegex = /\s*<!--\s*\[vite:react-refresh-preamble\][\s\S]*?<\/script>/g;

type JsonLocale = Record<string, string>;
function getPlugins(_isDev: boolean, _isWeb: boolean): PluginOption[] {
  const plugins: PluginOption[] = [
    react({
      jsxRuntime: 'classic',
    }),
    checker({
      typescript: {
        tsconfigPath: 'tsconfig.app.json',
      },
      enableBuild: false,
    }),
    {
      name: 'i18n-hmr',
      configureServer: (server) => {
        console.info('server start');
        server.ws.on('fetch:i18n', async () => {
          const dir = await readdir(`${outDir}/_locales`);
          const locales = dir.map(async _lang =>
            readFile(`${outDir}/_locales/${_lang}/messages.json`, { encoding: 'utf-8' }).then(locale => ({ lang: _lang, locale: JSON.parse(locale) as JsonLocale })),
          );
          server.ws.send({
            type: 'custom',
            event: 'update:i18n',
            data: await Promise.all(locales),
          });
        });
      },
      handleHotUpdate: async ({ server, file, read, modules }) => {
        const lang = file.match(i18nRegex)?.[1];
        if (typeof lang !== 'string') return modules;
        console.info('Emit new i18n', file);
        const locale = JSON.parse(await read()) as JsonLocale;
        server.ws.send({
          type: 'custom',
          event: 'update:i18n',
          data: [{ lang, locale }],
        });
        return modules;
      },
    },
    // rewrite assets to use relative path
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml: (html, { path }) =>
        html
          .replace(preambleScriptRegex, '')
          .replace(htmlRegex, `"${relative(dirname(path), '/assets').replace(slashRegex, '/')}/`),
    },
    // flatten HTML files from src/pages/*/index.html to build root (popup.html, panel.html, etc.)
    {
      name: 'html-flatten',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler: html => html,
      },
      generateBundle(_, bundle) {
        for (const [key, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'asset' && key.startsWith('pages/') && key.endsWith('.html')) {
            if (_isWeb) {
              // pages/web/index.html -> index.html
              chunk.fileName = 'index.html';
            } else {
              // pages/popup/index.html -> popup.html
              const pageName = key.split('/')[1];
              chunk.fileName = `${pageName}.html`;
            }
          }
        }
      },
    },
  ];

  return plugins;
}

export default defineConfig(() => ({
  root: resolveParent('src'),
  define: {
    '__DEV__': isDev,
    'import.meta.env.PKG_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.PKG_NAME': JSON.stringify(pkg.name),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.DEBUG': JSON.stringify(process.env.DEBUG || 'false'),
  },
  plugins: getPlugins(isDev, isWeb),
  base: process.env.VITE_BASE || './',
  server: {
    port,
    open: isWeb,
    host: true,
    hmr: {
      host: 'localhost',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    outDir: resolveParent(outDir),
    emptyOutDir: false,
    sourcemap: (isDev || sourcemap) ? 'inline' : false,
    minify: !isDev && isWeb,
    rollupOptions: {
      input: getInput(isDev, isWeb),
      output: {
        minifyInternalExports: false,
        chunkFileNames: 'chunks/[name]-[hash].chunk.js',
        entryFileNames: (entry) => {
          if (entry.name === 'background') return 'scripts/[name].js';
          if (entry.name === 'index') return 'entry/index.js';
          if (entry.name === 'main') return 'entry/main.js';
          return 'scripts/[name]-[hash].js';
        },
        assetFileNames: (asset) => {
          const format = '[name][extname]';
          if (asset.names?.[0]?.endsWith('.css')) return `styles/${format}`;
          return 'assets/[name][extname]';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reportsDirectory: resolveParent('coverage'),
    },
    setupFiles: [resolveParent('vitest.setup.ts')],
  },
  optimizeDeps: {
    exclude: ['path', 'fast-glob'],
  },
}));
