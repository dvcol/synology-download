import React from 'react';
import { useSelector } from 'react-redux';
import { getFilteredTasks, getTabOrFirst } from '@src/store/selectors';
import TaskItem from './task-item';

export const TaskPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const tasks = useSelector(getFilteredTasks);

  return <React.Fragment>{tab && tasks && tasks[tab.id]?.map((task) => <TaskItem key={task.id} task={task} status={tab?.status} />)}</React.Fragment>;
};

export default TaskPanel;
