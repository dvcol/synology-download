import React, { useState } from 'react';
import { finalize, Observable } from 'rxjs';
import { Accordion, AccordionDetails, AccordionSummary, Button, ButtonGroup, Tooltip } from '@mui/material';
import TaskCard from './task-card';
import DeleteIcon from '@mui/icons-material/Delete';
import { Task, TaskStatus } from '@src/models';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TaskDetail from './task-detail';
import { QueryService } from '@src/services';
import { ConfirmationDialog, IconLoader } from '@src/components';
import { useI18n } from '@src/utils';

export const TaskItem = React.forwardRef<HTMLDivElement, { task: Task; status?: TaskStatus[] }>(({ task, status }, ref) => {
  const i18n = useI18n('panel', 'task', 'item');
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState(false);

  const onClick = <T,>(button: string, request: Observable<T>, $event?: React.MouseEvent, delay = 500): void => {
    $event?.stopPropagation();
    const timeout = setTimeout(() => setLoading({ ...loading, [button]: true }), delay);
    request
      .pipe(
        finalize(() => {
          clearTimeout(timeout);
          setLoading({ ...loading, [button]: false });
        })
      )
      .subscribe();
  };

  const isDisabled = () => Object.values(loading).some(Boolean);

  return (
    <Accordion ref={ref} onChange={(_, state) => setExpanded(state)} TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary
        aria-controls="task-content"
        id="task-header"
        sx={{ padding: 0 }}
        onMouseOver={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        <TaskCard task={task} statuses={status} />
        {visible && !expanded && (
          <ButtonGroup orientation="vertical" variant="text">
            <Tooltip title={i18n('delete', 'common', 'buttons')} placement={'left'}>
              <Button
                key="delete"
                sx={{ display: 'flex', flex: '1 1 auto' }}
                disabled={isDisabled()}
                onClick={($event) => {
                  $event.stopPropagation();
                  setConfirm(true);
                }}
              >
                <IconLoader icon={<DeleteIcon />} loading={loading?.delete} props={{ size: '1rem', color: 'error' }} />
              </Button>
            </Tooltip>
            <ConfirmationDialog
              open={confirm}
              title={i18n('confirmation_title')}
              description={i18n('confirmation_description')}
              onCancel={($event) => {
                $event?.stopPropagation();
                setConfirm(false);
              }}
              onConfirm={($event) => {
                $event?.stopPropagation();
                setConfirm(false);
                onClick('delete', QueryService.deleteTask(task.id), $event, 0);
              }}
            />
            {[TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status) ? (
              <Tooltip title={i18n('pause', 'common', 'buttons')} placement={'left'}>
                <Button
                  key="pause"
                  sx={{ display: 'flex', flex: '1 1 auto' }}
                  onClick={($event) => onClick('play', QueryService.pauseTask(task.id), $event)}
                  disabled={isDisabled()}
                >
                  <IconLoader icon={<PauseIcon />} loading={loading?.pause} props={{ size: '1rem', color: 'warning' }} />
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title={i18n(TaskStatus.paused === task.status ? 'play' : 'seed', 'common', 'buttons')} placement={'left'}>
                <Button
                  key="play"
                  sx={{ display: 'flex', flex: '1 1 auto' }}
                  onClick={($event) => onClick('play', QueryService.resumeTask(task.id), $event)}
                  disabled={isDisabled() || ![TaskStatus.paused, TaskStatus.finished].includes(task.status)}
                >
                  <IconLoader icon={<PlayArrowIcon />} loading={loading?.play} props={{ size: '1rem', color: 'success' }} />
                </Button>
              </Tooltip>
            )}
          </ButtonGroup>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <TaskDetail task={task} loading={loading} buttonClick={onClick} />
      </AccordionDetails>
    </Accordion>
  );
});

export default TaskItem;
