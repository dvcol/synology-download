import React from 'react';
import {Badge, BadgeProps, styled, Tab} from "@mui/material";
import {TabType, TaskTab} from "../../models/tab.model";
import {ColorLevel} from "../../models/material-ui.model";
import {useSelector} from "react-redux";
import {getCountByStatus} from "../../services/store/selectors/tasks.selector";

type NavbarTabProps = { tab: TaskTab, [key: string]: any }

const NavbarTab = ({tab, ...props}: NavbarTabProps) => {
    const countByStatus = useSelector(getCountByStatus);
    const count = tab?.status?.reduce((acc, status) => acc + countByStatus[status] , 0) ?? countByStatus?.total

    const a11yProps = (name: TabType | string) => ({
        id: `simple-tab-${name}`,
        'aria-controls': `simple-tabpanel-${name}`
    })
    const StyledBadge = styled(Badge)<BadgeProps>(() => ({'& .MuiBadge-badge': {right: -5}}));
    return (
        <Tab
            {...props}
            label={
                <StyledBadge
                    sx={{padding: '0 0.5rem'}}
                    badgeContent={count}
                    color={tab?.color || ColorLevel.info}
                >
                    {tab?.name}
                </StyledBadge>
            }
            {...a11yProps(tab?.name)}
        />
    )
}

export default NavbarTab;
