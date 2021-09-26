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

export interface SettingsSlice {
    connection: Connection,
    tabs: TaskTab[],
    menus: ContextMenuOption[]
}

export const defaultOptions: SettingsSlice = {
    connection: {protocol: 'http'},
    tabs: defaultTabs,
    menus: [defaultMenu]
}
