import {createSelector} from "@reduxjs/toolkit";
import {NavbarState} from "../slices/navbar.slice";

export const getTab = createSelector(
    (state: NavbarState) => state,
    (state) => state.navbar.tab
)
