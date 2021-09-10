import React from 'react';
import {AppBar, Box, Tabs, Toolbar,} from "@mui/material";
import {TabType} from "../../models/navbar.model";
import {useDispatch, useSelector} from "react-redux";
import {NavbarState, set} from "../../services/slices/navbar.slice";
import NavbarTab from "../navbar-tab/navbar-tab";
import NavbarMenu from "../navbar-menu/navbar-menu";
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
    const dispatch = useDispatch();

    const tabType = useSelector((state: NavbarState) => state.navbar.tabType);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => dispatch(set(newValue));

    const tabs = Object.values(TabType).map((type, i) => (<NavbarTab value={type} index={i}/>))
    return (
        <Box>
            <AppBar color="inherit" position="sticky" sx={{padding: '0 0.5rem'}}>
                <Toolbar disableGutters={true}>
                    <Tabs
                        aria-label="download filtered tabs"
                        textColor="primary"
                        indicatorColor="primary"
                        onChange={handleChange}
                        value={tabType}
                    >
                        {tabs}
                    </Tabs>
                    <NavbarMenu label={<MenuIcon/>}/>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Navbar;
