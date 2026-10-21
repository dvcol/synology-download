import type { Subscription } from 'rxjs';

import type { StoreOrProxy } from '../../../models/store.model';

import { catchError, concatMap, defer, distinctUntilChanged, EMPTY, from, map, switchMap } from 'rxjs';

import { LoggerService } from '../../../services/logger/logger.service';
import { getPolling } from '../../../store/selectors/settings.selector';
import { store$ } from '../../../utils/rxjs.utils';

const POLLING_RECOVERY_ALARM = 'synology-download-polling-recovery';
let pollingAlarmSubscription: Subscription | undefined;

function onPollingAlarm(alarm: chrome.alarms.Alarm) {
  if (alarm.name !== POLLING_RECOVERY_ALARM) return;
  LoggerService.debug('Background polling recovery alarm fired.');
}

/** Register before asynchronous startup so Chrome can wake a suspended worker. */
export function registerPollingAlarm(): void {
  if (!chrome.alarms || chrome.alarms.onAlarm.hasListener(onPollingAlarm)) return;
  chrome.alarms.onAlarm.addListener(onPollingAlarm);
}

/** Recover enabled background polling without keeping an idle worker permanently resident. */
export function watchPollingAlarm(store: StoreOrProxy): Subscription {
  pollingAlarmSubscription?.unsubscribe();
  const alarms = chrome.alarms;
  if (!alarms) return EMPTY.subscribe();

  pollingAlarmSubscription = store$(store, getPolling).pipe(
    map(polling => polling.enabled && !!polling.background?.enabled),
    distinctUntilChanged(),
    concatMap(enabled => defer(async () => alarms.get(POLLING_RECOVERY_ALARM)).pipe(
      switchMap((alarm) => {
        if (!enabled) {
          if (!alarm) return EMPTY;
          return from(alarms.clear(POLLING_RECOVERY_ALARM));
        }
        if (alarm?.periodInMinutes === 1) return EMPTY;
        return from(Promise.resolve(alarms.create(POLLING_RECOVERY_ALARM, { periodInMinutes: 1 })));
      }),
      catchError((error: unknown) => {
        LoggerService.error('Failed to reconcile background polling recovery alarm.', error);
        return EMPTY;
      }),
    )),
  ).subscribe();
  return pollingAlarmSubscription;
}
