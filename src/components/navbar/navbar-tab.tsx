import type { BadgeProps, LinkProps, TabProps } from '@mui/material';
import type { FC } from 'react';

import type { ContentTab, TabTemplate } from '@src/models';

import { Badge, styled, Tab } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { ColorLevel } from '@src/models';
import { setNavbar } from '@src/store/actions';
import { getContentsCountByTabId } from '@src/store/selectors';

type NavbarTabProps = TabProps & LinkProps & { tab: ContentTab };

function a11yProps(name: TabTemplate | string) {
  return {
    'id': `simple-tab-${name}`,
    'aria-controls': `simple-tab-panel-${name}`,
  };
}
const StyledBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': { right: '-0.5rem', height: '1rem', minWidth: '1rem' },
}));

export const NavbarTab: FC<NavbarTabProps> = ({ tab, ...props }) => {
  const count = useSelector(getContentsCountByTabId)[tab.name];
  const dispatch = useDispatch();

  const LabelBadge = (
    <StyledBadge badgeContent={count} color={tab?.color || ColorLevel.primary}>
      {tab?.name ?? ''}
    </StyledBadge>
  );
  return (
    <Tab
      component={Link}
      to="/"
      onClick={() => dispatch(setNavbar(tab))}
      sx={{ overflow: 'unset' }}
      {...props}
      label={LabelBadge}
      {...a11yProps(tab?.name)}
    />
  );
};

export default NavbarTab;
