import type { Store } from 'redux';

import type { ScrapedContentsPayload } from '../../../models/message.model';

import { ChromeMessageType } from '../../../models/message.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { setScrapedContents, setScrapedPage } from '../../../store/actions/scraped.action';
import { onMessage } from '../../../utils/chrome/chrome-message.utils';

export function onScrapedContentEvent(store: Store) {
  LoggerService.debug('Subscribing to scraped contents events.');

  onMessage<ScrapedContentsPayload>([ChromeMessageType.scraped]).subscribe(({ message }) => {
    LoggerService.debug('Scraped contents events received', message);
    if (message?.payload) {
      store.dispatch(setScrapedPage(message.payload.page));
      store.dispatch(setScrapedContents(message.payload.contents));
    }
  });
}
