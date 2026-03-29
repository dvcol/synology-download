import * as module from './synology.service';

describe('synology.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports SynologyService', () => {
    expect(module.SynologyService).toBeTruthy();
  });
});
