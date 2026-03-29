import * as module from './synology-file.service';

describe('synology-file.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports SynologyFileService', () => {
    expect(module.SynologyFileService).toBeTruthy();
  });
});
