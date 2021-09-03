const LEFT_MOUSE_BUTTON = 0;

const DOWNLOAD_ONLY_PROTOCOLS = ['magnet', 'thunder', 'flashget', 'qqdl', 'ed2k'];

function startsWithAnyProtocol(
  url: string,
  protocols: string | string[]
): boolean {
  if (typeof protocols === 'string') {
    return url.startsWith(`${protocols}:`);
  } else {
    return protocols.some((protocol) => url.startsWith(`${protocol}:`));
  }
}

function recursivelyFindAnchorAncestor(
  e: HTMLElement | null,
  depth: number = 10,
): HTMLAnchorElement | undefined {
  if (e == null) {
    return undefined;
  } else if (e instanceof HTMLAnchorElement) {
    return e;
  } else if (depth === 0) {
    return undefined;
  } else {
    return recursivelyFindAnchorAncestor(e.parentElement, depth - 1);
  }
}

// I hate this implementation. True protocol handling for extensions does not exist.
// https://bugzilla.mozilla.org/show_bug.cgi?id=1271553
document.addEventListener('click', (e: MouseEvent) => {
  if (e.button === LEFT_MOUSE_BUTTON) {
    const anchor = recursivelyFindAnchorAncestor(e.target as HTMLElement);
    if (
      anchor != null &&
      anchor.href
      &&
      startsWithAnyProtocol(anchor.href, DOWNLOAD_ONLY_PROTOCOLS)
    ) {
      console.log(anchor.href);
      e.preventDefault();
    }
  }
});
