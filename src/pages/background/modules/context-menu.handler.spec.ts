/* eslint-disable ts/no-unsafe-assignment */
import type { ContextMenu } from '../../../models/menu.model';
import type { ResetMenuPayload } from '../../../models/message.model';

import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChromeMessageType } from '../../../models/message.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { buildContextMenu, removeContextMenu, saveContextMenu, toggleScrapeContextMenu } from '../../../utils/chrome/chrome-context.utils';
import { onContextMenuEvents } from './context-menu.handler';

const onMessageSubject = new Subject<{ message: { type: string; payload?: unknown }; sendResponse: ReturnType<typeof vi.fn> }>();

vi.mock('../../../utils/chrome/chrome-message.utils', () => ({
  onMessage: vi.fn(() => onMessageSubject.asObservable()),
  onConnect: vi.fn(() => new Subject().asObservable()),
  sendMessage: vi.fn(() => ({ subscribe: vi.fn() })),
}));

vi.mock('../../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../utils/chrome/chrome-context.utils', () => ({
  saveContextMenu: vi.fn(async () => Promise.resolve()),
  removeContextMenu: vi.fn(async () => Promise.resolve()),
  toggleScrapeContextMenu: vi.fn(async () => Promise.resolve()),
  buildContextMenu: vi.fn(async () => Promise.resolve()),
}));

describe('context-menu.handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to context menu message events', () => {
    onContextMenuEvents();
    expect(LoggerService.debug).toHaveBeenCalledWith('Subscribing to context menu events.');
  });

  it('should call saveContextMenu on addMenu message', async () => {
    onContextMenuEvents();

    const sendResponse = vi.fn();
    const menu: ContextMenu = { id: 'test-menu', title: 'Test' } as any;

    onMessageSubject.next({
      message: { type: ChromeMessageType.addMenu, payload: menu },
      sendResponse,
    });

    await vi.waitFor(() => {
      expect(saveContextMenu).toHaveBeenCalledWith(menu);
    });

    await vi.waitFor(() => {
      expect(sendResponse).toHaveBeenCalledWith({ success: true, payload: menu });
    });
  });

  it('should call saveContextMenu with update flag on updateMenu message', async () => {
    onContextMenuEvents();

    const sendResponse = vi.fn();
    const menu: ContextMenu = { id: 'test-menu', title: 'Updated' } as any;

    onMessageSubject.next({
      message: { type: ChromeMessageType.updateMenu, payload: menu },
      sendResponse,
    });

    await vi.waitFor(() => {
      expect(saveContextMenu).toHaveBeenCalledWith(menu, true);
    });
  });

  it('should call removeContextMenu on removeMenu message', async () => {
    onContextMenuEvents();

    const sendResponse = vi.fn();
    const menuId = 'test-menu-id';

    onMessageSubject.next({
      message: { type: ChromeMessageType.removeMenu, payload: menuId },
      sendResponse,
    });

    await vi.waitFor(() => {
      expect(removeContextMenu).toHaveBeenCalledWith(menuId);
    });
  });

  it('should call toggleScrapeContextMenu on toggleScrapeMenu message', async () => {
    onContextMenuEvents();

    const sendResponse = vi.fn();

    onMessageSubject.next({
      message: { type: ChromeMessageType.toggleScrapeMenu, payload: true },
      sendResponse,
    });

    await vi.waitFor(() => {
      expect(toggleScrapeContextMenu).toHaveBeenCalledWith(true);
    });
  });

  it('should call buildContextMenu on resetMenu message', async () => {
    onContextMenuEvents();

    const sendResponse = vi.fn();
    const payload: ResetMenuPayload = { menus: [], scrape: false };

    onMessageSubject.next({
      message: { type: ChromeMessageType.resetMenu, payload },
      sendResponse,
    });

    await vi.waitFor(() => {
      expect(buildContextMenu).toHaveBeenCalledWith(payload);
    });
  });

  it('should send error response when handler rejects', async () => {
    onContextMenuEvents();

    const error = new Error('Save failed');
    vi.mocked(saveContextMenu).mockRejectedValueOnce(error);

    const sendResponse = vi.fn();
    const menu: ContextMenu = { id: 'fail-menu', title: 'Fail' } as any;

    onMessageSubject.next({
      message: { type: ChromeMessageType.addMenu, payload: menu },
      sendResponse,
    });

    await vi.waitFor(() => {
      expect(sendResponse).toHaveBeenCalledWith({ success: false, error });
    });
  });

  it('should send error response when handler rejects on update', async () => {
    onContextMenuEvents();

    const error = new Error('Update failed');
    vi.mocked(saveContextMenu).mockRejectedValueOnce(error);

    const sendResponse = vi.fn();
    const menu: ContextMenu = { id: 'fail-update', title: 'Fail' } as any;

    onMessageSubject.next({
      message: { type: ChromeMessageType.updateMenu, payload: menu },
      sendResponse,
    });

    await vi.waitFor(() => {
      expect(sendResponse).toHaveBeenCalledWith({ success: false, error });
    });
  });
});
