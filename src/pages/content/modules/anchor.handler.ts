import type { ContentInterception } from '../../../models/settings.model';

import { fromEventPattern } from 'rxjs';

import { defaultContentInterceptions, supportedContentInterceptions } from '../../../models/settings.model';
import { storeProxy } from '../../../store/store-proxy';
import { anchor$, lastClick$ } from '../service/anchor.service';

/** Preserve custom protocol syntax and match HTTP(S) file paths without inspecting query parameters. */
function getSupportedInterception(url: string): ContentInterception | undefined {
  const interceptions = Object.keys(supportedContentInterceptions) as ContentInterception[];
  const protocolInterception = interceptions.find((interception) => {
    const definition = supportedContentInterceptions[interception];
    return 'protocol' in definition && url.startsWith(definition.protocol);
  });
  if (protocolInterception) return protocolInterception;

  try {
    const { protocol, pathname } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return undefined;
    return interceptions.find((interception) => {
      const definition = supportedContentInterceptions[interception];
      return 'extension' in definition && pathname.toLowerCase().endsWith(definition.extension);
    });
  } catch {
    return undefined;
  }
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
  const interception = getSupportedInterception(anchor.href);
  if (!interception) return;
  if ((settings?.interceptions?.[interception] ?? defaultContentInterceptions[interception]) !== true) return;
  if ('extension' in supportedContentInterceptions[interception]) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
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
