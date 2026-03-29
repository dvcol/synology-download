import * as module from './query.service';

describe('query.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports QueryService', () => {
    expect(module.QueryService).toBeTruthy();
  });
});
