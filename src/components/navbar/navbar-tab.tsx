import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, BadgeProps, LinkProps, styled, Tab, TabProps } from '@mui/material';
import { ColorLevel, TabType, TaskTab } from '@src/models';
import { getTaskCountByTabId } from '@src/store/selectors';
import { Link } from 'react-router-dom';
import { setNavbar } from '@src/store/actions';

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
