import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Accordion, AccordionDetails, AccordionSummary, Button, ButtonGroup, Tooltip } from '@mui/material';

import React, { forwardRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { finalize } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import type { ProgressBackgroundProps } from '@src/components';
import { ConfirmationDialog, IconLoader, ProgressBackground } from '@src/components';
import type { Global, Task } from '@src/models';
import { ColorLevelMap, computeProgress, ErrorType, LoginError, TaskStatus, taskStatusToColor, TaskStatusType, taskStatusTypeMap } from '@src/models';
import { NotificationService, QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { getGlobalTask } from '@src/store/selectors';
import { before, useDebounceObservable } from '@src/utils';

import TaskCard from './task-card';
import TaskDetail from './task-detail';

import type { ForwardRefRenderFunction } from 'react';
import type { Observable } from 'rxjs';

type TaskItemProps = { task: Task; status?: TaskStatus[] };
const TaskItemComponent: ForwardRefRenderFunction<HTMLDivElement, TaskItemProps> = ({ task, status }, ref) => {
  const i18n = useI18n('panel', 'task', 'item');
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // Loading state
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingIcon, setLoadingIcon] = useState<Record<string, boolean>>({});

  // Loading observable for debounce
  const [, next] = useDebounceObservable<Record<string, boolean>>(setLoadingIcon, 300);

  const onClick = <T,>(button: string, request: Observable<T>, $event?: React.MouseEvent): void => {
    request
      .pipe(
        before(() => {
          $event?.stopPropagation();
          setLoading({ ...loading, [button]: true });
          next({ ...loading, [button]: true });
        }),
        finalize(() => {
          setLoading({ ...loading, [button]: false });
          setLoadingIcon({ ...loading, [button]: false }); // So there is no delay
          next({ ...loading, [button]: false }); // So that observable data is not stale
        }),
      )
      .subscribe({
        error: error => {
          if (error instanceof LoginError || error.type === ErrorType.Login) {
            NotificationService.loginRequired();
          } else if (error) {
            NotificationService.error({
              title: i18n(`task_${button}_fail`, 'common', 'error'),
              message: error?.message ?? error?.name ?? '',
            });
          }
        },
      });
  };

  const isDisabled = Object.values(loading).some(Boolean);
  const playOrSeed = TaskStatus.paused === task.status ? 'play' : 'seed';

  const showBackground = useSelector<StoreState, Global['task']>(getGlobalTask)?.background;
  let background: ProgressBackgroundProps = {};
  if (showBackground) {
    if (taskStatusTypeMap[TaskStatusType.active].includes(task?.status)) {
      background = {
        primary: `${ColorLevelMap[taskStatusToColor(task.status)]}${visible ? 30 : 20}`,
        secondary: visible ? '#99999910' : 'transparent',
        progress: computeProgress(task.additional?.transfer?.size_downloaded, task.size),
      };
    } else if (visible) {
      background = { primary: `${ColorLevelMap[taskStatusToColor(task.status)]}10` };
    }
  }

  return (
    <Accordion ref={ref} onChange={(_, state) => setExpanded(state)} TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary
        aria-controls="task-content"
        id="task-header"
        sx={{ padding: 0, position: 'relative' }}
        onMouseOver={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {showBackground && <ProgressBackground primary={background?.primary} secondary={background?.secondary} progress={background?.progress} />}
        <TaskCard task={task} statuses={status} expanded={expanded} visible={visible} />
        {visible && !expanded && (
          <ButtonGroup orientation="vertical" variant="text">
            <Tooltip title={i18n('delete', 'common', 'buttons')} placement={'left'}>
              <span>
                <Button
                  key="delete"
                  sx={{ display: 'flex', flex: '1 1 auto', minHeight: '40px' }}
                  disabled={isDisabled}
                  onClick={$event => {
                    $event.stopPropagation();
                    setConfirm(true);
                  }}
                >
                  <IconLoader icon={<DeleteIcon />} loading={loadingIcon?.delete} props={{ size: '1rem', color: 'error' }} />
                </Button>
              </span>
            </Tooltip>
            <ConfirmationDialog
              open={confirm}
              title={i18n('confirmation_title')}
              description={i18n('confirmation_description')}
              onCancel={$event => {
                $event?.stopPropagation();
                setConfirm(false);
              }}
              onConfirm={$event => {
                $event?.stopPropagation();
                setConfirm(false);
                onClick('delete', QueryService.deleteTask(task.id), $event);
              }}
            />
            {[TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status) ? (
              <Tooltip title={i18n('pause', 'common', 'buttons')} placement={'left'}>
                <span>
                  <Button
                    key="pause"
                    sx={{ display: 'flex', flex: '1 1 auto', minHeight: '40px' }}
                    onClick={$event => onClick('pause', QueryService.pauseTask(task.id), $event)}
                    disabled={isDisabled}
                  >
                    <IconLoader icon={<PauseIcon />} loading={loadingIcon?.pause} props={{ size: '1rem', color: 'warning' }} />
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Tooltip title={i18n(playOrSeed, 'common', 'buttons')} placement={'left'}>
                <span>
                  <Button
                    key="play"
                    sx={{ display: 'flex', flex: '1 1 auto', minHeight: '40px' }}
                    onClick={$event => onClick(playOrSeed, QueryService.resumeTask(task.id), $event)}
                    disabled={isDisabled || ![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status)}
                  >
                    <IconLoader icon={<PlayArrowIcon />} loading={loadingIcon?.play} props={{ size: '1rem', color: 'success' }} />
                  </Button>
                </span>
              </Tooltip>
            )}
          </ButtonGroup>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <TaskDetail task={task} loading={loading} loadingIcon={loadingIcon} buttonClick={onClick} />
      </AccordionDetails>
    </Accordion>
  );
};

export const TaskItem = forwardRef(TaskItemComponent);
