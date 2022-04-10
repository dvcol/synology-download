import { Badge, styled, Tab } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import type { TabType, TaskTab } from '@src/models';
import { ColorLevel } from '@src/models';
import { setNavbar } from '@src/store/actions';
import { getTaskCountByTabId } from '@src/store/selectors';

import type { BadgeProps, LinkProps, TabProps } from '@mui/material';
import type { FC } from 'react';

type NavbarTabProps = TabProps & LinkProps & { tab: TaskTab };

export const NavbarTab: FC<NavbarTabProps> = ({ tab, ...props }) => {
  const count = useSelector(getTaskCountByTabId)[tab.name];
  const dispatch = useDispatch();

  const a11yProps = (name: TabType | string) => ({
    id: `simple-tab-${name}`,
    'aria-controls': `simple-tab-panel-${name}`,
  });
  const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': { right: -5 },
  }));
  return (
    <Tab
      component={Link}
      to="/"
      onClick={() => dispatch(setNavbar(tab))}
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
