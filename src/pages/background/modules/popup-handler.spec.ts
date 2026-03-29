/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment */
import type { OpenPopupPayload } from '../../../models/message.model';

import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChromeMessageType } from '../../../models/message.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { sendMessage } from '../../../utils/chrome/chrome-message.utils';
import { openPopup } from '../../../utils/chrome/chrome.utils';
import { onOpenPopupEvent } from './popup-handler';

const onMessageSubject = new Subject<{ message: { type: string; payload?: OpenPopupPayload }; sendResponse: ReturnType<typeof vi.fn> }>();

vi.mock('../../../utils/chrome/chrome-message.utils', () => ({
  onMessage: vi.fn(() => onMessageSubject.asObservable()),
  sendMessage: vi.fn(() => ({ subscribe: vi.fn() })),
  onConnect: vi.fn(() => new Subject().asObservable()),
}));

vi.mock('../../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../utils/chrome/chrome.utils', () => ({
  openPopup: vi.fn(async () => Promise.resolve()),
  setBadgeBackgroundColor: vi.fn(),
  setBadgeText: vi.fn(),
  setTitle: vi.fn(),
  setIcon: vi.fn(),
}));

describe('popup-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should subscribe to open popup message events', () => {
    onOpenPopupEvent();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('should call openPopup and sendMessage when message is received', async () => {
    onOpenPopupEvent();

    const payload = { form: { uri: 'https://example.com/file.zip', source: 'https://example.com' } };
    onMessageSubject.next({
      message: { type: ChromeMessageType.openTaskPopup, payload },
      sendResponse: vi.fn(),
    });

    await vi.waitFor(() => {
      expect(openPopup).toHaveBeenCalled();
      expect(sendMessage).toHaveBeenCalledWith({
        type: ChromeMessageType.routeTaskForm,
        payload,
      });
    });
  });

  it('should log error when openPopup is not available', async () => {
    const chromeUtils = await import('../../../utils/chrome/chrome.utils');
    const original = chromeUtils.openPopup;
    (chromeUtils as any).openPopup = null;

    onOpenPopupEvent();

    onMessageSubject.next({
      message: { type: ChromeMessageType.openTaskPopup, payload: { form: { uri: 'test' } } },
      sendResponse: vi.fn(),
    });

    await vi.waitFor(() => {
      expect(LoggerService.error).toHaveBeenCalled();
    });

    (chromeUtils as any).openPopup = original;
  });
});
