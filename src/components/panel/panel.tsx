import { Container } from '@mui/material';

import React, { lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Route, Routes, useNavigate } from 'react-router-dom';

import { ScrapePanel, SuspenseLoader } from '@src/components';
import { AppRoute } from '@src/models';

import { setNavbar } from '@src/store/actions';

import type { FC } from 'react';
import type { PathRouteProps } from 'react-router/lib/components';

const ContentPanel = lazy(() => import(/* webpackChunkName: "ContentPanel" */ './content/content-panel'));
const TaskAdd = lazy(() => import(/* webpackChunkName: "TaskAdd" */ './content/task/task-add'));
const Config = lazy(() => import(/* webpackChunkName: "Config" */ './config/config'));
const About = lazy(() => import(/* webpackChunkName: "About" */ './about'));
const Settings = lazy(() => import(/* webpackChunkName: "Settings" */ './settings/settings'));

const routes: PathRouteProps[] = [
  { path: `${AppRoute.All}`, element: <ContentPanel /> },
  { path: `${AppRoute.Add}/*`, element: <TaskAdd cardProps={{ sx: { m: '0.5rem', fontSize: '1rem' } }} allowFile={true} /> },
  { path: `${AppRoute.Scrape}/*`, element: <ScrapePanel cardProps={{ sx: { m: '0.5rem' } }} /> },
  { path: `${AppRoute.Settings}/*`, element: <Settings /> },
  { path: `${AppRoute.Config}/*`, element: <Config cardProps={{ sx: { m: '0.3rem' } }} /> },
  { path: `${AppRoute.About}/*`, element: <About cardProps={{ sx: { m: '0.3rem' } }} /> },
];

export const Panel: FC<{ redirect?: string }> = ({ redirect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (redirect) {
      dispatch(setNavbar());
      navigate(redirect);
    }
  }, [redirect]);

  return (
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100% - 3em)', overscrollBehaviorY: 'contain' }}>
      <Routes>
        {routes?.map(({ path, element }, index) => (
          <Route key={index} path={path} element={<SuspenseLoader element={element} />} />
        ))}
      </Routes>
    </Container>
  );
};

export default Panel;
