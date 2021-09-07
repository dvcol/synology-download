import MessageSender = chrome.runtime.MessageSender;

export {}

// Add the context menu
chrome.contextMenus.create({
    enabled: true,
    id: "open",
    title: 'Download with Synology Diskstation',
    contexts: ['link', 'audio', 'video', 'image', 'selection'],
    onclick: () => {
        // On click instruct content.ts to open the modal
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            if (tabs[0].id !== undefined) chrome.tabs.sendMessage(tabs[0].id, {type: "popup"});
        });
    }
});

// On message from content.ts handle link
chrome.runtime.onMessage.addListener((request: any, sender: MessageSender, sendResponse: any) => {
    console.log(request, sender, sendResponse)
    if (request.type === "link") {
        console.log(request.url);
    }
});


