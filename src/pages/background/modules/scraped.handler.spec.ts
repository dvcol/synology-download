/* eslint-disable ts/no-unsafe-assignment */
import type { Store } from 'redux';

import type { ScrapedContentsPayload } from '../../../models/message.model';

import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setScrapedContents, setScrapedPage } from '../../../store/actions/scraped.action';
import { onScrapedContentEvent } from './scraped.handler';

const onMessageSubject = new Subject<{ message: { type: string; payload?: ScrapedContentsPayload }; sendResponse: ReturnType<typeof vi.fn> }>();

vi.mock('../../../utils/chrome/chrome-message.utils', () => ({
  onMessage: vi.fn(() => onMessageSubject.asObservable()),
  onConnect: vi.fn(() => new Subject().asObservable()),
  sendMessage: vi.fn(() => ({ subscribe: vi.fn() })),
}));

vi.mock('../../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../store/actions/scraped.action', () => ({
  setScrapedContents: vi.fn((v: unknown) => ({ type: 'SET_SCRAPED_CONTENTS', payload: v })),
  setScrapedPage: vi.fn((v: unknown) => ({ type: 'SET_SCRAPED_PAGE', payload: v })),
}));

describe('scraped.handler', () => {
  let store: Store;

  beforeEach(() => {
    vi.clearAllMocks();
    store = {
      dispatch: vi.fn(),
      getState: vi.fn(() => ({})),
      subscribe: vi.fn(),
      replaceReducer: vi.fn(),
      [Symbol.observable]: vi.fn(),
    } as unknown as Store;
  });

  it('should subscribe to scraped message events', () => {
    onScrapedContentEvent(store);
    // Subscribing should not throw
    expect(store.dispatch).not.toHaveBeenCalled();
  });

  it('should dispatch setScrapedPage and setScrapedContents when payload is present', () => {
    onScrapedContentEvent(store);

    const payload: ScrapedContentsPayload = {
      page: { url: 'https://example.com', title: 'Example' } as any,
      contents: [{ url: 'https://example.com/file.zip' }] as any,
    };

    onMessageSubject.next({
      message: { type: 'scraped', payload },
      sendResponse: vi.fn(),
    });

    expect(setScrapedPage).toHaveBeenCalledWith(payload.page);
    expect(setScrapedContents).toHaveBeenCalledWith(payload.contents);
    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });

  it('should not dispatch when payload is missing', () => {
    onScrapedContentEvent(store);

    onMessageSubject.next({
      message: { type: 'scraped', payload: undefined },
      sendResponse: vi.fn(),
    });

    expect(store.dispatch).not.toHaveBeenCalled();
  });
});
