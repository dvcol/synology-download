import * as module from './panel.service';

describe('panel.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports PanelService', () => {
    expect(module.PanelService).toBeTruthy();
  });
});
