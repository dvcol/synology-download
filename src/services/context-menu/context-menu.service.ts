import { ChromeMessageType, ContextMenu } from '../../models';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { sendTabMessage } from '../../utils';
import OnClickData = chrome.contextMenus.OnClickData;

/**
 * Add or update a context menu to chrome with the given options
 */
export function saveContextMenu({ destination, modal, ...option }: ContextMenu, update?: boolean): Observable<void> {
  return new Observable<void>((subscriber) => {
    console.debug('adding context menu');

    if (update) {
      const { id, ...updates } = option;
      chrome.contextMenus.update(id, updates, () => {
        console.debug('Context menu updated');

        subscriber.next();
        subscriber.complete();
      });
    } else {
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
              sendTabMessage<OnClickData>(tab.id, { type: ChromeMessageType.popup, payload: info }).subscribe();
            }
          });

          subscriber.next();
          subscriber.complete();
        }
      );
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
