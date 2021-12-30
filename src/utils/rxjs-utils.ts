import {
  buffer,
  debounceTime,
  elementAt,
  filter,
  fromEventPattern,
  Observable,
  OperatorFunction,
  race,
  repeat,
  repeatWhen,
  skipWhile,
  takeUntil,
} from 'rxjs';
import { ChromeMessage, ChromeMessageHandler, ChromeMessagePayload, ChromeMessageType, ChromeResponse } from '../models';
import MessageSender = chrome.runtime.MessageSender;

/**
 * Type signature for the rxjs operator that start emitting when skip condition is falsy, keeps emitting until stop$ emits and restart emitting if start$ emits.
 * @param skip a boolean function
 * @param stop$ a stream notifier
 * @param start$ a stream notifier
 */
export type SkipUntilRepeat = <T>(
  skip: (value: T, index: number) => boolean,
  stop$: Observable<unknown>,
  start$: Observable<unknown>
) => OperatorFunction<T, T>;

/**
 * Rxjs operator that start emitting when skip condition is falsy, keeps emitting until stop$ emits and restart emitting if start$ emits.
 * @param skip a boolean function
 * @param stop$ a stream notifier
 * @param start$ a stream notifier
 */
export const skipUntilRepeat: SkipUntilRepeat = (skip, stop$, start$) => (source$) =>
  source$.pipe(
    skipWhile(skip),
    takeUntil(stop$),
    repeatWhen(() => start$)
  );

/**
 * Type signature for the rxjs operator function that buffer source observable until debounce condition is reached or buffer size reach limit
 * @param debounce time in ms before emitting
 * @param limit number of emission to buffer
 */
export type BufferDebounceUnless = <T>(debounce: number, limit: number) => OperatorFunction<T, T[]>;

/**
 * Rxjs operator function that buffer source observable until debounce condition is reached or buffer size reach limit
 * @param debounce time in ms before emitting
 * @param limit number of emission to buffer
 */
export const bufferDebounceUnless: BufferDebounceUnless = (debounce, limit) => (source$) =>
  new Observable((observer) =>
    source$
      .pipe(
        // Buffer elements from source$
        buffer(
          // Emit from buffer when first complete
          race(
            // Emits 1 time and complete if debounce time reached without events
            source$.pipe(debounceTime(debounce)),
            // Emits 1 time and complete if source emits limit's times
            source$.pipe(elementAt(limit - 1)).pipe(
              // Repeat the race
              repeat()
            )
          )
        )
      )
      .subscribe({
        next: (x) => observer.next(x),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      })
  );

/**
 * Rxjs wrapper for chrome.runtime.onMessage event listener
 * @param async if the listener waits for async response or not
 * @param types optional type filtering
 */
export const onMessage = <M = ChromeMessagePayload, R = any>(types?: ChromeMessageType[], async = false): Observable<ChromeMessageHandler<M, R>> =>
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
 * Rxjs wrapper for chrome.runtime.sendMessage event sender
 * @param message the ChromeMessage to send
 */
export const sendMessage = <M = ChromeMessagePayload, R = void>(message: ChromeMessage<M>): Observable<R> =>
  new Observable<R>((subscriber) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (response?.success === false) {
        subscriber.error(response?.error);
      } else if (response?.success) {
        subscriber.next(response?.payload);
        subscriber.complete();
      } else {
        subscriber.next(response);
        subscriber.complete();
      }
    });
  });

/**
 * Rxjs wrapper for chrome.tabs.sendMessage event sender
 * @param tabId the id of the target tab
 * @param message the ChromeMessage to send
 */
export const sendTabMessage = <M = ChromeMessagePayload, R = void>(tabId: number, message: ChromeMessage<M>): Observable<R> =>
  new Observable<R>((subscriber) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (response?.success === false) {
        subscriber.error(response?.error);
      } else if (response?.success) {
        subscriber.next(response?.payload);
        subscriber.complete();
      } else {
        subscriber.next(response);
        subscriber.complete();
      }
    });
  });
