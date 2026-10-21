/// <reference types="chrome" />
import type { Subscription } from 'rxjs';

import { setImmediate as flushPromises } from 'node:timers/promises';

import { defaultPolling, defaultSettings } from '../../../models/settings.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { setSettings, syncPolling } from '../../../store/actions/settings.action';
import { store } from '../../../store/store';
import { registerPollingAlarm, watchPollingAlarm } from './polling-alarm';

const alarmName = 'synology-download-polling-recovery';
const listeners = new Set<(alarm: chrome.alarms.Alarm) => void>();
const alarms = {
  get: vi.fn<(name: string) => Promise<chrome.alarms.Alarm | undefined>>(),
  create: vi.fn<(name: string, info: chrome.alarms.AlarmCreateInfo) => Promise<void>>(),
  clear: vi.fn<(name: string) => Promise<boolean>>(),
  onAlarm: {
    addListener: vi.fn((listener: (alarm: chrome.alarms.Alarm) => void) => {
      listeners.add(listener);
    }),
    hasListener: vi.fn((listener: (alarm: chrome.alarms.Alarm) => void) => listeners.has(listener)),
    removeListener: vi.fn((listener: (alarm: chrome.alarms.Alarm) => void) => {
      listeners.delete(listener);
    }),
  },
};
let subscription: Subscription | undefined;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
  listeners.clear();
  Object.defineProperty(chrome, 'alarms', { configurable: true, writable: true, value: alarms });
  alarms.get.mockReset().mockResolvedValue(undefined);
  alarms.create.mockReset().mockResolvedValue(undefined);
  alarms.clear.mockReset().mockResolvedValue(true);
  store.dispatch(setSettings({ ...defaultSettings, polling: defaultPolling }));
});
afterEach(() => {
  subscription?.unsubscribe();
  vi.restoreAllMocks();
});

describe('background polling recovery alarm', () => {
  it.each([
    { enabled: true, background: true, scheduled: true },
    { enabled: true, background: false, scheduled: false },
    { enabled: false, background: true, scheduled: false },
    { enabled: false, background: false, scheduled: false },
  ])('honors global/background settings: $enabled/$background', async ({ enabled, background, scheduled }) => {
    expect.assertions(2);
    store.dispatch(syncPolling({ ...defaultPolling, enabled, background: { ...defaultPolling.background, enabled: background } }));
    subscription = watchPollingAlarm(store);
    await flushPromises();
    expect(alarms.get).toHaveBeenCalledExactlyOnceWith(alarmName);
    expect(alarms.create.mock.calls).toEqual(scheduled ? [[alarmName, { periodInMinutes: 1 }]] : []);
  });

  it('reconciles every global/background enablement transition', async () => {
    expect.assertions(3);
    let currentAlarm: chrome.alarms.Alarm | undefined;
    alarms.get.mockImplementation(async () => currentAlarm);
    alarms.create.mockImplementation(async () => {
      currentAlarm = { name: alarmName, periodInMinutes: 1, scheduledTime: 1000 };
    });
    alarms.clear.mockImplementation(async () => {
      currentAlarm = undefined;
      return true;
    });
    subscription = watchPollingAlarm(store);
    await flushPromises();
    for (const [enabled, background] of [[false, true], [false, false], [true, false], [true, true], [true, false], [false, false], [false, true], [true, true]]) {
      store.dispatch(syncPolling({ ...defaultPolling, enabled, background: { ...defaultPolling.background, enabled: background } }));
      await flushPromises();
    }
    expect(alarms.create).toHaveBeenCalledTimes(3);
    expect(alarms.clear).toHaveBeenCalledTimes(2);
    expect(alarms.get).toHaveBeenCalledTimes(5);
  });

  it('preserves a valid existing schedule on startup', async () => {
    expect.assertions(2);
    alarms.get.mockResolvedValue({ name: alarmName, periodInMinutes: 1, scheduledTime: 1000 });
    subscription = watchPollingAlarm(store);
    await flushPromises();
    expect(alarms.create).not.toHaveBeenCalled();
    expect(alarms.clear).not.toHaveBeenCalled();
  });

  it('replaces an alarm with an incorrect period', async () => {
    expect.assertions(1);
    alarms.get.mockResolvedValue({ name: alarmName, periodInMinutes: 0.5, scheduledTime: 1000 });
    subscription = watchPollingAlarm(store);
    await flushPromises();
    expect(alarms.create).toHaveBeenCalledExactlyOnceWith(alarmName, { periodInMinutes: 1 });
  });

  it('clears an existing alarm when background polling is disabled', async () => {
    expect.assertions(2);
    alarms.get.mockResolvedValue({ name: alarmName, periodInMinutes: 1, scheduledTime: 1000 });
    subscription = watchPollingAlarm(store);
    await flushPromises();
    store.dispatch(syncPolling({ ...defaultPolling, background: { enabled: false, interval: 20000 } }));
    await flushPromises();
    expect(alarms.clear).toHaveBeenCalledExactlyOnceWith(alarmName);
    expect(alarms.create).not.toHaveBeenCalled();
  });

  it('does not reschedule for foreground or interval-only changes', async () => {
    expect.assertions(2);
    subscription = watchPollingAlarm(store);
    await flushPromises();
    store.dispatch(syncPolling({ ...defaultPolling, popup: { enabled: false, interval: 1000 }, background: { enabled: true, interval: 60000 } }));
    await flushPromises();
    expect(alarms.get).toHaveBeenCalledOnce();
    expect(alarms.create).toHaveBeenCalledOnce();
  });

  it('serializes enable/disable changes while an API request is pending', async () => {
    expect.assertions(2);
    let resolveAlarm: (alarm: chrome.alarms.Alarm | undefined) => void = () => {};
    alarms.get.mockReturnValueOnce(new Promise((resolve) => {
      resolveAlarm = resolve;
    }));
    subscription = watchPollingAlarm(store);
    store.dispatch(syncPolling({ ...defaultPolling, enabled: false }));
    alarms.get.mockResolvedValue({ name: alarmName, periodInMinutes: 1, scheduledTime: 1000 });
    resolveAlarm(undefined);
    await flushPromises();
    expect(alarms.create).toHaveBeenCalledOnce();
    expect(alarms.clear).toHaveBeenCalledOnce();
  });

  it('cancels pending reconciliation when reinitialized and unsubscribed', async () => {
    expect.assertions(2);
    let resolveAlarm: (alarm: chrome.alarms.Alarm | undefined) => void = () => {};
    alarms.get.mockReturnValueOnce(new Promise((resolve) => {
      resolveAlarm = resolve;
    }));
    subscription = watchPollingAlarm(store);
    subscription = watchPollingAlarm(store);
    await flushPromises();
    resolveAlarm(undefined);
    await flushPromises();
    expect(alarms.create).toHaveBeenCalledOnce();
    subscription.unsubscribe();
    store.dispatch(syncPolling({ ...defaultPolling, enabled: false }));
    await flushPromises();
    expect(alarms.get).toHaveBeenCalledTimes(2);
  });

  it.each(['get', 'create', 'clear'] as const)('contains %s API failures and remains responsive to settings', async (method) => {
    expect.assertions(2);
    const error = new Error('Alarm API unavailable');
    const logError = vi.spyOn(LoggerService, 'error').mockImplementation(() => {});
    if (method === 'clear') {
      alarms.get.mockResolvedValue({ name: alarmName, periodInMinutes: 1, scheduledTime: 1000 });
      store.dispatch(syncPolling({ ...defaultPolling, enabled: false }));
    }
    alarms[method].mockRejectedValueOnce(error);
    subscription = watchPollingAlarm(store);
    await flushPromises();
    expect(logError).toHaveBeenCalledExactlyOnceWith('Failed to reconcile background polling recovery alarm.', error);
    store.dispatch(syncPolling({ ...defaultPolling, enabled: method === 'clear' }));
    await flushPromises();
    expect(alarms.get).toHaveBeenCalledTimes(2);
  });

  it('registers synchronously once and ignores unrelated alarms', () => {
    expect.assertions(4);
    const debug = vi.spyOn(LoggerService, 'debug').mockImplementation(() => {});
    registerPollingAlarm();
    registerPollingAlarm();
    expect(listeners.size).toBe(1);
    expect(alarms.onAlarm.addListener).toHaveBeenCalledOnce();
    for (const listener of listeners) listener({ name: 'unrelated', scheduledTime: 0 });
    expect(debug).not.toHaveBeenCalled();
    for (const listener of listeners) listener({ name: alarmName, scheduledTime: 0 });
    expect(debug).toHaveBeenCalledExactlyOnceWith('Background polling recovery alarm fired.');
  });

  it('works with a web Chrome mock that has no alarms API', async () => {
    expect.assertions(3);
    Reflect.deleteProperty(chrome, 'alarms');
    expect(registerPollingAlarm).not.toThrow();
    subscription = watchPollingAlarm(store);
    await flushPromises();
    expect(subscription.closed).toBe(true);
    expect(alarms.get).not.toHaveBeenCalled();
  });
});
