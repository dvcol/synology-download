import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { TaskAdd, TaskPanel } from './task';
import { Settings } from './settings';
import { Config } from './config';
import { Container } from '@mui/material';

export const Panel = () => {
  return (
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 48px)' }}>
      <Routes>
        <Route path="*" element={<TaskPanel />} />
        <Route path="/add/*" element={<TaskAdd cardProps={{ sx: { m: '0.3rem' } }} />} />
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/config/*" element={<Config cardProps={{ sx: { m: '0.3rem' } }} />} />
      </Routes>
    </Container>
  );
};

export default Panel;
