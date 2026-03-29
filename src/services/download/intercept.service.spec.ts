import * as module from './intercept.service';

describe('intercept.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports InterceptService', () => {
    expect(module.InterceptService).toBeTruthy();
  });
});
