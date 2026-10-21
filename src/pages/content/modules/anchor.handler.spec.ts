import type { Subscription } from 'rxjs';

import type { ContentInterceptions } from '../../../models/settings.model';
import type { AnchorPayload, ClickPayload } from '../service/anchor.service';

import { defaultSettings } from '../../../models/settings.model';
import { setSettings } from '../../../store/actions/settings.action';
import { store } from '../../../store/store';
import { anchor$, lastClick$ } from '../service/anchor.service';
import { clickListener$ } from './anchor.handler';

vi.mock('../../../store/store-proxy', async () => {
  const { store: proxyStore } = await import('../../../store/store');
  return { storeProxy: proxyStore };
});

let subscriptions: Subscription[];
let receivedAnchor: ReturnType<typeof vi.fn<(payload: AnchorPayload) => void>>;
let receivedClick: ReturnType<typeof vi.fn<(payload: ClickPayload) => void>>;

function setInterception(intercept: boolean, interceptions?: Partial<ContentInterceptions>) {
  store.dispatch(setSettings({ ...defaultSettings, content: { intercept, interceptions } }));
}

/** Dispatch at the document boundary without executing jsdom's native navigation. */
function clickLink(href: string, options: MouseEventInit = {}, cancelled = false) {
  document.body.innerHTML = '<a><span>Download</span></a>';
  const anchor = document.querySelector('a')!;
  anchor.setAttribute('href', href);
  const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...options });
  Object.defineProperty(event, 'target', { value: anchor.firstElementChild });
  if (cancelled) event.preventDefault();
  document.dispatchEvent(event);
  return { anchor, event };
}

beforeEach(() => {
  receivedAnchor = vi.fn();
  receivedClick = vi.fn();
  setInterception(true, { torrent: true, nzb: true });
  subscriptions = [anchor$.subscribe(receivedAnchor), lastClick$.subscribe(receivedClick), clickListener$.subscribe()];
});

afterEach(() => {
  subscriptions.forEach(subscription => subscription.unsubscribe());
  document.body.innerHTML = '';
});

describe('anchor interception', () => {
  it.each([
    'https://example.com/file.torrent',
    'http://example.com/file.nzb',
    'https://example.com/FILE.TORRENT',
    'https://example.com/file.NZB?token=secret#download',
    '/downloads/file.torrent?token=secret',
  ])('intercepts an opted-in file link: %s', (href) => {
    expect.assertions(4);
    const { anchor, event } = clickLink(href);
    expect(event.defaultPrevented).toBe(true);
    expect(receivedAnchor).toHaveBeenCalledExactlyOnceWith({ event, anchor, form: { uri: anchor.href, source: document.URL } });
    expect(receivedClick).toHaveBeenCalledExactlyOnceWith({ event, anchor });
    expect(anchor.firstElementChild?.textContent).toBe('Download');
  });

  it.each([
    'https://example.com/file.zip',
    'https://example.com/download?file=test.torrent',
    'https://example.com/file.torrent/child',
    'ftp://example.com/file.torrent',
    'file:///file.nzb',
    'javascript:void(0)',
    'http://[',
    '',
  ])('leaves unsupported or malformed links alone: %s', (href) => {
    expect.assertions(2);
    const { event } = clickLink(href);
    expect(event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it.each([
    { intercept: true, interceptions: undefined },
    { intercept: true, interceptions: { torrent: false } },
    { intercept: false, interceptions: { torrent: true } },
    { intercept: false, interceptions: { torrent: false } },
  ])('respects the master switch and legacy file opt-out: $intercept/$interceptions', ({ intercept, interceptions }) => {
    expect.assertions(2);
    setInterception(intercept, interceptions);
    const { event } = clickLink('https://example.com/file.torrent');
    expect(event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const)('preserves %s file clicks', (modifier) => {
    expect.assertions(2);
    const { event } = clickLink('https://example.com/file.torrent', { [modifier]: true });
    expect(event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it.each([1, 2])('preserves mouse button %s', (button) => {
    expect.assertions(2);
    const { event } = clickLink('https://example.com/file.torrent', { button });
    expect(event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it('does not intercept a file click already cancelled by the page', () => {
    expect.assertions(2);
    const { event } = clickLink('https://example.com/file.torrent', {}, true);
    expect(event.defaultPrevented).toBe(true);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it.each(['magnet', 'thunder', 'flashget', 'qqdl', 'ed2k'])('preserves %s interception without file opt-in', (protocol) => {
    expect.assertions(2);
    setInterception(true);
    const { event } = clickLink(`${protocol}:download`);
    expect(event.defaultPrevented).toBe(true);
    expect(receivedAnchor).toHaveBeenCalledOnce();
  });

  it('preserves custom ed2k syntax that an HTTP-style URL parser rejects', () => {
    expect.assertions(2);
    setInterception(true);
    const { event, anchor } = clickLink('ed2k://|file|example.iso|1000|0123456789abcdef0123456789abcdef|/');
    expect(event.defaultPrevented).toBe(true);
    expect(receivedAnchor).toHaveBeenCalledExactlyOnceWith({ event, anchor, form: { uri: anchor.href, source: document.URL } });
  });

  it.each(['magnet', 'thunder', 'flashget', 'qqdl', 'ed2k'] as const)('opts out of %s independently', (protocol) => {
    expect.assertions(3);
    setInterception(true, { [protocol]: false, torrent: true });
    const { event } = clickLink(`${protocol}:download`);
    expect(event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
    clickLink('https://example.com/file.torrent');
    expect(receivedAnchor).toHaveBeenCalledOnce();
  });

  it.each([
    { interceptions: { torrent: true, nzb: false }, extension: 'torrent', intercepted: true },
    { interceptions: { torrent: true, nzb: false }, extension: 'nzb', intercepted: false },
    { interceptions: { torrent: false, nzb: true }, extension: 'torrent', intercepted: false },
    { interceptions: { torrent: false, nzb: true }, extension: 'nzb', intercepted: true },
  ])('selects each file extension independently: $extension/$intercepted', ({ interceptions, extension, intercepted }) => {
    expect.assertions(2);
    setInterception(true, interceptions);
    const { event } = clickLink(`https://example.com/file.${extension}`);
    expect(event.defaultPrevented).toBe(intercepted);
    expect(receivedAnchor).toHaveBeenCalledTimes(intercepted ? 1 : 0);
  });

  it('leaves unsupported protocols and extensions native even with unknown saved preferences', () => {
    expect.assertions(3);
    setInterception(true, { torrent: true, ...{ zip: true, ftp: true } });
    const unsupportedFile = clickLink('https://example.com/file.zip');
    const unsupportedProtocol = clickLink('ftp://example.com/file.torrent');
    expect(unsupportedFile.event.defaultPrevented).toBe(false);
    expect(unsupportedProtocol.event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it('disables protocol interception through the existing setting', () => {
    expect.assertions(2);
    setInterception(false, { torrent: true });
    const { event } = clickLink('magnet:download');
    expect(event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it('ignores targets without an anchor', () => {
    expect.assertions(2);
    const event = new MouseEvent('click', { cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(receivedAnchor).not.toHaveBeenCalled();
  });

  it('removes both event handlers and restores one subscription on resubscribe', () => {
    expect.assertions(4);
    subscriptions.pop()!.unsubscribe();
    clickLink('magnet:download');
    document.dispatchEvent(new MouseEvent('contextmenu', { button: 2 }));
    expect(receivedClick).not.toHaveBeenCalled();
    expect(receivedAnchor).not.toHaveBeenCalled();
    subscriptions.push(clickListener$.subscribe());
    clickLink('magnet:download');
    expect(receivedClick).toHaveBeenCalledOnce();
    expect(receivedAnchor).toHaveBeenCalledOnce();
  });
});
