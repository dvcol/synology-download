import React from 'react';
import { Container } from '@mui/material';
import { useSelector } from 'react-redux';
import { getFilteredTasks, getTabOrFirst } from '../../../store';
import TaskItem from './task-item';

export const TaskPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const tasks = useSelector(getFilteredTasks);

  return (
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 48px)', padding: '0.25rem' }}>
      {tab && tasks?.map((task) => <TaskItem key={task.id} task={task} status={tab?.status} />)}
    </Container>
  );
};

export default TaskPanel;
