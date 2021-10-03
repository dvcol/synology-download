import {ChromeMessageType} from "../models/message.model";
import {defaultOptions, Polling, settingsKey, SettingsSlice} from "../models/settings.model";
import {sync} from "../services/store/slices/settings.slice";
import {set} from "../services/store/slices/navbar.slice";
import {buildContextMenu, createContextMenu, removeContextMenu} from "../services/context-menu/context-menu.service";
import {BehaviorSubject, filter, interval, map, tap, timer} from "rxjs";
import {synologyClient} from "../services/http/synology-client.service";
import {TaskListOption} from "../models/task.model";
import {setTasks} from "../services/store/slices/tasks.slice";
import {getPassword, getPolling, getUrl, getUsername} from "../services/store/selectors/settings.selector";
import {initStore} from "../services/store/store.config";

export {}

console.log('Background script');

// Declared in background for persistance
export const store = initStore();

// Restore settings
chrome.storage.sync.get(settingsKey, ({settings}) => {
        const parsed: SettingsSlice = JSON.parse(settings || "{}")
        // restore settings
        store.dispatch(sync(parsed));
        // reset tab
        if (parsed?.tabs?.length) {
            store.dispatch(set(parsed?.tabs[0]))
        }
        // Build context menu if exist
        buildContextMenu(parsed?.menus || defaultOptions.menus);

        // restore url
        const url = getUrl(store.getState());
        if (url) synologyClient.setBaseUrl(url)

        // test restored login
        const username = getUsername(store.getState())
        const password = getPassword(store.getState())
        if (url && username && password) {
            synologyClient.login(username, password).subscribe({
                complete: () => {
                    store.dispatch(sync({polling: {enabled: true}}))
                    // TODO: Notification connection success
                    console.info('Polling setting change success');
                },
                error: () => {
                    store.dispatch(sync({polling: {enabled: false}}))
                    console.error('Polling login failed')
                }
            });
        }


        // Start polling
        let polling$ = new BehaviorSubject<Polling>(getPolling(store.getState()));
        store.subscribe(() => polling$.next(getPolling(store.getState())))
        timer(0,5000)
            .pipe(
                map(() => polling$.getValue()),
                filter((polling: Polling) => polling.enabled),
                tap(console.log),
            )
            .subscribe(() => synologyClient
                .listTasks()
                .subscribe((res) => store.dispatch(setTasks(res?.data?.tasks))
                )
            )
    }
);


// On message from chrome handle payload
chrome.runtime.onMessage.addListener((request: any) => {
    console.log(request)
    if (request.type === ChromeMessageType.link) {
        console.log(request.payload);
    } else if (request.type === ChromeMessageType.addMenu) {
        console.log('message addMenu', request);
        createContextMenu(request.payload)
    } else if (request.type === ChromeMessageType.removeMenu) {
        console.log('message removeMenu', request);
        removeContextMenu(request.payload)
    }
});

