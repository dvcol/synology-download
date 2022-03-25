import { filter, fromEventPattern, Observable, Subscriber } from 'rxjs';

import { ChromeMessage, ChromeMessageHandler, ChromeMessagePayload, ChromeMessageType, ChromeResponse } from '@src/models';

import MessageSender = chrome.runtime.MessageSender;
import Port = chrome.runtime.Port;

/**
 * Rxjs wrapper for chrome.runtime.onMessage event listener
 * @param async if the listener waits for async response or not
 * @param types optional type filtering
 * @see chrome.runtime.onMessage
 */
export const onMessage = <M extends ChromeMessagePayload = ChromeMessagePayload, R = any>(
  types?: ChromeMessageType[],
  async = true
): Observable<ChromeMessageHandler<M, R>> =>
  fromEventPattern<ChromeMessageHandler<M, R>>(
    (handler) => {
      const wrapper = (message: ChromeMessage<M>, sender: MessageSender, sendResponse: (response?: ChromeResponse<R>) => void) => {
        handler({ message, sender, sendResponse });
        return async;
      };
      chrome.runtime.onMessage.addListener(wrapper);
      return wrapper;
    },
    (handler, wrapper) => chrome.runtime.onMessage.removeListener(wrapper)
  ).pipe(filter(({ message }) => !types?.length || !!types?.includes(message?.type)));

/**
 * Callback for response handling when sending messages wrapped in observables
 * @param subscriber the subscriber to notify
 */
const sendMessageCallback =
  <R>(subscriber: Subscriber<R>) =>
  (response: any) => {
    if (response?.success === false) {
      subscriber.error(response?.error);
    } else if (response?.success) {
      subscriber.next(response?.payload);
      subscriber.complete();
    } else {
      subscriber.next(response);
      subscriber.complete();
    }
  };

/**
 * Rxjs wrapper for chrome.runtime.sendMessage event sender
 * @param message the ChromeMessage to send
 * @see chrome.runtime.sendMessage
 */
export const sendMessage = <M extends ChromeMessagePayload = ChromeMessagePayload, R = void>(message: ChromeMessage<M>): Observable<R> =>
  new Observable<R>((subscriber) => chrome.runtime.sendMessage(message, sendMessageCallback<R>(subscriber)));

/**
 * Rxjs wrapper for chrome.tabs.sendMessage event sender
 * @param tabId the id of the target tab
 * @param message the ChromeMessage to send
 * @see chrome.tabs.sendMessage
 */
export const sendTabMessage = <M extends ChromeMessagePayload = ChromeMessagePayload, R = void>(
  tabId: number,
  message: ChromeMessage<M>
): Observable<R> => new Observable<R>((subscriber) => chrome.tabs.sendMessage(tabId, message, sendMessageCallback<R>(subscriber)));

/**
 * Rxjs wrapper for chrome.runtime.onConnect event listener
 * @param async if the listener waits for async response or not
 * @param types optional type filtering
 * @see chrome.runtime.onConnect
 */
export const onConnect = <T extends string>(types?: T[], async = true): Observable<Port> =>
  fromEventPattern<Port>(
    (handler) => {
      const wrapper = (port: Port) => {
        handler(port);
        return async;
      };
      chrome.runtime.onConnect.addListener(wrapper);
      return wrapper;
    },
    (handler, wrapper) => chrome.runtime.onConnect.removeListener(wrapper)
  ).pipe(filter(({ name }) => !types?.length || !!types?.map(String).includes(name)));

/** @see chrome.runtime.connect */
export const portConnect = chrome.runtime.connect;
