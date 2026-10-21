import { fromEventPattern } from 'rxjs';

import { storeProxy } from '../../../store/store-proxy';
import { anchor$, lastClick$ } from '../service/anchor.service';

/**
 * List of supported protocols
 */
const DOWNLOAD_ONLY_PROTOCOLS = ['magnet', 'thunder', 'flashget', 'qqdl', 'ed2k'];
const DOWNLOAD_FILE_EXTENSION = /\.(?:torrent|nzb)$/i;

/** Match file extensions in HTTP(S) paths without inspecting query parameters. */
function isDownloadFileLink(url: string): boolean {
  try {
    const { protocol, pathname } = new URL(url);
    return (protocol === 'http:' || protocol === 'https:') && DOWNLOAD_FILE_EXTENSION.test(pathname);
  } catch {
    return false;
  }
}

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
async function listener(event: MouseEvent) {
  const anchor = recursivelyFindAnchorAncestor(event.target as HTMLElement);
  lastClick$.next({ event, anchor });
  const settings = storeProxy.getState()?.settings?.content;
  if (settings?.intercept === false) return;
  // Left clicks only
  if (event.button !== 0) return;
  if (!anchor?.href) return;
  if (!startsWithAnyProtocol(anchor.href, DOWNLOAD_ONLY_PROTOCOLS)) {
    if (settings?.interceptFiles !== true) return;
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (!isDownloadFileLink(anchor.href)) return;
  }
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

function addAnchorClickListener() {
  document.addEventListener('click', listener);
  document.addEventListener('contextmenu', listener);
}
function removeAnchorClickListener() {
  document.removeEventListener('click', listener);
  document.removeEventListener('contextmenu', listener);
}

export const clickListener$ = fromEventPattern<MouseEvent>(addAnchorClickListener, removeAnchorClickListener);
