import React from 'react';
import { Container } from '@mui/material';
import { useSelector } from 'react-redux';
import { getFilteredTasks, getTabOrFirst } from '../../../store';
import TaskItem from './task-item';

export const TaskPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const tasks = useSelector(getFilteredTasks);

  return (
    <Container disableGutters sx={{ overflow: 'auto', height: 'calc(100vh - 48px)', padding: '0.25rem' }} maxWidth={false}>
      {tab && tasks?.map((task, i) => <TaskItem key={`${i}-${task.id}`} task={task} status={tab?.status} />)}
    </Container>
  );
};

export default TaskPanel;
