jest.mock('@src/store/store-proxy', () => ({ storeProxy: null }));

// Mock chrome API
const chromeMock = {
  runtime: {
    id: 'test-extension-id',
    getManifest: jest.fn(() => ({ version: '0.0.0', name: 'test' })),
    sendMessage: jest.fn(),
    onMessage: { addListener: jest.fn(), removeListener: jest.fn() },
    onInstalled: { addListener: jest.fn() },
    getURL: jest.fn((path: string) => `chrome-extension://test-extension-id/${path}`),
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn(),
    },
    onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn(),
    executeScript: jest.fn(),
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn(),
    onClicked: { addListener: jest.fn() },
    onClosed: { addListener: jest.fn() },
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    onClicked: { addListener: jest.fn() },
  },
  downloads: {
    download: jest.fn(),
    search: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    cancel: jest.fn(),
    open: jest.fn(),
    show: jest.fn(),
    erase: jest.fn(),
    getFileIcon: jest.fn(),
    onCreated: { addListener: jest.fn(), removeListener: jest.fn() },
    onChanged: { addListener: jest.fn(), removeListener: jest.fn() },
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
  },
  scripting: {
    executeScript: jest.fn(),
    registerContentScripts: jest.fn(),
  },
  sidePanel: {
    open: jest.fn(),
    setOptions: jest.fn(),
  },
  i18n: {
    getMessage: jest.fn((key: string) => key),
    getAcceptLanguages: jest.fn(async (cb?: (langs: string[]) => void) => {
      if (cb) cb(['en']);
      return Promise.resolve(['en']);
    }),
  },
};

Object.assign(globalThis, { chrome: chromeMock });
