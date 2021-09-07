import MessageSender = chrome.runtime.MessageSender;

export {}

chrome.contextMenus.create({
    enabled: true,
    id:"open",
    title: 'Download with Synology Diskstation',
    contexts: ['link', 'audio', 'video', 'image', 'selection'],
    onclick: () =>
        window.open('index.html', 'extension_popup', 'width=300,height=400,status=no,scrollbars=yes,resizable=no')
});

chrome.runtime.onMessage.addListener((request: any, sender: MessageSender, sendResponse: any) => console.log(request, sender, sendResponse));


