import { vi } from 'vitest';

import { eMuleRegex, parseMagnetLink, parseSrc, sanitizeUrl } from './string.utils';

vi.mock('../services/logger/logger.service', () => ({
  LoggerService: { warn: vi.fn(), debug: vi.fn(), error: vi.fn() },
}));

describe('string.utils', () => {
  describe('sanitizeUrl', () => {
    it('should return a valid URL with commas encoded', () => {
      expect(sanitizeUrl('http://example.com/a,b,c')).toBe('http://example.com/a%2Cb%2Cc');
    });

    it('should decode eMule links without modification', () => {
      const emule = 'ed2k://|file|test.txt|1234|abcdef01234567890abcdef012345678|/';
      expect(eMuleRegex.test(emule)).toBe(true);
      expect(sanitizeUrl(emule)).toBe(decodeURIComponent(emule));
    });

    it('should handle normal URLs without commas', () => {
      expect(sanitizeUrl('https://example.com/file.zip')).toBe('https://example.com/file.zip');
    });
  });

  describe('parseMagnetLink', () => {
    it('should extract dn parameter from magnet link', () => {
      expect(parseMagnetLink('magnet:?xt=urn:btih:abc&dn=My+File')).toBe('My File');
    });

    it('should return fallback when no dn parameter', () => {
      expect(parseMagnetLink('magnet:?xt=urn:btih:abc', 'fallback')).toBe('fallback');
    });

    it('should return uri when not a magnet link', () => {
      expect(parseMagnetLink('http://example.com')).toBe('http://example.com');
    });

    it('should return fallback for non-magnet link when provided', () => {
      expect(parseMagnetLink('http://example.com', 'fallback')).toBe('fallback');
    });

    it('should return dn value even with unusual params', () => {
      expect(parseMagnetLink('magnet:?dn=test&invalid://[', 'fallback')).toBe('test');
    });
  });

  describe('parseSrc', () => {
    it('should extract filename from URL with file extension', () => {
      expect(parseSrc('http://example.com/path/file.zip')).toBe('file.zip');
    });

    it('should parse magnet link with dn', () => {
      expect(parseSrc('magnet:?xt=urn:btih:abc&dn=My+Torrent')).toBe('My Torrent');
    });

    it('should return fallback for empty src', () => {
      expect(parseSrc('', 'fallback')).toBe('fallback');
    });

    it('should return undefined for empty src without fallback', () => {
      expect(parseSrc('')).toBeUndefined();
    });

    it('should return pathname without extension', () => {
      expect(parseSrc('http://example.com/path/somefile')).toBe('somefile');
    });
  });
});
