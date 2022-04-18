import type { ChromeMessage, ChromeMessageHandler } from '@dvcol/web-extension-utils';
import {
  onConnect as _onConnect,
  onMessage as _onMessage,
  sendMessage as _sendMessage,
  sendTabMessage as _sendTabMessage,
} from '@dvcol/web-extension-utils';

import type { ChromeMessagePayload, ChromeMessageType } from '@src/models';

import type { Observable } from 'rxjs';

import Port = chrome.runtime.Port;

/**
 * Rxjs wrapper for chrome.runtime.onMessage event listener
 * @param async if the listener waits for async response or not
 * @param types optional type filtering
 * @see chrome.runtime.onMessage
 */
export const onMessage = <P extends ChromeMessagePayload = ChromeMessagePayload, R = any>(
  types?: ChromeMessageType[],
  async = true,
): Observable<ChromeMessageHandler<ChromeMessageType, P, R>> => _onMessage<ChromeMessageType, P>(types, async);

/**
 * Rxjs wrapper for chrome.runtime.sendMessage event sender
 * @param message the ChromeMessage to send
 * @see chrome.runtime.sendMessage
 */
export const sendMessage = <P extends ChromeMessagePayload = ChromeMessagePayload, R = void>(
  message: ChromeMessage<ChromeMessageType, P>,
): Observable<R> => _sendMessage<ChromeMessageType, P, R>(message);

/**
 * Rxjs wrapper for chrome.tabs.sendMessage event sender
 * @param tabId the id of the target tab
 * @param message the ChromeMessage to send
 * @see chrome.tabs.sendMessage
 */
export const sendTabMessage = <P extends ChromeMessagePayload = ChromeMessagePayload, R = void>(
  tabId: number,
  message: ChromeMessage<ChromeMessageType, P>,
): Observable<R> => _sendTabMessage<ChromeMessageType, P, R>(tabId, message);
/**
 * Rxjs wrapper for chrome.runtime.onConnect event listener
 * @param async if the listener waits for async response or not
 * @param types optional type filtering
 * @see chrome.runtime.onConnect
 */
export const onConnect = <T extends string>(types?: T[], async = true): Observable<Port> => _onConnect<T>(types, async);

/** @see chrome.runtime.connect */
export const portConnect = chrome.runtime.connect;
