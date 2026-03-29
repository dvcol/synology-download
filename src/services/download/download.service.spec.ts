import * as module from './download.service';

describe('download.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports DownloadService', () => {
    expect(module.DownloadService).toBeTruthy();
  });
});
