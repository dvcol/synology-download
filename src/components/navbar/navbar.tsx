import { Link } from 'react-router-dom';
import React from 'react';
import { AppBar, Tabs, Toolbar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import NavbarTab from './navbar-tab';
import NavbarMenu from './navbar-menu';
import { getTab, getTabs } from '@src/store/selectors';
import { setNavbar } from '@src/store/actions';
import { useI18n } from '@src/utils';
import LoadingBar from '@src/components/navbar/loading-bar';

export const Navbar = () => {
  const i18n = useI18n('navbar');
  const dispatch = useDispatch();

  const tabs = useSelector(getTabs);
  const tab = useSelector(getTab);

  const handleChange = (event: React.SyntheticEvent, index: number): void => {
    dispatch(setNavbar(tabs?.length > index ? tabs[index] : undefined));
  };

  const getValue = (): number => {
    const index = tabs?.findIndex((t) => t.id === tab?.id);
    return index && index > -1 ? index : 0;
  };

  const tabComponents = tabs?.map((taskTab, index) => (
    <NavbarTab tab={taskTab} value={index} component={Link} to="/" key={`${taskTab.id}-${index}`} />
  ));
  return (
    <AppBar color="inherit" position="sticky" sx={{ mt: '-2px' }}>
      <LoadingBar />
      <Toolbar disableGutters={true} sx={{ minHeight: 48, justifyContent: 'space-between' }}>
        <Tabs
          aria-label={i18n('tabs_aria_label')}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          onChange={handleChange}
          value={getValue()}
          sx={{ height: '100%' }}
          TabIndicatorProps={{ style: tab ? undefined : { display: 'none' } }}
        >
          {tabComponents}
        </Tabs>
        <NavbarMenu label={<MenuIcon />} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
