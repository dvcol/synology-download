describe('anchor.handler', () => {
  describe('isDownloadOnlyFile', () => {
    let isDownloadOnlyFile: typeof import('./anchor.handler').isDownloadOnlyFile;

    beforeAll(async () => {
      ({ isDownloadOnlyFile } = await import('./anchor.handler'));
    });

    it('should match http(s) links to supported extensions', () => {
      expect(isDownloadOnlyFile('https://example.com/ubuntu.torrent')).toBeTruthy();
      expect(isDownloadOnlyFile('http://example.com/path/to/release.nzb')).toBeTruthy();
    });

    it('should ignore case in the extension', () => {
      expect(isDownloadOnlyFile('https://example.com/UBUNTU.TORRENT')).toBeTruthy();
    });

    it('should ignore query strings and fragments', () => {
      expect(isDownloadOnlyFile('https://example.com/file.torrent?token=abc&id=1')).toBeTruthy();
      expect(isDownloadOnlyFile('https://example.com/file.torrent#anchor')).toBeTruthy();
    });

    it('should not match unsupported extensions', () => {
      expect(isDownloadOnlyFile('https://example.com/file.zip')).toBeFalsy();
      expect(isDownloadOnlyFile('https://example.com/torrent')).toBeFalsy();
      expect(isDownloadOnlyFile('https://example.com/')).toBeFalsy();
    });

    it('should not match a torrent extension outside the path', () => {
      expect(isDownloadOnlyFile('https://example.com/download?file=x.torrent')).toBeFalsy();
    });

    it('should not match non http(s) protocols', () => {
      expect(isDownloadOnlyFile('ftp://example.com/file.torrent')).toBeFalsy();
      expect(isDownloadOnlyFile('file:///home/user/file.torrent')).toBeFalsy();
    });

    it('should not throw on malformed urls', () => {
      expect(isDownloadOnlyFile('not a url')).toBeFalsy();
      expect(isDownloadOnlyFile('')).toBeFalsy();
    });
  });
});
