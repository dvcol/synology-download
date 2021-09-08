import {combineReducers, createSlice} from '@reduxjs/toolkit'
import {TabType} from "../../models/navbar.model";


export const navbarSlice = createSlice({
    name: 'navbar',
    initialState: {
        value: TabType.all,
    },
    reducers: {
        set: ({value}, {payload}) => ({value: payload}),
        reset: () => ({value: TabType.all})
    }
})

// Action creators are generated for each case reducer function
export const {set, reset} = navbarSlice.actions


const rootReducer = combineReducers({
    navbar: navbarSlice.reducer
});

export type NavbarState = ReturnType<typeof rootReducer>;

export default navbarSlice.reducer