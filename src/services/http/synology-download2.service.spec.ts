import * as module from './synology-download2.service';

describe('synology-download2.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports SynologyDownload2Service', () => {
    expect(module.SynologyDownload2Service).toBeTruthy();
  });
});
