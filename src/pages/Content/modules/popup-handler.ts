import { ChromeMessage, ChromeMessageType } from '../../../models';

// Listen to popup triggers coming from background
export const addPopupListener = () =>
  chrome.runtime.onMessage.addListener(async (request: ChromeMessage) => {
    console.log(request);
    if (request.type === ChromeMessageType.popup) {
      // TODO open modal
    }
  });
