import { vi } from 'vitest';

vi.mock('@src/store/store-proxy', () => ({ storeProxy: null }));

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
    local: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
    sync: { get: vi.fn(), set: vi.fn(), clear: vi.fn() },
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    create: vi.fn(),
    executeScript: vi.fn(),
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
  },
  scripting: {
    executeScript: vi.fn(),
    registerContentScripts: vi.fn(),
  },
  sidePanel: {
    open: vi.fn(),
    setOptions: vi.fn(),
  },
  i18n: {
    getMessage: vi.fn((key: string) => key),
    getAcceptLanguages: vi.fn(async (cb?: (langs: string[]) => void) => {
      if (cb) cb(['en']);
      return Promise.resolve(['en']);
    }),
  },
} as unknown as typeof chrome;
