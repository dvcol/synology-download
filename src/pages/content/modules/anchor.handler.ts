import { fromEventPattern } from 'rxjs';

import { anchor$, lastClick$ } from '@src/pages/content/service/anchor.service';

/**
 * List of supported protocols
 */
const DOWNLOAD_ONLY_PROTOCOLS = ['magnet', 'thunder', 'flashget', 'qqdl', 'ed2k'];

/**
 * Check if the url starts with the given protocol(s)
 * @param url the url to test
 * @param protocols the protocol(s)
 */
function startsWithAnyProtocol(url: string, protocols: string | string[]) {
  if (typeof protocols === 'string') {
    return url.startsWith(`${protocols}:`);
  }
  return protocols.some(protocol => url.startsWith(`${protocol}:`));
}

/**
 * Finds the HTMLAnchorElement in the e element's parent tree with the given tree depth
 * @param e the element
 * @param depth the tree depth
 */
function recursivelyFindAnchorAncestor(e: HTMLElement | null, depth = 10): HTMLAnchorElement | undefined {
  if (e == null) {
    return undefined;
  }
  if (e instanceof HTMLAnchorElement) {
    return e;
  }
  if (depth === 0) {
    return undefined;
  }
  return recursivelyFindAnchorAncestor(e.parentElement, depth - 1);
}

/**
 * Inspired by https://github.com/seansfkelley/nas-download-manager/blob/master/src/content/index.ts
 * Detect if the click event is on a supported downloadable link
 * @param event mouse event
 */
const listener = async (event: MouseEvent) => {
  const anchor = recursivelyFindAnchorAncestor(event.target as HTMLElement);
  lastClick$.next({ event, anchor });
  // Left clicks only
  if (event.button === 0) {
    if (anchor != null && anchor.href && startsWithAnyProtocol(anchor.href, DOWNLOAD_ONLY_PROTOCOLS)) {
      anchor$.next({
        event,
        anchor,
        form: {
          uri: anchor.href,
          source: document.URL,
        },
      });
      event.preventDefault();
    }
  }
};

const addAnchorClickListener = () => document.addEventListener('click', listener);
const removeAnchorClickListener = () => document.removeEventListener('click', listener);

export const clickListener$ = fromEventPattern(addAnchorClickListener, removeAnchorClickListener);
