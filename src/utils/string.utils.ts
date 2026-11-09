import { buildFormData as _buildFormData, stringifyKeys as _stringifyKeys, stringifyParams as _stringifyParams } from '@dvcol/web-extension-utils';

import { LoggerService } from '../services/logger/logger.service';

export const buildFormData = _buildFormData;

export const stringifyKeys = _stringifyKeys;

export const stringifyParams = _stringifyParams;

export const eMuleRegex = /^ed2k:\/\/\|file\|[^|]+\|\d+\|[a-fA-F0-9]{32}\|(h=[a-zA-Z0-9]{32}\|)?\/$/;
const fileExtensionRegex = /\.\w+$/;

/**
 * Global matchers used to extract downloadable links out of a free-form text selection.
 *
 * Order matters: scheme-specific links (ed2k, magnet, thunder/flashget/qqdl) are matched
 * before the generic http(s) matcher so they are never partially swallowed.
 */
const downloadLinkRegexes: RegExp[] = [
  /ed2k:\/\/\|file\|[^|]+\|\d+\|[a-f0-9]{32}\|(?:h=[a-z0-9]{32}\|)?\//gi,
  /magnet:\?[^\s"'<>\]]+/gi,
  /(?:thunder|flashget|qqdl):\/\/[^\s"'<>\]]+/gi,
  /https?:\/\/[^\s"'<>\]]+/gi,
];

/**
 * Extract every supported downloadable link (ed2k, magnet, thunder/flashget/qqdl, http(s))
 * from an arbitrary text blob such as a right-click text selection.
 *
 * Returns a de-duplicated list preserving first-seen order. When no link is found the
 * returned array is empty, leaving callers free to fall back to the raw text.
 *
 * @param text the free-form text to scan
 */
export function extractDownloadUrls(text?: string): string[] {
  if (!text?.trim()) return [];
  const found = new Set<string>();
  downloadLinkRegexes.forEach((regex) => {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      const link = match[0]?.trim();
      if (link) found.add(link);
    }
  });
  return [...found];
}

const commaRegex = /,/g;
const commaReplacement = '%2C';

export function sanitizeUrl(url: string): string {
  if (eMuleRegex.test(url)) return decodeURIComponent(url);
  return new URL(url.toString().replace(commaRegex, commaReplacement)).toString();
}

/**
 * Parse magnet link to extract name parameter
 * @param uri a valid uri
 * @param fallback default name when none is inferred
 */
export function parseMagnetLink(uri: string, fallback?: string): string {
  // TODO Handle more than just magnet URL
  if (!uri?.startsWith('magnet:?')) return fallback ?? uri;
  if (!uri?.includes('dn=')) return fallback ?? uri;
  try {
    const url = new URL(uri);
    const dn = url.searchParams.get('dn');
    return dn ?? fallback ?? uri;
  } catch (error: unknown) {
    LoggerService.warn('Failed to parse', { uri, error });
    return fallback ?? uri;
  }
}

/**
 * Try to parse src to deduce a valid title
 * @param src a source to parse
 * @param fallback default name when none is inferred
 */
export function parseSrc(src: string, fallback?: string): string | undefined {
  if (!src) return fallback;
  if (src.includes('dn=')) return parseMagnetLink(src, fallback);
  try {
    const pathname = new URL(src).pathname?.split('/').pop()?.trim();
    if (pathname && fileExtensionRegex.test(pathname)) return decodeURIComponent(pathname) ?? fallback;
    if (pathname) return pathname;
  } catch (error: unknown) {
    LoggerService.warn('Failed to parse', { src, error });
  }
  return fallback;
}
