import * as module from './polling.service';

describe('polling.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports PollingService', () => {
    expect(module.PollingService).toBeTruthy();
  });
});
