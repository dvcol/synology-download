jest.mock('@src/store/store-proxy', () => ({ storeProxy: null }));

// Mock Chrome API for tests
global.chrome = {
  action: {
    setIcon: jest.fn(),
    setBadgeText: jest.fn(),
    setTitle: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
    openPopup: jest.fn(),
  },
  notifications: {
    create: jest.fn(),
  },
  tabs: {
    create: jest.fn(),
    query: jest.fn(),
  },
  windows: {
    getCurrent: jest.fn(),
  },
  sidePanel: {
    open: jest.fn(),
    getPanelBehavior: jest.fn().mockResolvedValue({ openPanelOnActionClick: false }),
  },
  runtime: {
    getManifest: jest.fn().mockReturnValue({ version: '1.0.0' }),
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    connect: jest.fn(),
    onConnect: {
      addListener: jest.fn(),
    },
  },
  contextMenus: {
    create: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    update: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
  },
  permissions: {
    request: jest.fn(),
    contains: jest.fn(),
  },
  alarms: {
    create: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    onAlarm: {
      addListener: jest.fn(),
    },
  },
} as any;
