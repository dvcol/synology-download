import { buildFormData as _buildFormData, stringifyKeys as _stringifyKeys, stringifyParams as _stringifyParams } from '@dvcol/web-extension-utils';

import { LoggerService } from '@src/services';

export const buildFormData = _buildFormData;

export const stringifyKeys = _stringifyKeys;

export const stringifyParams = _stringifyParams;

export const eMuleRegex = /^ed2k:\/\/\|file\|[^|]+\|\d+\|[a-fA-F0-9]{32}\|(h=[a-zA-Z0-9]{32}\|)?\/$/;

const commaRegex = /,/g;
const commaReplacement = '%2C';

const pipeRegex = /\|/g;
const pipeReplacement = '%7C';

export const sanitizeUrl = (url: string): string =>
  new URL(url.toString().replace(commaRegex, commaReplacement).replace(pipeRegex, pipeReplacement)).toString();

/**
 * Parse magnet link to extract name parameter
 * @param uri a valid uri
 * @param fallback default name when none is inferred
 */
export const parseMagnetLink = (uri: string, fallback?: string): string => {
  // TODO Handle more than just magnet URL
  if (!uri?.startsWith('magnet:?')) return fallback ?? uri;
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
export const parseSrc = (src: string, fallback?: string): string | undefined => {
  if (!src) return fallback;
  if (src.includes('dn=')) return parseMagnetLink(src, fallback);
  try {
    const pathname = new URL(src).pathname?.split('/').pop()?.trim();
    if (pathname && /\.(\w+)$/.test(pathname)) return decodeURIComponent(pathname) ?? fallback;
    if (pathname) return pathname;
  } catch (e) {
    LoggerService.warn('Failed to parse', src);
  }
  return fallback;
};
