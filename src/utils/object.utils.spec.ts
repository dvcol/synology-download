import { deepMerge } from './object.utils';

describe('object.utils', () => {
  describe('deepMerge', () => {
    it('should merge flat objects', () => {
      const source = { a: 1, b: 2 };
      const target = { b: 3, c: 4 };
      expect(deepMerge(source, target)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should deeply merge nested objects', () => {
      const source = { a: { x: 1, y: 2 }, b: 3 };
      const target = { a: { y: 5, z: 6 } };
      expect(deepMerge(source, target as any)).toEqual({ a: { x: 1, y: 5, z: 6 }, b: 3 });
    });

    it('should not mutate source', () => {
      const source = { a: 1 };
      const target = { a: 2 };
      const result = deepMerge(source, target);
      expect(result).toEqual({ a: 2 });
      expect(source.a).toBe(1);
    });

    it('should override non-object with non-object', () => {
      const source = { a: 'hello' };
      const target = { a: 'world' };
      expect(deepMerge(source, target)).toEqual({ a: 'world' });
    });

    it('should handle empty source', () => {
      expect(deepMerge({} as any, { a: 1 } as any)).toEqual({ a: 1 });
    });

    it('should handle empty target', () => {
      expect(deepMerge({ a: 1 } as any, {} as any)).toEqual({ a: 1 });
    });
  });
});
