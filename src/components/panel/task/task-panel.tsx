import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Container } from '@mui/material';
import TaskCard from './task-card';
import { useSelector } from 'react-redux';
import TaskDetail from './task-detail';
import { getFilteredTasks, getTab } from '../../../store';

export const TaskPanel = () => {
  const tab = useSelector(getTab);
  const tasks = useSelector(getFilteredTasks);
  return (
    <Container disableGutters sx={{ overflow: 'auto', maxHeight: '30rem', padding: '0.25rem' }}>
      {tab &&
        tasks.map((t) => (
          <Accordion key={t.id}>
            <AccordionSummary aria-controls="task-content" id="task-header" sx={{ padding: 0 }}>
              <TaskCard task={t} statuses={tab?.status} />
            </AccordionSummary>
            <AccordionDetails>
              <TaskDetail task={t} />
            </AccordionDetails>
          </Accordion>
        ))}
    </Container>
  );
};

export default TaskPanel;
