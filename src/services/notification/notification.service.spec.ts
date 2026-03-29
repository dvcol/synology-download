import * as module from './notification.service';

describe('notification.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports NotificationService', () => {
    expect(module.NotificationService).toBeTruthy();
  });
});
