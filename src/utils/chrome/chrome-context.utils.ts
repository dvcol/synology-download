import {
  buildContextMenu as _buildContextMenu,
  removeContextMenu as _removeContextMenu,
  saveContextMenu as _saveContextMenu,
} from '@dvcol/web-extension-utils';

import type { ContextMenu, ContextMenuOnClickPayload } from '@src/models';
import { ChromeMessageType } from '@src/models';
import type { Tab } from '@src/utils';
import { sendTabMessage } from '@src/utils';

import type { Observable } from 'rxjs';

export type OnClickData = chrome.contextMenus.OnClickData;

/**
 * Add or update a context menu to chrome with the given options
 */
export function saveContextMenu(menu: ContextMenu, update?: boolean): Observable<void> {
  // custom fields modal from menu for type casting
  const { modal, popup, destination, ...create } = menu;
  return _saveContextMenu(
    {
      ...create,
      onclick: (info: OnClickData, tab?: Tab) => {
        if (info.menuItemId === menu.id && tab?.id !== undefined) {
          sendTabMessage<ContextMenuOnClickPayload>(tab.id, {
            type: ChromeMessageType.popup,
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
export const buildContextMenu = (options: ContextMenu[] | undefined) => _buildContextMenu(options, saveContextMenu);
