import {ChromeMessage, ChromeMessageType} from "../models/message.model";
import {open} from "../services/modal/modal.service";

export {}
/**
 * List of supported protocols
 */
const DOWNLOAD_ONLY_PROTOCOLS = ['magnet', 'thunder', 'flashget', 'qqdl', 'ed2k'];

/**
 * Check if the url starts with the given protocol(s)
 * @param url the url to test
 * @param protocols the protocol(s)
 */
function startsWithAnyProtocol(
    url: string,
    protocols: string | string[]
) {
    if (typeof protocols === 'string') {
        return url.startsWith(`${protocols}:`);
    } else {
        return protocols.some((protocol) => url.startsWith(`${protocol}:`));
    }
}

/**
 * Finds the HTMLAnchorElement in the e element's parent tree with the given tree depth
 * @param e the element
 * @param depth the tree depth
 */
function recursivelyFindAnchorAncestor(
    e: HTMLElement | null,
    depth: number = 10
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

// Inspired by https://github.com/seansfkelley/nas-download-manager/blob/master/src/content/index.ts
// Detect if the click event is on a supported downloadable link
document.addEventListener('click', (e) => {
    // Left clicks only
    if (e.button === 0) {
        const anchor = recursivelyFindAnchorAncestor(e.target as HTMLElement);
        if (
            anchor != null &&
            anchor.href
            &&
            startsWithAnyProtocol(anchor.href, DOWNLOAD_ONLY_PROTOCOLS)
        ) {
            chrome.runtime.sendMessage({
                type: ChromeMessageType.link,
                payload: anchor.href
            } as ChromeMessage, () => console.log('sent'));
            e.preventDefault();
        }
    }
});


// Listen to popup triggers coming from background
chrome.runtime.onMessage.addListener((request: ChromeMessage) => {
    console.log(request)
    if (request.type === ChromeMessageType.popup) {
        open();
    }
});

