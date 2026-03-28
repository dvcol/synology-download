import type { OpenPanelPayload, OpenPopupPayload } from '../../../models/message.model';
import type { StoreOrProxy } from '../../../models/store.model';

import { firstValueFrom, timeout } from 'rxjs';

import { AppInstance } from '../../../models/app-instance.model';
import { ChromeMessageType } from '../../../models/message.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { getPanel } from '../../../store/selectors/state.selector';
import { onConnect, onMessage, sendMessage } from '../../../utils/chrome/chrome-message.utils';
import { getCurrentWindow, openPanel } from '../../../utils/chrome/chrome.utils';

export function onOpenPanelEvent(store: StoreOrProxy) {
  LoggerService.debug('Subscribing to open popup events.');

  onMessage<OpenPanelPayload>([ChromeMessageType.openTaskPanel]).subscribe(async ({ message }) => {
    LoggerService.debug('Open panel events received', message);

    if (!message?.payload) return LoggerService.error('Payload is missing', message);

    const { options, ...payload } = message.payload;

    if (!openPanel) return LoggerService.error('Open panel is not available', message);
    if (!options) {
      if (!getCurrentWindow) return LoggerService.error('Get current window is not available', message);
      return getCurrentWindow(async (active) => {
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
}
