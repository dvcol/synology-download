import * as module from './synology-auth.service';

describe('synology-auth.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports SynologyAuthService', () => {
    expect(module.SynologyAuthService).toBeTruthy();
  });
});
