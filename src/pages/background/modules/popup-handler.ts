import type { OpenPopupPayload } from '../../../models/message.model';

import { ChromeMessageType } from '../../../models/message.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { onMessage, sendMessage } from '../../../utils/chrome/chrome-message.utils';
import { openPopup } from '../../../utils/chrome/chrome.utils';

export function onOpenPopupEvent() {
  LoggerService.debug('Subscribing to open popup events.');

  onMessage<OpenPopupPayload>([ChromeMessageType.openTaskPopup]).subscribe(async ({ message }) => {
    LoggerService.debug('Open popup events received', message);

    if (!openPopup) return LoggerService.error('Open popup is not available', message);
    await openPopup();
    sendMessage<OpenPopupPayload>({
      type: ChromeMessageType.routeTaskForm,
      payload: message?.payload,
    }).subscribe();
  });
}
