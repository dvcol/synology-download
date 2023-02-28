import { Badge, styled, Tab } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import type { ContentTab, TabTemplate } from '@src/models';
import { ColorLevel } from '@src/models';
import { setNavbar } from '@src/store/actions';
import { getContentsCountByTabId } from '@src/store/selectors';

import type { BadgeProps, LinkProps, TabProps } from '@mui/material';
import type { FC } from 'react';

type NavbarTabProps = TabProps & LinkProps & { tab: ContentTab };

export const NavbarTab: FC<NavbarTabProps> = ({ tab, ...props }) => {
  const count = useSelector(getContentsCountByTabId)[tab.name];
  const dispatch = useDispatch();

  const a11yProps = (name: TabTemplate | string) => ({
    id: `simple-tab-${name}`,
    'aria-controls': `simple-tab-panel-${name}`,
  });
  const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': { right: '-0.5rem', height: '1rem', minWidth: '1rem' },
  }));
  return (
    <Tab
      component={Link}
      to="/"
      onClick={() => dispatch(setNavbar(tab))}
      sx={{ overflow: 'unset' }}
      {...props}
      label={
        <StyledBadge badgeContent={count} color={tab?.color || ColorLevel.primary}>
          {tab?.name ?? ''}
        </StyledBadge>
      }
      {...a11yProps(tab?.name)}
    />
  );
};

export default NavbarTab;
