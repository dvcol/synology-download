import { defaultSettings } from '../../models/settings.model';
import { setSettings } from '../actions/settings.action';
import { store } from '../store';
import { getContentInterceptions } from './settings.selector';

const defaults = { magnet: true, thunder: true, flashget: true, qqdl: true, ed2k: true, torrent: false, nzb: false };

describe('content interception preferences', () => {
  it('restores supported defaults for settings saved before per-type interception existed', () => {
    expect.assertions(1);
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: true } }));
    expect(getContentInterceptions(store.getState())).toEqual(defaults);
  });

  it('merges a partial saved record without modifying it', () => {
    expect.assertions(2);
    const interceptions = { magnet: false, torrent: true };
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: true, interceptions } }));
    expect(getContentInterceptions(store.getState())).toEqual({ ...defaults, ...interceptions });
    expect(store.getState().settings.content.interceptions).toEqual(interceptions);
  });

  it('retains preferences while the master switch is disabled', () => {
    expect.assertions(1);
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: false, interceptions: { nzb: true } } }));
    expect(getContentInterceptions(store.getState())).toEqual({ ...defaults, nzb: true });
  });
});
