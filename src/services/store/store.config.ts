import {configureStore} from "@reduxjs/toolkit";
import {navbarSlice} from "./slices/navbar.slice";
import {settingsSlice} from "./slices/settings.slice";
import {tasksSlice} from "./slices/tasks.slice";

export const initStore = () => configureStore({
    reducer: {
        navbar: navbarSlice.reducer,
        settings: settingsSlice.reducer,
        tasks: tasksSlice.reducer
    },
    devTools: true
});
