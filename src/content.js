const LEFT_MOUSE_BUTTON = 0;
const DOWNLOAD_ONLY_PROTOCOLS = ['magnet', 'thunder', 'flashget', 'qqdl', 'ed2k'];

function startsWithAnyProtocol(
    url,
    protocols
) {
    if (typeof protocols === 'string') {
        return url.startsWith(`${protocols}:`);
    } else {
        return protocols.some((protocol) => url.startsWith(`${protocol}:`));
    }
}

function recursivelyFindAnchorAncestor(
    e,
    depth = 10,
) {
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
document.addEventListener('click', (e) => {
    if (e.button === LEFT_MOUSE_BUTTON) {
        const anchor = recursivelyFindAnchorAncestor(e.target);
        if (
            anchor != null &&
            anchor.href
            &&
            startsWithAnyProtocol(anchor.href, DOWNLOAD_ONLY_PROTOCOLS)
        ) {
            chrome.runtime.sendMessage({type: "link", url: anchor.href}, () => console.log('sent'));
            e.preventDefault();
        }
    }
});

