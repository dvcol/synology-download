describe('file.utils', () => {
  describe('readJsonFile', () => {
    let readJsonFile: typeof import('./file.utils').readJsonFile;

    beforeAll(async () => {
      ({ readJsonFile } = await import('./file.utils'));
    });

    it('should parse valid JSON from a file', async () => {
      const content = JSON.stringify({ key: 'value', count: 42 });
      const file = new File([content], 'test.json', { type: 'application/json' });

      const result = await readJsonFile(file);
      expect(result).toEqual({ key: 'value', count: 42 });
    });

    it('should reject on invalid JSON', async () => {
      const file = new File(['not-json{'], 'bad.json', { type: 'application/json' });

      await expect(readJsonFile(file)).rejects.toThrow();
    });

    it('should reject on FileReader error', async () => {
      const file = new File(['content'], 'test.json');

      const originalFileReader = globalThis.FileReader;

      let errorHandler: () => void;
      class MockFileReader {
        addEventListener(event: string, handler: () => void) {
          if (event === 'error') errorHandler = handler;
        }

        readAsText() {
          // Trigger error asynchronously
          queueMicrotask(() => errorHandler());
        }
      }

      globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

      try {
        await expect(readJsonFile(file)).rejects.toThrow('Failed to read file');
      } finally {
        globalThis.FileReader = originalFileReader;
      }
    });
  });
});
