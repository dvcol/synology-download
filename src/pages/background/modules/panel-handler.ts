import { firstValueFrom } from 'rxjs';

import type { OpenPanelPayload, OpenPopupPayload } from '@src/models';
import { AppInstance, ChromeMessageType } from '@src/models';
import { LoggerService } from '@src/services';
import { getCurrentWindow, onConnect, onMessage, openPanel, sendMessage } from '@src/utils';

export const onOpenPanelEvent = () => {
  LoggerService.debug('Subscribing to open popup events.');

  onMessage<OpenPanelPayload>([ChromeMessageType.openTaskPanel]).subscribe(async ({ message }) => {
    LoggerService.debug('Open panel events received', message);

    if (!message?.payload) return LoggerService.error('Payload is missing', message);

    const { options, ...payload } = message.payload;

    if (!openPanel) return LoggerService.error('Open panel is not available', message);
    if (!options) {
      if (!getCurrentWindow) return LoggerService.error('Get current window is not available', message);
      return getCurrentWindow(async active => {
        if (!openPanel) return LoggerService.error('Open panel is not available', message);
        if (!active.id) return LoggerService.error('Active window is not available', message);
        console.info('Opening panel with active window', active);
        await openPanel({ windowId: active.id });
        await firstValueFrom(onConnect([AppInstance.panel]));
        sendMessage<OpenPopupPayload>({
          type: ChromeMessageType.routeTaskForm,
          payload,
        }).subscribe();
      });
    }
    await openPanel(options);
    sendMessage<OpenPopupPayload>({
      type: ChromeMessageType.routeTaskForm,
      payload,
    }).subscribe();
  });
};
