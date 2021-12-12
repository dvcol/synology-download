import { buffer, debounceTime, elementAt, Observable, OperatorFunction, race, repeat, repeatWhen, skipWhile, takeUntil } from 'rxjs';

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

export type BufferStopStart = <T>(
  debounce: number,
  limit: number,
  skip: (value: T, index: number) => boolean,
  stop$: Observable<unknown>,
  start$: Observable<unknown>
) => OperatorFunction<T, T[]>;
