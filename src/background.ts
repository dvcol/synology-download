chrome.contextMenus.create({
  enabled: true,
  title: 'Download with Synology Diskstation',
  contexts: ['link', 'audio', 'video', 'image', 'selection'],
  onclick: (data) =>
    window.open('index.html', 'extension_popup', 'width=300,height=400,status=no,scrollbars=yes,resizable=no')
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => console.log(request, sender, sendResponse));
