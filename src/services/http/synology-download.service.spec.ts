import * as module from './synology-download.service';

describe('synology-download.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports SynologyDownloadService', () => {
    expect(module.SynologyDownloadService).toBeTruthy();
  });
});
