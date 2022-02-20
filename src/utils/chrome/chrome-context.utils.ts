import { EMPTY, forkJoin, Observable, Subscriber } from 'rxjs';

import { ChromeMessageType, ContextMenu, ContextMenuOnClickPayload } from '@src/models';
import { sendTabMessage } from '@src/utils';

import OnClickData = chrome.contextMenus.OnClickData;
import Tab = chrome.tabs.Tab;
import UpdateProperties = chrome.contextMenus.UpdateProperties;

/**
 * Update an already creation context menu
 */
const updateContextMenu = (id: string, updates: UpdateProperties, subscriber: Subscriber<void>) =>
  chrome.contextMenus.update(id, updates, () => {
    console.debug('Context menu updated');
    subscriber.next();
    subscriber.complete();
  });

/**
 * Add or update a context menu to chrome with the given options
 */
export function saveContextMenu(menu: ContextMenu, update?: boolean): Observable<void> {
  return new Observable<void>((subscriber) => {
    const { destination, modal, ...option } = menu;
    const { id, ...updates } = option;

    // On click instruct content.ts to open the modal
    const onclick = (info: OnClickData, tab?: Tab) => {
      if (info.menuItemId === option.id && tab?.id !== undefined) {
        sendTabMessage<ContextMenuOnClickPayload>(tab.id, { type: ChromeMessageType.popup, payload: { info, menu } }).subscribe();
      }
    };

    if (update) {
      updateContextMenu(id, { ...updates, onclick }, subscriber);
    } else {
      chrome.contextMenus.create({ ...option, enabled: true }, () => {
        console.debug('Context menu created');
        updateContextMenu(id, { ...updates, onclick }, subscriber);
      });
    }
  });
}

/**
 * Remove context menu from chrome corresponding to the specified id
 */
export function removeContextMenu(id: string): Observable<void> {
  return new Observable<void>((subscriber) => {
    console.debug('removing context menu');
    chrome.contextMenus.remove(id, () => {
      console.debug('Context menu removed');
      subscriber.next();
      subscriber.complete();
    });
  });
}

/**
 * Build context menu for the menu options given
 * @param options the options
 */
export function buildContextMenu(options: ContextMenu[] | undefined): Observable<void | void[]> {
  chrome.contextMenus.removeAll();
  if (options?.length) return forkJoin(options.map((o) => saveContextMenu(o)));
  return EMPTY;
}
