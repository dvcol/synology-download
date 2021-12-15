import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { TaskAdd, TaskPanel } from './task';
import { Settings } from './settings';
import { Info } from './info';

export const Panel = () => {
  return (
    <React.Fragment>
      <Routes>
        <Route path="*" element={<TaskPanel />} />
        <Route path="/add" element={<TaskAdd />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/info" element={<Info />} />
      </Routes>
    </React.Fragment>
  );
};

export default Panel;
