import * as module from './logger.service';

describe('logger.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports LoggerService', () => {
    expect(module.LoggerService).toBeTruthy();
  });
});
