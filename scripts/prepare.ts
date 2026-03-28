import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { watch } from 'chokidar';
import fg from 'fast-glob';
import fs from 'fs-extra';

import { writeManifest } from './manifest';
import { getDirName, isDev, outDir, port, resolveParent } from './utils';

/**
 * Merge i18n JSON files matching a glob pattern into a single output file.
 */
async function mergeJson({ pattern, output }: { pattern: string; output: string }) {
  const files = await fg(pattern, { cwd: resolveParent('.'), absolute: true });
  const merged: Record<string, unknown> = {};
  for (const file of files.sort()) {
    const content = await fs.readJson(file) as Record<string, unknown>;
    Object.assign(merged, content);
  }
  const outPath = resolveParent(output);
  await fs.ensureDir(resolve(outPath, '..'));
  await fs.writeJson(outPath, merged, { spaces: 2 });
  console.info(`Merged ${files.length} files to '${output}'`);
}

/**
 * Replace index.html with link to vite localhost for hot reload
 */
/**
 * Write a React Refresh preamble script for the vite dev server to serve.
 * Extension CSP blocks inline scripts, so it must be a separate file.
 */
function writePreambleStub() {
  const preamble = `if (typeof globalThis !== 'undefined' && typeof global === 'undefined') { globalThis.global = globalThis; }
import RefreshRuntime from 'http://localhost:${port}/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
`;
  fs.ensureDirSync(resolveParent(`${outDir}/scripts`));
  fs.writeFileSync(resolveParent(`${outDir}/scripts/preamble.js`), preamble, 'utf-8');
  console.info(`Stubbing preamble to '${getDirName()}/${outDir}/scripts/preamble.js'`);
}

async function copyIndexHtml(page: string) {
  fs.ensureDirSync(resolveParent(`${outDir}/pages/${page}`));
  const devServer = `http://localhost:${port}`;
  const data = fs.readFileSync(resolveParent(`src/pages/${page}/index.html`), 'utf-8')
    .replace(/<script type="module" src="\.\/index\.ts"><\/script>\s*/, '')
    .replace(
      /<\/body>/,
      `<script type="module" src="${devServer}/@vite/client"></script>
    <script type="module" src="../../scripts/preamble.js"></script>
    <script type="module" src="${devServer}/pages/${page}/index.ts"></script>
    </body>`,
    );
  fs.writeFileSync(resolveParent(`${outDir}/pages/${page}/index.html`), data, 'utf-8');
  console.info(`Stubbing '${page}' to '${getDirName()}/${outDir}/pages/${page}/index.html'`);
}

const copyViews = async (views = ['options', 'popup', 'panel']) => views.map(copyIndexHtml);

/**
 * Write a background service worker stub that imports from vite dev server for hot reload
 */
function writeBackgroundStub() {
  const stub = `import 'http://localhost:${port}/@vite/client';\nimport 'http://localhost:${port}/pages/background/index.ts';\n`;
  fs.ensureDirSync(resolveParent(`${outDir}/scripts`));
  fs.writeFileSync(resolveParent(`${outDir}/scripts/background.js`), stub, 'utf-8');
  console.info(`Stubbing background to '${getDirName()}/${outDir}/scripts/background.js'`);
}

async function copyAssets(_isDev: boolean) {
  const assetsSource = resolveParent('src/assets');
  const assetsDest = resolveParent(`${outDir}/assets`);
  if (_isDev) {
    if (!fs.existsSync(assetsDest)) {
      return fs.symlink(assetsSource, assetsDest, 'junction');
    }
  } else {
    return fs.copySync(assetsSource, assetsDest, { overwrite: true });
  }
}

async function mergeI18n() {
  const locales = readdirSync(resolveParent('src/i18n'));
  await Promise.all(
    locales.map(async lang =>
      mergeJson({
        pattern: `src/i18n/${lang}/**/*.json`,
        output: `${outDir}/_locales/${lang}/messages.json`,
      }).catch((e: Error) => console.error(`Failed to merge i18n for '${lang}'`, e)),
    ),
  );
}

async function prepare(hmr = isDev) {
  writeManifest().catch(e => console.error('Failed to write manifest.json', e));

  copyAssets(isDev).catch(e => console.error('Failed to copy assets', e));

  mergeI18n().catch(e => console.error('Failed to merge i18n', e));

  if (!hmr) return;
  console.info('Watching changes ...');

  writeBackgroundStub();
  writePreambleStub();
  copyViews().catch(e => console.error('Failed to copy html', e));
  watch(resolveParent('src/pages/*/index.html')).on('change', () => {
    copyViews().catch(e => console.error('Failed to copy html', e));
  });

  watch([resolveParent('scripts/manifest.ts'), resolveParent('package.json')]).on('change', () => {
    writeManifest().catch(e => console.error('Failed to write manifest.json', e));
  });

  watch([resolveParent('src/i18n/**/*.json')]).on('change', () => {
    mergeI18n().catch(e => console.error('Failed to merge i18n', e));
  });
}

prepare().catch(e => console.error(`Failed to prepare ${outDir} folder`, e));
