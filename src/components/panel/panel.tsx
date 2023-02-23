import { Container } from '@mui/material';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { AppRoute } from '@src/models';

import { setNavbar } from '@src/store/actions';

import { About } from './about';
import { Config } from './config';
import { Settings } from './settings';
import { TaskAdd, TaskPanel } from './task';

import type { FC } from 'react';

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
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 3rem)' }}>
      <Routes>
        <Route path={`${AppRoute.All}`} element={<TaskPanel />} />
        <Route path={`${AppRoute.Add}/*`} element={<TaskAdd cardProps={{ sx: { m: '0.3rem' } }} />} />
        <Route path={`${AppRoute.Settings}/*`} element={<Settings />} />
        <Route path={`${AppRoute.Config}/*`} element={<Config cardProps={{ sx: { m: '0.3rem' } }} />} />
        <Route path={`${AppRoute.About}/*`} element={<About cardProps={{ sx: { m: '0.3rem' } }} />} />
      </Routes>
    </Container>
  );
};

export default Panel;
