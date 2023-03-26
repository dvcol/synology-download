import { buildFormData as _buildFormData, stringifyKeys as _stringifyKeys, stringifyParams as _stringifyParams } from '@dvcol/web-extension-utils';

import { LoggerService } from '@src/services';

export const buildFormData = _buildFormData;

export const stringifyKeys = _stringifyKeys;

export const stringifyParams = _stringifyParams;

/**
 * Parse magnet link to extract name parameter
 * @param uri a valid uri
 * @param fallback default name when none is inferred
 */
export const parseMagnetLink = (uri: string, fallback?: string): string => {
  // TODO Handle more than just magnet URL
  if (!uri?.includes('dn=')) return fallback ?? uri;
  try {
    const url = new URL(uri);
    const dn = url.searchParams.get('dn');
    return dn ?? fallback ?? uri;
  } catch (e) {
    LoggerService.warn('Failed to parse', uri);
    return fallback ?? uri;
  }
};

/**
 * Try to parse src to deduce a valid title
 * @param src a source to parse
 * @param fallback default name when none is inferred
 */
export const parseSrc = (src: string, fallback?: string): string => {
  if (!src) return fallback ?? src;
  if (src.includes('dn=')) return parseMagnetLink(src, fallback);
  try {
    const pathname = new URL(src).pathname?.split('/').pop()?.trim();
    if (pathname && /\.(\w+)$/.test(pathname)) return decodeURIComponent(pathname) ?? fallback ?? src;
  } catch (e) {
    LoggerService.warn('Failed to parse', src);
  }
  return fallback ?? src;
};
