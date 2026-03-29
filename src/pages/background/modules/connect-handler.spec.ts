/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-call */
import type { Store } from 'redux';

import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppInstance } from '../../../models/app-instance.model';
import { ChromeMessageType } from '../../../models/message.model';
import { resetLoading, setContentDialog, setContentMenu, setOption, setPanel, setPopup } from '../../../store/actions/state.action';
import { onContentEvents, onPortEvents } from './connect-handler';

type Port = chrome.runtime.Port;

const onConnectSubjects: Record<string, Subject<Port>> = {};
const onMessageSubject = new Subject<{ message: { type: string; payload?: boolean }; sendResponse: ReturnType<typeof vi.fn> }>();

vi.mock('../../../utils/chrome/chrome-message.utils', () => ({
  onConnect: vi.fn((instances: string[]) => {
    const key = instances.join(',');
    if (!onConnectSubjects[key]) onConnectSubjects[key] = new Subject();
    return onConnectSubjects[key].asObservable();
  }),
  onMessage: vi.fn(() => onMessageSubject.asObservable()),
  sendMessage: vi.fn(() => ({ subscribe: vi.fn() })),
}));

vi.mock('../../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../store/actions/state.action', () => ({
  resetLoading: vi.fn(() => ({ type: 'RESET_LOADING' })),
  setContentDialog: vi.fn((v: boolean) => ({ type: 'SET_CONTENT_DIALOG', payload: v })),
  setContentMenu: vi.fn((v: boolean) => ({ type: 'SET_CONTENT_MENU', payload: v })),
  setOption: vi.fn((v: boolean) => ({ type: 'SET_OPTION', payload: v })),
  setPanel: vi.fn((v: boolean) => ({ type: 'SET_PANEL', payload: v })),
  setPopup: vi.fn((v: boolean) => ({ type: 'SET_POPUP', payload: v })),
}));

function createMockPort(name: string): Port {
  const disconnectListeners: Array<() => void> = [];
  return {
    name,
    sender: { tab: { id: 1 }, origin: 'https://example.com' },
    onDisconnect: {
      addListener: vi.fn((cb: () => void) => disconnectListeners.push(cb)),
      removeListener: vi.fn(),
      hasListeners: vi.fn(),
      hasListener: vi.fn(),
      getRules: vi.fn(),
      removeRules: vi.fn(),
      addRules: vi.fn(),
    },
    onMessage: { addListener: vi.fn(), removeListener: vi.fn(), hasListeners: vi.fn(), hasListener: vi.fn(), getRules: vi.fn(), removeRules: vi.fn(), addRules: vi.fn() },
    postMessage: vi.fn(),
    disconnect: vi.fn(),
    _triggerDisconnect: () => disconnectListeners.forEach(cb => cb()),
  } as unknown as Port & { _triggerDisconnect: () => void };
}

describe('connect-handler', () => {
  let store: Store;

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear subjects
    Object.keys(onConnectSubjects).forEach(key => delete onConnectSubjects[key]);

    store = {
      dispatch: vi.fn(),
      getState: vi.fn(() => ({})),
      subscribe: vi.fn(),
      replaceReducer: vi.fn(),
      [Symbol.observable]: vi.fn(),
    } as unknown as Store;
  });

  describe('onPortEvents', () => {
    it('should subscribe to popup, panel, option, and content port connections', () => {
      onPortEvents(store);

      // Should have created subjects for popup, panel, option, content
      expect(Object.keys(onConnectSubjects)).toHaveLength(4);
    });

    it('should dispatch setPopup(true) when popup connects', () => {
      onPortEvents(store);

      const port = createMockPort(AppInstance.popup);
      const key = AppInstance.popup;
      onConnectSubjects[key]?.next(port);

      expect(store.dispatch).toHaveBeenCalledWith(setPopup(true));
    });

    it('should dispatch setPanel(true) when panel connects', () => {
      onPortEvents(store);

      const port = createMockPort(AppInstance.panel);
      const key = AppInstance.panel;
      onConnectSubjects[key]?.next(port);

      expect(store.dispatch).toHaveBeenCalledWith(setPanel(true));
    });

    it('should dispatch setOption(true) when option connects', () => {
      onPortEvents(store);

      const port = createMockPort(AppInstance.option);
      const key = AppInstance.option;
      onConnectSubjects[key]?.next(port);

      expect(store.dispatch).toHaveBeenCalledWith(setOption(true));
    });

    it('should dispatch disconnect and resetLoading on port disconnect', () => {
      onPortEvents(store);

      const port = createMockPort(AppInstance.popup) as Port & { _triggerDisconnect: () => void };
      const key = AppInstance.popup;
      onConnectSubjects[key]?.next(port);

      vi.clearAllMocks();

      // Trigger disconnect
      port._triggerDisconnect();

      expect(store.dispatch).toHaveBeenCalledWith(setPopup(false));
      expect(store.dispatch).toHaveBeenCalledWith(resetLoading());
    });

    it('should set a disconnect timeout for content port', () => {
      vi.useFakeTimers();
      onPortEvents(store);

      const port = createMockPort(AppInstance.content);
      const key = AppInstance.content;
      onConnectSubjects[key]?.next(port);

      expect(port.disconnect).not.toHaveBeenCalled();

      vi.advanceTimersByTime(295e3);
      expect(port.disconnect).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('onContentEvents', () => {
    it('should dispatch setContentMenu when contentMenuOpen message received', () => {
      onContentEvents(store);

      onMessageSubject.next({
        message: { type: ChromeMessageType.contentMenuOpen, payload: true },
        sendResponse: vi.fn(),
      });

      expect(setContentMenu).toHaveBeenCalledWith(true);
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should dispatch setContentDialog when contentDialogOpen message received', () => {
      onContentEvents(store);

      onMessageSubject.next({
        message: { type: ChromeMessageType.contentDialogOpen, payload: true },
        sendResponse: vi.fn(),
      });

      expect(setContentDialog).toHaveBeenCalledWith(true);
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should coerce falsy payload to false', () => {
      onContentEvents(store);

      onMessageSubject.next({
        message: { type: ChromeMessageType.contentMenuOpen, payload: undefined as any },
        sendResponse: vi.fn(),
      });

      expect(setContentMenu).toHaveBeenCalledWith(false);
    });
  });
});
