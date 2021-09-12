import {Link} from "react-router-dom";
import React from 'react';
import {AppBar, Tabs, Toolbar,} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {NavbarState, set} from "../../services/slices/navbar.slice";
import NavbarTab from "../navbar-tab/navbar-tab";
import NavbarMenu from "../navbar-menu/navbar-menu";
import MenuIcon from '@mui/icons-material/Menu';
import {SettingsState} from "../../services/slices/settings.slice";

const Navbar = () => {
    const dispatch = useDispatch();

    const tabs = useSelector((state: SettingsState) => state.settings.tabs);
    const tab = useSelector((state: NavbarState) => state.navbar.tab);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        console.log(tab, newValue)
        return dispatch(set(newValue))
    };

    const tabComponents = tabs?.map((taskTab, i) => (<NavbarTab value={taskTab} index={i} component={Link} to="/"/>))
    return (
        <AppBar color="inherit" position="sticky" sx={{padding: '0 0.5rem'}}>
            <Toolbar disableGutters={true} sx={{justifyContent: "space-between"}}>
                {JSON.stringify(tab)}
                {JSON.stringify(tabs[0])}
                <Tabs
                    aria-label="download filtered tabs"
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    onChange={handleChange}
                    value={tab}
                    sx={{minHeight: 64, height: '100%'}}
                >
                    {tabComponents}
                </Tabs>
                <NavbarMenu label={<MenuIcon/>}/>
            </Toolbar>
        </AppBar>
    )
}

export default Navbar;
