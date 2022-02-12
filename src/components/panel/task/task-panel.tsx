import React from 'react';
import { useSelector } from 'react-redux';
import { getTabOrFirst, getTasksForActiveTab } from '@src/store/selectors';
import TaskItem from './task-item';

export const TaskPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const tasks = useSelector(getTasksForActiveTab);

  return (
    <React.Fragment>
      {tasks?.map((task) => (
        <TaskItem key={task.id} task={task} status={tab?.status} />
      ))}
    </React.Fragment>
  );
};

export default TaskPanel;
