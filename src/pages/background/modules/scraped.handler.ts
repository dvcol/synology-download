import type { ScrapedContentsPayload } from '@src/models';
import { ChromeMessageType } from '@src/models';
import { LoggerService } from '@src/services';
import { setScrapedContents, setScrapedPage } from '@src/store/actions';
import { onMessage } from '@src/utils';

import type { Store } from 'redux';

export const onScrapedContentEvent = (store: Store) => {
  LoggerService.debug('Subscribing to scraped contents events.');

  onMessage<ScrapedContentsPayload>([ChromeMessageType.scraped]).subscribe(({ message }) => {
    LoggerService.debug('Scraped contents events received', message);
    if (message?.payload) {
      store.dispatch(setScrapedPage(message.payload.page));
      store.dispatch(setScrapedContents(message.payload.contents));
    }
  });
};
