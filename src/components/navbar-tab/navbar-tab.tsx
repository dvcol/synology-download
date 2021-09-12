import React from 'react';
import {Badge, BadgeProps, styled, Tab} from "@mui/material";
import {TabType, TaskTab} from "../../models/tab.model";
import {ColorLevel} from "../../models/material-ui.model";

type NavbarTabProps = { value: TaskTab, index: number, [key: string]: any }

const NavbarTab = ({value, index, ...props}: NavbarTabProps) => {
    const a11yProps = (name: TabType | string) => ({id: `simple-tab-${name}`, 'aria-controls': `simple-tabpanel-${name}`})
    const StyledBadge = styled(Badge)<BadgeProps>(() => ({'& .MuiBadge-badge': {right: -5}}));
    return (
        <Tab
            {...props}
            label={
                <StyledBadge
                    sx={{padding: '0 0.5rem'}}
                    badgeContent={index + 1}
                    color={value.color || ColorLevel.info}
                >
                    {value?.name}
                </StyledBadge>
            }
            {...a11yProps(value?.name)}
            value={value}
        />
    )
}

export default NavbarTab;
