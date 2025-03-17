import { firstValueFrom, forkJoin } from 'rxjs';

import {
  buildContextMenu as _buildContextMenu,
  removeContextMenu as _removeContextMenu,
  saveContextMenu as _saveContextMenu,
} from '@dvcol/web-extension-utils';

import type { ContextMenu, ContextMenuOnClickPayload } from '@src/models';
import { AppInstance, ChromeMessageType, scrapeContextMenu } from '@src/models';
import { LoggerService } from '@src/services';
import type { Tab } from '@src/utils';
import { isSidePanelEnabledCb, onConnect, openPanel, openPopup, sendMessage, sendTabMessage } from '@src/utils';

import type { Observable } from 'rxjs';

export type OnClickData = chrome.contextMenus.OnClickData;
export type TabInfo = chrome.tabs.Tab;

export const addScrapeContextMenu = () =>
  _saveContextMenu({
    ...scrapeContextMenu,
    onclick: async (info: OnClickData, tab: TabInfo) =>
      isSidePanelEnabledCb(async sidePanel => {
        if (info.menuItemId === scrapeContextMenu.id) {
          if (sidePanel && openPanel) {
            await openPanel({ windowId: tab.windowId });
            await firstValueFrom(onConnect([AppInstance.panel]));
          } else {
            if (sidePanel && !openPanel) LoggerService.error('Open panel is not available');
            if (!openPopup) return LoggerService.error('Open popup is not available');
            await openPopup();
          }
          sendMessage({ type: ChromeMessageType.routeScrapePage }).subscribe();
        }
      }),
  });

/**
 * Add or update a context menu to chrome with the given options
 */
export function saveContextMenu(menu: ContextMenu, update?: boolean): Observable<void> {
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
 * Remove context menu from chrome corresponding to the specified id
 */
export const removeContextMenu = _removeContextMenu;

/**
 * Build context menu for the menu options given
 * @param options the options
 */
export const buildContextMenu = (options: ContextMenu[] | undefined) =>
  forkJoin([_buildContextMenu(options, saveContextMenu), addScrapeContextMenu()]);
