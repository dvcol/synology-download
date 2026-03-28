import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const environment = Object.freeze({
  dev: 'development' as const,
  prod: 'production' as const,
});

export const getDirName = () => dirname(fileURLToPath(import.meta.url));
export const isDev: boolean = process.env.NODE_ENV === environment.dev;
export const port: number = Number.parseInt(process.env.PORT ?? '', 10) || 3303;
export const contentPort: number = Number.parseInt(process.env.CONTENT_PORT ?? '', 10) || (port + 1);
export const resolveParent = (...args: string[]) => resolve(getDirName(), '..', ...args);

export const isExtension = process.env.VITE_TARGET === 'extension' || (!process.env.VITE_WEB && !process.env.VITE_TARGET);
export const isWeb = process.env.VITE_WEB === 'true' || process.env.VITE_TARGET === 'web';
export const sourcemap = process.env.VITE_SOURCEMAP === 'true';
export const outDir = isWeb ? 'dist' : 'build';
