import {combineReducers, createSlice} from '@reduxjs/toolkit'
import {defaultTabs} from "../../models/tab.model";

export const navbarSlice = createSlice({
    name: 'navbar',
    initialState: {
        tab: defaultTabs[0],
    },
    reducers: {
        set: ({tab}, {payload}) => {
            console.log(tab, payload);
            return {tab: payload}
        },
        reset: () => ({tab: defaultTabs[0]})
    }
})

// Action creators are generated for each case reducer function
export const {set, reset} = navbarSlice.actions


const rootReducer = combineReducers({
    navbar: navbarSlice.reducer
});

export type NavbarState = ReturnType<typeof rootReducer>;

export default navbarSlice.reducer
