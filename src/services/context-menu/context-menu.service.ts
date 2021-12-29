import { ChromeMessageType, ContextMenuOption } from '../../models';
import { EMPTY, forkJoin, Observable } from 'rxjs';

/**
 * Add a new context menu to chrome with the given options
 */
export function createContextMenu(option: ContextMenuOption): Observable<void> {
  return new Observable<void>((subscriber) => {
    console.debug('adding context menu');
    chrome.contextMenus.create(
      {
        ...option,
        enabled: true,
      },
      () => {
        console.debug('Context menu created');

        chrome.contextMenus.onClicked.addListener(function (info, tab) {
          if (info.menuItemId === option.id && tab?.id !== undefined) {
            // On click instruct content.ts to open the modal
            chrome.tabs.sendMessage(tab.id, {
              type: ChromeMessageType.popup,
              payload: info,
            });
          }
        });

        subscriber.next();
        subscriber.complete();
      }
    );
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
export function buildContextMenu(options: ContextMenuOption[] | undefined): Observable<void | void[]> {
  chrome.contextMenus.removeAll();
  if (options?.length) return forkJoin(options.map(createContextMenu));
  return EMPTY;
}
