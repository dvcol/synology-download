/// <reference types="chrome" />
import { setImmediate as flushPromises } from 'node:timers/promises';

import { manifest as generatedBuildManifest } from '../../../scripts/manifest';
import generatedSourceManifest from '../../manifest.json';

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  Object.defineProperty(chrome, 'alarms', {
    configurable: true,
    value: { onAlarm: { addListener: vi.fn(), hasListener: vi.fn(() => false) } },
  });
});
afterEach(() => {
  vi.doUnmock('./init-service-worker');
  vi.restoreAllMocks();
});

describe('background worker entry point', () => {
  it('registers the wake listener synchronously before asynchronous initialization completes', async () => {
    expect.assertions(2);
    let finishInitialization: () => void = () => {};
    const initialize = vi.fn(async () => new Promise<void>((resolve) => {
      finishInitialization = resolve;
    }));
    vi.doMock('./init-service-worker', () => ({ initServiceWorker: initialize }));
    await import('./index');
    expect(chrome.alarms.onAlarm.addListener).toHaveBeenCalledOnce();
    expect(initialize).toHaveBeenCalledOnce();
    finishInitialization();
    await flushPromises();
  });

  it('reports initialization failure without an unhandled rejection', async () => {
    expect.assertions(1);
    const error = new Error('Initialization failed');
    vi.doMock('./init-service-worker', () => ({ initServiceWorker: vi.fn().mockRejectedValue(error) }));
    const { LoggerService } = await import('../../services/logger/logger.service');
    const logError = vi.spyOn(LoggerService, 'error').mockImplementation(() => {});
    await import('./index');
    await flushPromises();
    expect(logError).toHaveBeenCalledWith('Background service worker failed to initialized.', error);
  });

  it('initializes the web mock without an alarms API', async () => {
    expect.assertions(1);
    Reflect.deleteProperty(chrome, 'alarms');
    const initialize = vi.fn().mockResolvedValue(undefined);
    vi.doMock('./init-service-worker', () => ({ initServiceWorker: initialize }));
    await import('./index');
    await flushPromises();
    expect(initialize).toHaveBeenCalledOnce();
  });

  it('declares alarms in both build-time and source manifests', () => {
    expect.assertions(2);
    expect(generatedBuildManifest.permissions).toContain('alarms');
    expect(generatedSourceManifest.permissions).toContain('alarms');
  });
});
