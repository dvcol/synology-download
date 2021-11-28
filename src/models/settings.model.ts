import {defaultTabs, TaskTab} from "./tab.model";
import {ContextMenuOption, defaultMenu} from "./context-menu.model";

export const settingsKey = 'settings';

export enum SettingHeader {
    connection = 'connection',
    interface = 'interface',
    notification = 'notification'
}

export interface Connection {
    protocol?: string,
    path?: string,
    port?: number,
    username?: string,
    password?: string
}

export interface Polling {
    enabled: boolean,
    // 0 means disabled
    background?: number,
    // 0 means disabled
    popup?: number
}

export interface SettingsSlice {
    connection: Connection,
    polling: Polling
    tabs: TaskTab[],
    menus: ContextMenuOption[]
}

export const defaultOptions: SettingsSlice = {
    connection: {protocol: 'http'},
    polling: {enabled: false, background: 60000, popup: 5000},
    tabs: defaultTabs,
    menus: [defaultMenu]
}
