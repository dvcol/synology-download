import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';

import React, { forwardRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { finalize } from 'rxjs';

import type { ProgressBackgroundProps, TaskDetailProps } from '@src/components';
import { IconLoader } from '@src/components';

import { ContentButton } from '@src/components/panel/content/content-button';
import type { GlobalSettings, Task } from '@src/models';
import { ColorLevel, ColorLevelMap, ErrorType, LoginError, TaskStatus, taskStatusToColor } from '@src/models';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { getGlobalTask } from '@src/store/selectors';
import type { i18n } from '@src/utils';
import { before, useDebounceObservable, useI18n } from '@src/utils';

import { ContentItem } from '../content-item';

import TaskCard from './task-card';
import TaskDetail from './task-detail';

import type { ContentItemAccordionProps } from '../content-item';
import type { FC, ForwardRefRenderFunction } from 'react';
import type { Observable } from 'rxjs';

const ButtonStyle = { display: 'flex', flex: '1 1 auto', minHeight: '2.5rem' };

type TaskItemsOnClick = <T>(button: string, request: Observable<T>, $event?: React.MouseEvent) => void;

type TaskItemsButtonProp = { task: Task; isDisabled: boolean; loadingIcon: Record<string, boolean>; onClick: TaskItemsOnClick; i18n: typeof i18n };

const PlayOrRetry: FC<TaskItemsButtonProp> = ({ task, isDisabled, loadingIcon, onClick, i18n }) => {
  if (![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status)) return null;

  let playOrSeedOrRetry: 'play' | 'seed' | 'retry' = 'play';
  if (TaskStatus.finished === task.status) playOrSeedOrRetry = 'seed';
  if (TaskStatus.error === task.status) playOrSeedOrRetry = 'retry';

  return (
    <ContentButton
      TooltipProps={{
        title: i18n(playOrSeedOrRetry, 'common', 'buttons'),
      }}
      ButtonProps={{
        key: playOrSeedOrRetry,
        sx: ButtonStyle,
        color: playOrSeedOrRetry === 'play' ? ColorLevel.success : ColorLevel.secondary,
        onClick: $event => onClick(playOrSeedOrRetry, QueryService.resumeTask(task.id), $event),
        disabled: isDisabled || ![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status),
      }}
    >
      <IconLoader
        icon={playOrSeedOrRetry === 'retry' ? <ReplayIcon /> : <PlayArrowIcon />}
        loading={loadingIcon?.play}
        props={{
          size: '1rem',
          color: playOrSeedOrRetry === 'play' ? ColorLevel.success : ColorLevel.secondary,
        }}
      />
    </ContentButton>
  );
};

const PauseButton: FC<TaskItemsButtonProp> = ({ task, isDisabled, loadingIcon, onClick, i18n }) => {
  if ([TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status)) return null;
  return (
    <ContentButton
      TooltipProps={{
        title: i18n('pause', 'common', 'buttons'),
      }}
      ButtonProps={{
        key: 'pause',
        sx: ButtonStyle,
        color: ColorLevel.warning,
        onClick: $event => onClick('pause', QueryService.pauseTask(task.id), $event),
        disabled: isDisabled,
      }}
    >
      <IconLoader icon={<PauseIcon />} loading={loadingIcon?.pause} props={{ size: '1rem', color: ColorLevel.warning }} />
    </ContentButton>
  );
};

export type TaskItemProps = {
  task: Task;
  setTaskEdit: TaskDetailProps['setTaskEdit'];
  setConfirmation: TaskDetailProps['setConfirmation'];
  hideStatus?: boolean;
  accordion: ContentItemAccordionProps;
  className?: string;
};
const TaskItemComponent: ForwardRefRenderFunction<HTMLDivElement, TaskItemProps> = (
  { task, hideStatus, setTaskEdit, setConfirmation, accordion, className },
  ref,
) => {
  const i18n = useI18n('panel', 'content', 'task', 'item');
  const [expanded, setExpanded] = useState(false);
  const [hover, setHover] = useState(false);

  // Loading state
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingIcon, setLoadingIcon] = useState<Record<string, boolean>>({});

  // Loading observable for debounce
  const [, next] = useDebounceObservable<Record<string, boolean>>(setLoadingIcon);

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
            LoggerService.error(`Task action '${button}' failed.`, error);
            NotificationService.error({
              title: i18n(`task_${button}_fail`, 'common', 'error'),
              message: error?.message ?? error?.name ?? '',
            });
          }
        },
      });
  };

  const isDisabled = Object.values(loading).some(Boolean);

  const showBackground = useSelector<StoreState, GlobalSettings['task']>(getGlobalTask)?.background;
  const background: ProgressBackgroundProps = showBackground
    ? {
        primary: `${ColorLevelMap[taskStatusToColor(task)]}${hover ? 30 : 20}`,
        progress: task.progress ?? 0,
      }
    : {};

  const DeleteButton = (
    <ContentButton
      TooltipProps={{
        title: i18n('delete', 'common', 'buttons'),
      }}
      ButtonProps={{
        key: 'delete',
        sx: ButtonStyle,
        color: ColorLevel.error,
        disabled: isDisabled,
        onClick: $event => {
          $event.stopPropagation();
          setConfirmation({
            open: true,
            title: i18n('confirmation_title'),
            description: i18n('confirmation_description'),
            callback: () => onClick('delete', QueryService.deleteTask(task.id), $event),
          });
        },
      }}
    >
      <IconLoader icon={<DeleteIcon />} loading={loadingIcon?.delete} props={{ size: '1rem', color: ColorLevel.error }} />
    </ContentButton>
  );

  const buttonProps = { task, loadingIcon, onClick, i18n };

  const buttons = (
    <>
      {DeleteButton}
      {<PauseButton {...buttonProps} isDisabled={task.stopping || isDisabled} />}
      {<PlayOrRetry {...buttonProps} isDisabled={task.stopping || isDisabled} />}
    </>
  );

  return (
    <ContentItem
      ref={ref}
      className={className}
      accordion={accordion}
      onHover={_visible => setHover(_visible)}
      onToggle={_expanded => setExpanded(_expanded)}
      background={background}
      summary={{
        card: <TaskCard task={task} hideStatus={hideStatus} expanded={expanded} hover={hover} />,
        buttons,
      }}
      details={
        <TaskDetail
          task={task}
          isDisabled={isDisabled}
          loadingIcon={loadingIcon}
          buttonClick={onClick}
          setTaskEdit={setTaskEdit}
          setConfirmation={setConfirmation}
        />
      }
    />
  );
};

export const TaskItem = forwardRef(TaskItemComponent);
