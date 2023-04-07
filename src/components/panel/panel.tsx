import { CircularProgress, Container } from '@mui/material';

import React, { lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { ScrapePanel } from '@src/components/panel/scrape';
import { AppRoute } from '@src/models';

import { setNavbar } from '@src/store/actions';

import type { FC, ReactNode } from 'react';

type RouteDefinition = { path: string; element: ReactNode };

const ContentPanel = lazy(() => import(/* webpackChunkName: "ContentPanel" */ './content/content-panel'));
const TaskAdd = lazy(() => import(/* webpackChunkName: "TaskAdd" */ './content/task/task-add'));
const Config = lazy(() => import(/* webpackChunkName: "Config" */ './config/config'));
const About = lazy(() => import(/* webpackChunkName: "About" */ './about'));
const Settings = lazy(() => import(/* webpackChunkName: "Settings" */ './settings/settings'));

const LoadingRoute = (element: ReactNode, fallback: NonNullable<ReactNode> = <CircularProgress />) => (
  <React.Suspense fallback={fallback}>{element}</React.Suspense>
);

const routes: RouteDefinition[] = [
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
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100% - 3em)' }}>
      <Routes>
        {routes?.map(({ path, element }, index) => (
          <Route key={index} path={path} element={LoadingRoute(element)} />
        ))}
      </Routes>
    </Container>
  );
};

export default Panel;
