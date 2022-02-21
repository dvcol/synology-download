import { Observable } from 'rxjs';

import { ChromeMessageType, ContextMenu } from '@src/models';
import { buildContextMenu, onMessage, removeContextMenu, saveContextMenu } from '@src/utils';

/** Listen to context menu events to create/updates menus */
export const onMessageEvents = () => {
  // On message from chrome handle payload
  onMessage([ChromeMessageType.addMenu, ChromeMessageType.updateMenu, ChromeMessageType.removeMenu, ChromeMessageType.resetMenu]).subscribe(
    ({ message, sendResponse }) => {
      const { type, payload } = message ?? { type: null, payload: null };
      const handle = <T>(obs$: Observable<T>) =>
        obs$.subscribe({
          next: () => sendResponse({ success: true, payload }),
          error: (error) => sendResponse({ success: false, error }),
        });

      switch (type) {
        case ChromeMessageType.addMenu:
          handle(saveContextMenu(payload as ContextMenu));
          break;
        case ChromeMessageType.updateMenu:
          handle(saveContextMenu(payload as ContextMenu, true));
          break;
        case ChromeMessageType.removeMenu:
          handle(removeContextMenu(payload as string));
          break;
        case ChromeMessageType.resetMenu:
          handle(buildContextMenu(payload as ContextMenu[]));
          break;
      }
    }
  );
};
