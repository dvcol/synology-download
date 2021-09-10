import {combineReducers, createSlice} from '@reduxjs/toolkit'
import {TabType} from "../../models/navbar.model";


export const navbarSlice = createSlice({
    name: 'navbar',
    initialState: {
        tabType: TabType.all,
    },
    reducers: {
        set: ({tabType}, {payload}) => ({tabType: payload}),
        reset: () => ({tabType: TabType.all})
    }
})

// Action creators are generated for each case reducer function
export const {set, reset} = navbarSlice.actions


const rootReducer = combineReducers({
    navbar: navbarSlice.reducer
});

export type NavbarState = ReturnType<typeof rootReducer>;

export default navbarSlice.reducer