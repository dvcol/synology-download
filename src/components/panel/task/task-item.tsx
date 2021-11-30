import React, { useState } from 'react';
import { finalize, Observable } from 'rxjs';
import { synologyClient } from '../../../services';
import { setTasks } from '../../../store';
import { Accordion, AccordionDetails, AccordionSummary, Button, ButtonGroup } from '@mui/material';
import TaskCard from './task-card';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task, TaskStatus } from '../../../models';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TaskDetail from './task-detail';
import { useDispatch } from 'react-redux';

export const TaskItem = ({ task, status }: { task: Task; status?: TaskStatus[] }) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading]: [Record<string, boolean>, any] = useState({});

  const onClick = (button: string, request: Observable<any>, $event?: React.MouseEvent) => {
    console.log('on clicked');
    $event?.stopPropagation();
    setLoading({ ...loading, [button]: true });
    request
      .pipe(
        finalize(() =>
          setLoading({
            ...loading,
            [button]: false,
          })
        )
      )
      .subscribe(() => synologyClient.listTasks().subscribe((res) => dispatch(setTasks(res?.data?.tasks))));
  };

  const isDisabled = () => Object.values(loading).some(Boolean);

  return (
    <Accordion onChange={(_, state) => setExpanded(state)}>
      <AccordionSummary aria-controls="task-content" id="task-header" sx={{ padding: 0 }} onMouseOver={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
        <TaskCard task={task} statuses={status} />
        {visible && !expanded && (
          <ButtonGroup orientation="vertical" aria-label="vertical contained button group" variant="text">
            <Button key="delete" sx={{ display: 'flex', flex: '1 1 auto' }} disabled={isDisabled()} onClick={($event) => onClick('delete', synologyClient.deleteTask(task.id), $event)}>
              <DeleteIcon />
            </Button>
            {[TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status) ? (
              <Button key="pause" sx={{ display: 'flex', flex: '1 1 auto' }} onClick={($event) => onClick('play', synologyClient.pauseTask(task.id), $event)} disabled={isDisabled()}>
                <PauseIcon />
              </Button>
            ) : (
              <Button
                key="play"
                sx={{ display: 'flex', flex: '1 1 auto' }}
                onClick={($event) => onClick('play', synologyClient.resumeTask(task.id), $event)}
                disabled={isDisabled() || ![TaskStatus.paused, TaskStatus.finished].includes(task.status)}
              >
                <PlayArrowIcon />
              </Button>
            )}
          </ButtonGroup>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <TaskDetail task={task} />
      </AccordionDetails>
    </Accordion>
  );
};

export default TaskItem;
