import React from 'react';
import { useSelector } from 'react-redux';
import { Badge, BadgeProps, styled, Tab } from '@mui/material';
import { ColorLevel, TabType, TaskTab } from '@src/models';
import { getTabCountByStatus } from '@src/store';

type NavbarTabProps = { tab: TaskTab; [key: string]: any };

export const NavbarTab = ({ tab, ...props }: NavbarTabProps) => {
  const countByStatus = useSelector(getTabCountByStatus);
  const count = tab?.status?.reduce((acc, status) => acc + (countByStatus[status] ?? 0), 0) ?? countByStatus?.total;

  const a11yProps = (name: TabType | string) => ({
    id: `simple-tab-${name}`,
    'aria-controls': `simple-tab-panel-${name}`,
  });
  const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': { right: -5 },
  }));
  return (
    <Tab
      {...props}
      label={
        <StyledBadge sx={{ padding: '0 0.5rem' }} badgeContent={count} color={tab?.color || ColorLevel.primary}>
          {tab?.name ?? ''}
        </StyledBadge>
      }
      {...a11yProps(tab?.name)}
    />
  );
};

export default NavbarTab;
