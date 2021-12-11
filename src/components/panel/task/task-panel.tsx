import React from 'react';
import { Collapse, Container } from '@mui/material';
import { useSelector } from 'react-redux';
import { getFilteredTasks, getTabOrFirst } from '../../../store';
import TaskItem from './task-item';
import { TransitionGroup } from 'react-transition-group';

export const TaskPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const tasks = useSelector(getFilteredTasks);

  return (
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 48px)', padding: '0.25rem' }}>
      <TransitionGroup component={null}>
        {tab &&
          tasks?.map((task) => (
            <Collapse key={task.id}>
              <TaskItem task={task} status={tab?.status} />
            </Collapse>
          ))}
      </TransitionGroup>
    </Container>
  );
};

export default TaskPanel;
