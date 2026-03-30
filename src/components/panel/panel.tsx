import type { FC, ReactNode } from 'react';
import type { PathRouteProps } from 'react-router-dom';

import type { TaskForm } from '../../models/task.model';

import { Container } from '@mui/material';
import { lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { AppRoute } from '../../models/routes.model';
import { setNavbar } from '../../store/actions/navbar.action';
import { SuspenseLoader } from '../common/loader/suspense-loader';
import { ScrapePanel } from './scrape/scrape-panel';

const ContentPanel = lazy(async () => import(/* webpackChunkName: "ContentPanel" */ './content/content-panel'));
const TaskAdd = lazy(async () => import(/* webpackChunkName: "TaskAdd" */ './content/task/task-add'));
const Config = lazy(async () => import(/* webpackChunkName: "Config" */ './config/config'));
const About = lazy(async () => import(/* webpackChunkName: "About" */ './about'));
const Settings = lazy(async () => import(/* webpackChunkName: "Settings" */ './settings/settings'));

type RouteFragment<T extends Record<string, unknown> = Record<string, unknown>> = PathRouteProps & {
  render?: (props: T) => ReactNode;
};
const routes: RouteFragment[] = [
  { path: `${AppRoute.All}`, element: <ContentPanel /> },
  {
    path: `${AppRoute.Add}/*`,
    render: ({ state }: { state?: TaskForm } = {}) => <TaskAdd cardProps={{ sx: { m: '0.5rem', fontSize: '1rem' } }} allowFile={true} form={state} />,
  },
  { path: `${AppRoute.Scrape}/*`, element: <ScrapePanel cardProps={{ sx: { m: '0.5rem' } }} /> },
  { path: `${AppRoute.Settings}/*`, element: <Settings /> },
  { path: `${AppRoute.Config}/*`, element: <Config cardProps={{ sx: { m: '0.5rem' } }} /> },
  { path: `${AppRoute.About}/*`, element: <About cardProps={{ sx: { m: '0.5rem' } }} /> },
];

export const Panel: FC<{ redirect?: string }> = ({ redirect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (redirect) {
      dispatch(setNavbar());
      void navigate(redirect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on redirect change
  }, [redirect]);

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        overflow: 'auto',
        height: 'calc(100% - 3em)',
        overscrollBehaviorY: 'contain',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Routes>
        {routes?.map(({ path, element, render }) => (
          <Route key={path} path={path} element={<SuspenseLoader element={render?.({ state: location.state }) ?? element} />} />
        ))}
      </Routes>
    </Container>
  );
};

export default Panel;
