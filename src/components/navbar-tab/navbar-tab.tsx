import React from 'react';
import {Badge, BadgeProps, styled, Tab} from "@mui/material";
import {TabType, tabTypeToColor} from "../../models/navbar.model";

type NavbarTabProps = { value: TabType, index: number }

const NavbarTab = ({value, index, ...props}: NavbarTabProps) => {
    const a11yProps = (type: TabType) => ({id: `simple-tab-${type}`, 'aria-controls': `simple-tabpanel-${type}`})
    const StyledBadge = styled(Badge)<BadgeProps>(() => ({'& .MuiBadge-badge': {right: -5}}));
    return (
        <Tab
            {...props}
            label={
                <StyledBadge
                    sx={{padding: '0 0.5rem'}}
                    badgeContent={index + 1}
                    color={tabTypeToColor(value)}
                >
                    {value}
                </StyledBadge>
            }
            {...a11yProps(value)}
            value={value}/>
    )
}

export default NavbarTab;