import {createSelector} from "@reduxjs/toolkit";
import {SettingsState} from "../slices/settings.slice";

export const getSettings = createSelector(
    (state: SettingsState) => state,
    (state) => state.settings
)

export const getTabs = createSelector(getSettings,
    (state) => state.tabs
)

export const getConnection = createSelector(
    (state: SettingsState) => state,
    (state) => state.settings.connection
)

export const getUrl = createSelector(getConnection,
    (state) => {
        if (state.protocol && state.path && state.port) {
            return new URL(`${state.protocol}://${state.path}:${state.port}`).toString()
        }
        return undefined
    }
)

export const getUsername = createSelector(
    (state: SettingsState) => state,
    (state) => state.settings.connection.username
)

export const getPassword = createSelector(
    (state: SettingsState) => state,
    (state) => state.settings.connection.password
)

export const getPolling = createSelector(
    (state: SettingsState) => state,
    (state) => state.settings.polling
)
