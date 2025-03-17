import { firstValueFrom, timeout } from 'rxjs';

import type { OpenPanelPayload, OpenPopupPayload } from '@src/models';
import { AppInstance, ChromeMessageType } from '@src/models';
import { LoggerService } from '@src/services';
import { getPanel } from '@src/store/selectors';
import { getCurrentWindow, onConnect, onMessage, openPanel, sendMessage } from '@src/utils';

import type { Store } from 'redux';

export const onOpenPanelEvent = (store: Store) => {
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
        await openPanel({ windowId: active.id });

        try {
          if (!getPanel(store.getState())) await firstValueFrom(onConnect([AppInstance.panel]).pipe(timeout(1000)));
        } catch (error) {
          LoggerService.warn('Panel opening error', error);
        }

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
