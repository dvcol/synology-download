import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs-extra';
import { glob } from 'glob';

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
          
          const outputDir = resolve(__dirname, 'build/_locales', locale);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
          
          fs.writeJsonSync(resolve(outputDir, 'messages.json'), merged, { spaces: 2 });
        }
      });
    }
  };
}

// Plugin to handle manifest and assets
function extensionAssetsPlugin() {
  return {
    name: 'extension-assets',
    generateBundle() {
      // Copy and transform manifest.json
      const manifestPath = resolve(__dirname, 'src/manifest.json');
      const packageJsonPath = resolve(__dirname, 'package.json');
      
      if (fs.existsSync(manifestPath) && fs.existsSync(packageJsonPath)) {
        const manifest = fs.readJsonSync(manifestPath);
        const packageJson = fs.readJsonSync(packageJsonPath);
        
        const transformedManifest = {
          description: packageJson.description,
          version: packageJson.version,
          ...manifest
        };
        
        const buildManifestPath = resolve(__dirname, 'build/manifest.json');
        fs.writeJsonSync(buildManifestPath, transformedManifest, { spaces: 2 });
      }
      
      // Copy assets
      const assetsDir = resolve(__dirname, 'src/assets');
      const buildAssetsDir = resolve(__dirname, 'build/assets');
      if (fs.existsSync(assetsDir)) {
        fs.copySync(assetsDir, buildAssetsDir);
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    mergeI18nPlugin(),
    extensionAssetsPlugin(),
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
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/pages/popup/index.html'),
        panel: resolve(__dirname, 'src/pages/panel/index.html'),
        options: resolve(__dirname, 'src/pages/options/index.html'),
        background: resolve(__dirname, 'src/pages/background/index.ts'),
        contentScript: resolve(__dirname, 'src/pages/content/index.ts'),
      },
      output: {
        entryFileNames: 'entry/[name].entry.js',
        chunkFileNames: 'chunks/[name].chunk.js',
      },
    },
  },
});