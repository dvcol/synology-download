import type { OpenPopupPayload } from '@src/models';
import { ChromeMessageType } from '@src/models';
import { LoggerService } from '@src/services';
import { onMessage, openPopup, sendMessage } from '@src/utils';

export const onOpenPopupEvent = () => {
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
};
