import * as module from './base-logger.service';

describe('base-logger.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports BaseLoggerService', () => {
    expect(module.BaseLoggerService).toBeTruthy();
  });
});
