import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Tabs, Toolbar } from '@mui/material';

import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import LoadingBar from '@src/components/navbar/loading-bar';
import { setNavbar } from '@src/store/actions';
import { getTab, getTabs } from '@src/store/selectors';

import NavbarMenu from './navbar-menu';
import NavbarTab from './navbar-tab';

export const Navbar = () => {
  const i18n = useI18n('navbar');
  const dispatch = useDispatch();

  const tabs = useSelector(getTabs);
  const tab = useSelector(getTab);

  useEffect(() => {
    if (!tab && tabs?.length) dispatch(setNavbar(tabs[0]));
  }, []);

  const getValue = (): number => {
    const index = tabs?.findIndex(t => t.id === tab?.id);
    return index && index > -1 ? index : 0;
  };

  const tabComponents = tabs?.map((taskTab, index) => <NavbarTab tab={taskTab} value={index} key={`${taskTab.id}-${index}`} />);
  return (
    <AppBar color="inherit" position="sticky" sx={{ mt: '-2px' }}>
      <LoadingBar />
      <Toolbar disableGutters={true} sx={{ minHeight: 48, justifyContent: 'space-between' }}>
        <Tabs
          aria-label={i18n('tabs_aria_label')}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          value={getValue()}
          sx={{ height: '100%', flex: '1 1 auto' }}
          TabIndicatorProps={{ style: tab ? undefined : { display: 'none' } }}
        >
          {tabComponents}
        </Tabs>
        <NavbarMenu menuIcon={<MenuIcon />} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
