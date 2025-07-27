import { firstValueFrom, lastValueFrom, timeout } from 'rxjs';

import {
  buildContextMenu as _buildContextMenu,
  removeContextMenu as _removeContextMenu,
  saveContextMenu as _saveContextMenu,
} from '@dvcol/web-extension-utils';

import type { ContextMenu, ContextMenuOnClickPayload, ResetMenuPayload } from '@src/models';
import { AppInstance, ChromeMessageType, scrapeContextMenu } from '@src/models';
import { LoggerService } from '@src/services';
import type { Tab } from '@src/utils';
import { isSidePanelEnabledCb, onConnect, openPanel, openPopup, sendMessage, sendTabMessage } from '@src/utils';

import type { Observable } from 'rxjs';

export type OnClickData = chrome.contextMenus.OnClickData;
export type TabInfo = chrome.tabs.Tab;

function createContextMenu(menu: ContextMenu, update?: boolean): Observable<void> {
  // custom fields modal from menu for type casting
  const { modal, popup, panel, destination, ...create } = menu;
  return _saveContextMenu(
    {
      ...create,
      onclick: (info: OnClickData, tab?: Tab) => {
        if (info.menuItemId === menu.id && tab?.id !== undefined) {
          sendTabMessage<ContextMenuOnClickPayload>(tab.id, {
            type: ChromeMessageType.clickMenu,
            payload: { info, menu },
          }).subscribe();
        }
      },
    },
    update,
  );
}

/**
 * Add or update a context menu to chrome with the given options
 */
export function saveContextMenu(menu: ContextMenu, update?: boolean): Promise<void> {
  return lastValueFrom(createContextMenu(menu, update));
}

/**
 * Remove context menu from chrome corresponding to the specified id
 */
export function removeContextMenu(id: string): Promise<void> {
  return lastValueFrom(_removeContextMenu(id));
}

/**
 * Add / Remove the scrape context menu
 * @param show whether to show or hide the scrape context menu
 */
export function toggleScrapeContextMenu(show = true): Promise<void> {
  console.info('Toggling scrape context menu', { show });
  if (!show) return removeContextMenu(scrapeContextMenu.id);
  return lastValueFrom(
    _saveContextMenu({
      ...scrapeContextMenu,
      onclick: async (info: OnClickData, tab: TabInfo) =>
        isSidePanelEnabledCb(async sidePanel => {
          if (info.menuItemId === scrapeContextMenu.id) {
            if (sidePanel && openPanel) {
              await openPanel({ windowId: tab.windowId });
              try {
                await firstValueFrom(onConnect([AppInstance.panel]).pipe(timeout(100)));
              } catch (error) {
                LoggerService.warn('Panel opening error', error);
              }
            } else {
              if (sidePanel && !openPanel) LoggerService.error('Open panel is not available');
              if (!openPopup) return LoggerService.error('Open popup is not available');
              await openPopup();
            }
            sendMessage({ type: ChromeMessageType.routeScrapePage }).subscribe();
          }
        }),
    }),
  );
}

/**
 * Build context menu for the menu options given
 * @param options the options
 */
export async function buildContextMenu({ menus, scrape = true }: ResetMenuPayload): Promise<void> {
  await lastValueFrom(_buildContextMenu(menus, createContextMenu));
  if (scrape) await toggleScrapeContextMenu(scrape);
}
