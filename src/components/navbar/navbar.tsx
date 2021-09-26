import {Link} from "react-router-dom";
import React from 'react';
import {AppBar, Tabs, Toolbar,} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {set} from "../../services/store/slices/navbar.slice";
import {setStatuses} from "../../services/store/slices/tasks.slice";
import NavbarTab from "../navbar-tab/navbar-tab";
import NavbarMenu from "../navbar-menu/navbar-menu";
import MenuIcon from '@mui/icons-material/Menu';
import {getTab} from "../../services/store/selectors/navbar.selector";
import {getTabs} from "../../services/store/selectors/settings.selector";

const Navbar = () => {
    const dispatch = useDispatch();

    const tabs = useSelector(getTabs);
    const tab = useSelector(getTab);

    const handleChange = (event: React.SyntheticEvent, index: number): void => {
        const newTab = tabs?.length > index ? tabs[index] : undefined;
        dispatch(set(newTab))
        dispatch(setStatuses(newTab?.status || []))
    };

    const getValue = (): number => tabs?.findIndex(t => t.id === tab?.id) ?? -1

    const tabComponents = tabs?.map((taskTab) => (<NavbarTab tab={taskTab} component={Link} to="/"/>))
    return (
        <AppBar color="inherit" position="sticky" sx={{padding: '0 0.5rem'}}>
            <Toolbar disableGutters={true} sx={{justifyContent: "space-between"}}>
                <Tabs
                    aria-label="download filtered tabs"
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    onChange={handleChange}
                    value={getValue()}
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
