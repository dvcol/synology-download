import type { ContextMenu, ResetMenuPayload } from '@src/models';
import { ChromeMessageType } from '@src/models';
import { LoggerService } from '@src/services';
import { buildContextMenu, onMessage, removeContextMenu, saveContextMenu, toggleScrapeContextMenu } from '@src/utils';

/** Listen to context menu events to create/updates menus */
export const onContextMenuEvents = () => {
  LoggerService.debug('Subscribing to context menu events.');

  // On message from chrome handle payload
  onMessage([
    ChromeMessageType.addMenu,
    ChromeMessageType.updateMenu,
    ChromeMessageType.removeMenu,
    ChromeMessageType.toggleScrapeMenu,
    ChromeMessageType.resetMenu,
  ]).subscribe(async ({ message, sendResponse }) => {
    if (message) {
      const { type, payload } = message;
      const handle = async <T>(promise: Promise<T>) => {
        try {
          await promise;
          sendResponse({ success: true, payload });
        } catch (error) {
          sendResponse({ success: false, error: error as Error });
        }
      };

      switch (type) {
        case ChromeMessageType.addMenu:
          await handle(saveContextMenu(payload as ContextMenu));
          break;
        case ChromeMessageType.updateMenu:
          await handle(saveContextMenu(payload as ContextMenu, true));
          break;
        case ChromeMessageType.removeMenu:
          await handle(removeContextMenu(payload as string));
          break;
        case ChromeMessageType.toggleScrapeMenu:
          await handle(toggleScrapeContextMenu(payload as boolean));
          break;
        case ChromeMessageType.resetMenu:
          await handle(buildContextMenu(payload as ResetMenuPayload));
          break;
        default:
          LoggerService.error(`Message type '${type}' not supported`);
      }
    }
  });
};
