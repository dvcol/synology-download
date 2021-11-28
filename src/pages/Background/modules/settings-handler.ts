import {
  defaultOptions,
  Polling,
  settingsKey,
  SettingsSlice,
} from '../../../models';
import {
  getPassword,
  getPolling,
  getUrl,
  getUsername,
  setNavbar,
  setTasks,
  store,
  syncSettings,
} from '../../../store';
import { buildContextMenu, synologyClient } from '../../../services';
import { BehaviorSubject, filter, map, tap, timer } from 'rxjs';

// test login
const testLogin = () => {
  // restore url
  const url = getUrl(store.getState());
  if (url) synologyClient.setBaseUrl(url);

  const username = getUsername(store.getState());
  const password = getPassword(store.getState());
  if (url && username && password) {
    synologyClient.login(username, password).subscribe({
      complete: () => {
        store.dispatch(syncSettings({ polling: { enabled: true } }));
        // TODO: Notification connection success
        console.info('Polling setting change success');
      },
      error: (err) => {
        store.dispatch(syncSettings({ polling: { enabled: false } }));
        console.error('Polling login failed', err);
      },
    });
  }
};

// start polling
const startPolling = () => {
  const polling$ = new BehaviorSubject<Polling>(getPolling(store.getState()));
  store.subscribe(() => polling$.next(getPolling(store.getState())));
  timer(0, 5000)
    .pipe(
      map(() => polling$.getValue()),
      filter((polling: Polling) => polling.enabled),
      tap(console.log)
    )
    .subscribe(() =>
      synologyClient
        .listTasks()
        .subscribe((res) => store.dispatch(setTasks(res?.data?.tasks)))
    );
};

// Restore settings
export const restoreSettings = () =>
  chrome.storage.sync.get(settingsKey, ({ settings }) => {
    const parsed: SettingsSlice = JSON.parse(settings || '{}');
    // restore settings
    store.dispatch(syncSettings(parsed));
    // reset tab
    if (parsed?.tabs?.length) {
      store.dispatch(setNavbar(parsed?.tabs[0]));
    }
    // Build context menu if exist
    buildContextMenu(parsed?.menus || defaultOptions.menus);

    // test restored login
    testLogin();

    // Start polling
    startPolling();
  });
