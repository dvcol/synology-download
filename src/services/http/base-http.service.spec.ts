import * as module from './base-http.service';

describe('base-http.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports BaseHttpService', () => {
    expect(module.BaseHttpService).toBeTruthy();
  });
});
