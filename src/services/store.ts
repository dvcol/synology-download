import {configureStore} from '@reduxjs/toolkit'
import {navbarSlice} from "./slices/navbar.slice";

export default configureStore({
    reducer: {
        navbar: navbarSlice.reducer
    },
})