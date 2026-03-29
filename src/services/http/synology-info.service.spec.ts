import * as module from './synology-info.service';

describe('synology-info.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports SynologyInfoService', () => {
    expect(module.SynologyInfoService).toBeTruthy();
  });
});
