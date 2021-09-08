import React from 'react';
import './navbar.scss';
import {AppBar, Badge, BadgeProps, Box, IconButton, styled, Tab, Tabs, Toolbar,} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import {TabType} from "../../models/navbar.model";
import {useDispatch, useSelector} from "react-redux";
import {NavbarState, set} from "../../services/slices/navbar.slice";

const Navbar = () => {
    const dispatch = useDispatch();

    const value = useSelector((state: NavbarState) => {
        console.log(state);
        return state.navbar.value;
    });

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        console.log(event, newValue);
        dispatch(set(newValue))
    };
    const a11yProps = (index: number) => ({id: `simple-tab-${index}`, 'aria-controls': `simple-tabpanel-${index}`})

    const StyledBadge = styled(Badge)<BadgeProps>(() => ({'& .MuiBadge-badge': {right: -5}}));
    const badgeColor = (tab: TabType) => tab === TabType.finished ? 'success' : 'primary'

    const tabs = Object.values(TabType).map((type, i) => (
        <Tab label={
            <StyledBadge sx={{padding: '0 0.5rem'}} badgeContent={i + 1} color={badgeColor(type)}>
                {type}
            </StyledBadge>
        } {...a11yProps(i)} value={type}/>
    ))
    return (
        <Box>
            <AppBar color="inherit" position="static">
                <Toolbar disableGutters={true} sx={{marginLeft: '16px'}}>
                    <Tabs
                        sx={{paddingRight: '2rem'}}
                        value={value}
                        textColor="primary"
                        indicatorColor="primary"
                        onChange={handleChange}
                        aria-label="download filtered tabs"
                    >
                        {tabs}
                    </Tabs>
                    <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        aria-label="open drawer"
                        sx={{mr: 2}}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    )
}

export default Navbar;
