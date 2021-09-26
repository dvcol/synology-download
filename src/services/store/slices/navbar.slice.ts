import {combineReducers, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {TaskTab} from "../../../models/tab.model";
import {NavbarSlice} from "../../../models/navbar.model";

const initialState: NavbarSlice = {tab: undefined};

export const navbarSlice = createSlice({
    name: 'navbar',
    initialState,
    reducers: {
        set: (state, action: PayloadAction<TaskTab | undefined>) => ({...state, tab: action?.payload}),
        reset: () => (initialState)
    }
})

// Action creators are generated for each case reducer function
export const {set, reset} = navbarSlice.actions


const rootReducer = combineReducers({
    navbar: navbarSlice.reducer
});

export type NavbarState = ReturnType<typeof rootReducer>;

export default navbarSlice.reducer

