import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { Button, Tooltip } from '@mui/material';

import React, { forwardRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { finalize } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import type { ProgressBackgroundProps } from '@src/components';
import { ConfirmationDialog, IconLoader } from '@src/components';

import type { Global, Task } from '@src/models';
import { ColorLevel, ColorLevelMap, ErrorType, LoginError, TaskStatus, taskStatusToColor } from '@src/models';
import { NotificationService, QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { getGlobalTask } from '@src/store/selectors';
import { before, useDebounceObservable } from '@src/utils';

import { ContentItem } from '../content-item';

import TaskCard from './task-card';
import TaskDetail from './task-detail';

import type { ForwardRefRenderFunction } from 'react';
import type { Observable } from 'rxjs';

type TaskItemProps = { task: Task; hideStatus?: boolean };

const ButtonStyle = { display: 'flex', flex: '1 1 auto', minHeight: '2.5rem' };
const TaskItemComponent: ForwardRefRenderFunction<HTMLDivElement, TaskItemProps> = ({ task, hideStatus }, ref) => {
  const i18n = useI18n('panel', 'content', 'task', 'item');
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);
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
  let playOrSeedOrRetry: 'play' | 'seed' | 'retry' = 'play';
  if (TaskStatus.finished === task.status) playOrSeedOrRetry = 'seed';
  if (TaskStatus.error === task.status) playOrSeedOrRetry = 'retry';

  const showBackground = useSelector<StoreState, Global['task']>(getGlobalTask)?.background;
  const background: ProgressBackgroundProps = showBackground
    ? {
        primary: `${ColorLevelMap[taskStatusToColor(task.status)]}${hover ? 30 : 20}`,
        secondary: hover ? '#99999910' : 'transparent',
        progress: task.progress ?? 0,
      }
    : {};

  const buttons = (
    <>
      <Tooltip arrow title={i18n('delete', 'common', 'buttons')} placement={'left'}>
        <span>
          <Button
            key="delete"
            sx={ButtonStyle}
            color={ColorLevel.error}
            disabled={isDisabled}
            onClick={$event => {
              $event.stopPropagation();
              setConfirm(true);
            }}
          >
            <IconLoader icon={<DeleteIcon />} loading={loadingIcon?.delete} props={{ size: '1rem', color: ColorLevel.error }} />
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
      {![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status) ? (
        <Tooltip arrow title={i18n('pause', 'common', 'buttons')} placement={'left'}>
          <span>
            <Button
              key="pause"
              sx={ButtonStyle}
              color={ColorLevel.warning}
              onClick={$event => onClick('pause', QueryService.pauseTask(task.id), $event)}
              disabled={isDisabled}
            >
              <IconLoader icon={<PauseIcon />} loading={loadingIcon?.pause} props={{ size: '1rem', color: ColorLevel.warning }} />
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Tooltip arrow title={i18n(playOrSeedOrRetry, 'common', 'buttons')} placement={'left'}>
          <span>
            <Button
              key={playOrSeedOrRetry}
              sx={ButtonStyle}
              color={playOrSeedOrRetry === 'play' ? ColorLevel.success : ColorLevel.secondary}
              onClick={$event => onClick(playOrSeedOrRetry, QueryService.resumeTask(task.id), $event)}
              disabled={isDisabled || ![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status)}
            >
              <IconLoader
                icon={playOrSeedOrRetry === 'retry' ? <ReplayIcon /> : <PlayArrowIcon />}
                loading={loadingIcon?.play}
                props={{ size: '1rem', color: playOrSeedOrRetry === 'play' ? ColorLevel.success : ColorLevel.secondary }}
              />
            </Button>
          </span>
        </Tooltip>
      )}
    </>
  );

  return (
    <ContentItem
      ref={ref}
      onHover={_visible => setHover(_visible)}
      onToggle={_expanded => setExpanded(_expanded)}
      background={background}
      summary={{
        card: <TaskCard task={task} hideStatus={hideStatus} expanded={expanded} hover={hover} />,
        buttons,
      }}
      details={<TaskDetail task={task} loading={loading} loadingIcon={loadingIcon} buttonClick={onClick} />}
    />
  );
};

export const TaskItem = forwardRef(TaskItemComponent);
