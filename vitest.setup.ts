import { vi } from 'vitest';

vi.mock('./src/store/store-proxy', () => ({ storeProxy: null }));

// matchMedia mock for jsdom (used by MUI theme detection)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// eslint-disable-next-line ts/no-unsafe-assignment -- chrome mock for tests
globalThis.chrome = {
  runtime: {
    id: 'test-extension-id',
    getManifest: vi.fn(() => ({ version: '0.0.0', name: 'test' })),
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    onInstalled: { addListener: vi.fn() },
    getURL: vi.fn((path: string) => `chrome-extension://test-extension-id/${path}`),
  },
  storage: {
    local: { get: vi.fn(async () => Promise.resolve({})), set: vi.fn(async () => Promise.resolve()), clear: vi.fn(async () => Promise.resolve()) },
    sync: { get: vi.fn(async () => Promise.resolve({})), set: vi.fn(async () => Promise.resolve()), clear: vi.fn(async () => Promise.resolve()) },
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabs: {
    query: vi.fn(async () => Promise.resolve([])),
    sendMessage: vi.fn(async () => Promise.resolve()),
    create: vi.fn(async () => Promise.resolve({})),
    executeScript: vi.fn(async () => Promise.resolve([])),
  },
  notifications: {
    create: vi.fn(),
    clear: vi.fn(),
    onClicked: { addListener: vi.fn() },
    onClosed: { addListener: vi.fn() },
  },
  contextMenus: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn(),
    onClicked: { addListener: vi.fn() },
  },
  downloads: {
    download: vi.fn(),
    search: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    open: vi.fn(),
    show: vi.fn(),
    erase: vi.fn(),
    getFileIcon: vi.fn(),
    onCreated: { addListener: vi.fn(), removeListener: vi.fn() },
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
    setTitle: vi.fn(),
    setIcon: vi.fn(),
  },
  scripting: {
    executeScript: vi.fn(),
    registerContentScripts: vi.fn(),
  },
  sidePanel: {
    open: vi.fn(),
    setOptions: vi.fn(),
    setPanelBehavior: vi.fn(async () => Promise.resolve()),
  },
  i18n: {
    getMessage: vi.fn((key: string) => key),
    getAcceptLanguages: vi.fn((cb?: (langs: string[]) => void) => {
      if (cb) cb(['en']);
    }),
  },
} as unknown as typeof chrome;

// Initialize QueryService with the test store so components using it don't crash
// Uses dynamic import to avoid hoisting above the chrome mock
beforeAll(async () => {
  const { ServiceInstance } = await import('./src/models/settings.model');
  const { QueryService } = await import('./src/services/query/query.service');
  const { store } = await import('./src/store/store');
  QueryService.init(store, ServiceInstance.Popup);
});
