import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { glob } from 'glob';
import fs from 'fs-extra';

// Plugin to merge i18n JSON files
function mergeI18nPlugin() {
  return {
    name: 'merge-i18n',
    generateBundle() {
      // Merge i18n files during build
      const i18nDir = resolve(__dirname, 'src/i18n');
      const locales = fs.readdirSync(i18nDir);
      
      locales.forEach(locale => {
        const localeDir = resolve(i18nDir, locale);
        if (fs.statSync(localeDir).isDirectory()) {
          const pattern = resolve(localeDir, '**/*.json');
          const files = glob.sync(pattern);
          
          const merged = {};
          files.forEach(file => {
            const content = fs.readJsonSync(file);
            Object.assign(merged, content);
          });
          
          const outputDir = resolve(__dirname, 'dist/_locales', locale);
          if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
          }
          
          fs.writeJsonSync(resolve(outputDir, 'messages.json'), merged, { spaces: 2 });
        }
      });
    }
  };
}

// Plugin to copy additional files
function copyAssetsPlugin() {
  return {
    name: 'copy-assets',
    generateBundle() {
      // Copy screenshots
      const screenshotsDir = resolve(__dirname, 'screenshots');
      const distScreenshotsDir = resolve(__dirname, 'dist/screenshots');
      if (fs.existsSync(screenshotsDir)) {
        fs.copySync(screenshotsDir, distScreenshotsDir);
      }
      
      // Copy JSON files
      const jsonDir = resolve(__dirname, 'src/pages/web/json');
      const distJsonDir = resolve(__dirname, 'dist/json');
      if (fs.existsSync(jsonDir)) {
        fs.copySync(jsonDir, distJsonDir);
      }
      
      // Copy manifest.json
      const manifestFile = resolve(__dirname, 'src/manifest.json');
      const distManifestFile = resolve(__dirname, 'dist/json/manifest.json');
      if (fs.existsSync(manifestFile)) {
        fs.copySync(manifestFile, distManifestFile);
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    mergeI18nPlugin(),
    copyAssetsPlugin(),
  ],
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.DEBUG': JSON.stringify(process.env.DEBUG || 'false'),
    'process.env.DEVTOOL': JSON.stringify(process.env.DEVTOOL || 'false'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'entry/[name].js',
        chunkFileNames: 'chunks/[name].chunk.js',
      },
    },
  },
  publicDir: 'public',
  server: {
    port: 3000,
    open: true,
  },
});