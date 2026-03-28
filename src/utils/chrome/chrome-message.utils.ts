import type { Observable } from 'rxjs';

import type { ChromeMessagePayload, ChromeMessageType } from '../../models/message.model';
import type { ChromeMessage, ChromeMessageHandler } from '../webex.utils';
import type { InstalledDetails } from './chrome-download.utils';

import { onConnect as _onConnect, onInstalled$ as _onInstalled$, onMessage as _onMessage, portConnect as _portConnect, sendActiveTabMessage as _sendActiveTabMessage, sendMessage as _sendMessage, sendTabMessage as _sendTabMessage } from '@dvcol/web-extension-utils';

import { LoggerService } from '../../services/logger/logger.service';

import Port = chrome.runtime.Port;

/**
 * Rxjs wrapper for chrome.runtime.onMessage event listener
 * @param types optional type filtering
 * @param async if the listener waits for async response or not
 * @see chrome.runtime.onMessage
 */
export function onMessage<P extends ChromeMessagePayload = ChromeMessagePayload, R = any>(types?: ChromeMessageType[], async = true): Observable<ChromeMessageHandler<ChromeMessageType, P, R>> {
  return _onMessage<ChromeMessageType, P>(types, async);
}

/**
 * Rxjs wrapper for chrome.runtime.sendMessage event sender
 * @param message the ChromeMessage to send
 * @see chrome.runtime.sendMessage
 */
export function sendMessage<P extends ChromeMessagePayload = ChromeMessagePayload, R = void>(message: ChromeMessage<ChromeMessageType, P>): Observable<R> {
  LoggerService.debug(`Sending '${message.type}' message`, message);
  return _sendMessage<ChromeMessageType, P, R>(message);
}

/**
 * Rxjs wrapper for chrome.tabs.sendMessage event sender
 * @param tabId the id of the target tab
 * @param message the ChromeMessage to send
 * @see chrome.tabs.sendMessage
 */
export function sendTabMessage<P extends ChromeMessagePayload = ChromeMessagePayload, R = void>(tabId: number, message: ChromeMessage<ChromeMessageType, P>): Observable<R> {
  LoggerService.debug(`Sending '${message.type}' message to active tab '${tabId}'`, { message, tabId });
  return _sendTabMessage<ChromeMessageType, P, R>(tabId, message);
}

/**
 * Rxjs wrapper for chrome.tabs.sendMessage event sender and chrome.tabs.query
 * @param message the ChromeMessage to send
 * @see chrome.tabs.sendMessage
 * @see chrome.tabs.sendMessage
 */
export function sendActiveTabMessage<P extends ChromeMessagePayload = ChromeMessagePayload, R = void>(message: ChromeMessage<ChromeMessageType, P>): Observable<R> {
  return _sendActiveTabMessage(message);
}

/**
 * Rxjs wrapper for chrome.runtime.onConnect event listener
 * @param types optional type filtering
 * @param async if the listener waits for async response or not
 * @see chrome.runtime.onConnect
 */
export const onConnect = <T extends string>(types?: T[], async = true): Observable<Port> => _onConnect<T>(types, async);

/** @see chrome.runtime.connect */
export const portConnect = _portConnect;

export const onInstalled$: Observable<InstalledDetails> = _onInstalled$;
