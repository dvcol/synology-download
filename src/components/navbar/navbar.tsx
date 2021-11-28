import { Link } from 'react-router-dom';
import React from 'react';
import { AppBar, Tabs, Toolbar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import { getTab, getTabs, setNavbar, setStatuses } from '../../store';
import NavbarTab from './navbar-tab';
import NavbarMenu from './navbar-menu';

export const Navbar = () => {
  const dispatch = useDispatch();

  const tabs = useSelector(getTabs);
  const tab = useSelector(getTab);

  console.log('init', tabs, tab);
  const handleChange = (event: React.SyntheticEvent, index: number): void => {
    const newTab = tabs?.length > index ? tabs[index] : undefined;
    console.log('change', tab, newTab);
    dispatch(setNavbar(newTab));
    dispatch(setStatuses(newTab?.status || []));
  };

  const getValue = (): number => tabs?.findIndex((t) => t.id === tab?.id) ?? -1;

  const tabComponents = tabs?.map((taskTab, index) => (
    <NavbarTab
      tab={taskTab}
      component={Link}
      to="/"
      key={`${taskTab.id}-${index}`}
    />
  ));
  return (
    <AppBar color="inherit" position="sticky" sx={{ padding: '0 0.5rem' }}>
      <Toolbar disableGutters={true} sx={{ justifyContent: 'space-between' }}>
        <Tabs
          aria-label="download filtered tabs"
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          onChange={handleChange}
          value={getValue()}
          sx={{ minHeight: 64, height: '100%' }}
        >
          {tabComponents}
        </Tabs>
        <NavbarMenu label={<MenuIcon />} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
