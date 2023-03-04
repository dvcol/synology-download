import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LoopIcon from '@mui/icons-material/Loop';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import UploadIcon from '@mui/icons-material/Upload';
import { blue, green, orange, purple, red } from '@mui/material/colors';

import React from 'react';

import { useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import type { Global, Task } from '@src/models';
import { TaskStatus, taskStatusToColor } from '@src/models';

import type { StoreState } from '@src/store';
import { getGlobalTask } from '@src/store/selectors';
import { formatBytes } from '@src/utils';

import { ContentCard } from '../content-card';

import type { FC } from 'react';

type TaskCardProps = { task: Task; hideStatus?: boolean; expanded?: boolean; hover?: boolean };
export const TaskCard: FC<TaskCardProps> = ({ task, hideStatus, expanded, hover }) => {
  const i18n = useI18n('panel', 'content', 'task', 'card');

  const statusIcon = (status: TaskStatus): JSX.Element => {
    switch (status) {
      case TaskStatus.waiting:
        return <AccessTimeIcon />;
      case TaskStatus.downloading:
        return <DownloadIcon />;
      case TaskStatus.paused:
        return <PauseCircleOutlineIcon />;
      case TaskStatus.finished:
        return <DownloadDoneIcon />;
      case TaskStatus.seeding:
        return <UploadIcon />;
      case TaskStatus.error:
        return <ErrorOutlineIcon />;
      default:
        return <LoopIcon />;
    }
  };

  const avatarBgColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.downloading:
        return blue[500];
      case TaskStatus.paused:
        return orange[100];
      case TaskStatus.finished:
        return green[500];
      case TaskStatus.seeding:
        return purple[500];
      case TaskStatus.error:
        return red[500];
      default:
        return blue[100];
    }
  };

  const getEstimatedSpeed = (_task: Task) => {
    if (!_task.speed) return;
    const bytes = formatBytes(_task.speed);
    if (!bytes) return;
    return <span>{bytes}/s</span>;
  };

  const showProgressBar = useSelector<StoreState, Global['task']>(getGlobalTask)?.progressBar;
  return (
    <ContentCard
      title={task.title}
      icon={statusIcon(task.status)}
      iconBackground={avatarBgColor(task.status)}
      description={
        <>
          {!hideStatus && (
            <React.Fragment>
              <span>{i18n(task.status, 'common', 'model', 'task_status')}</span>
              <span> – </span>
            </React.Fragment>
          )}
          {task.status_extra?.error_detail && (
            <React.Fragment>
              <span>{i18n(task.status_extra.error_detail.toLowerCase(), 'common', 'model', 'task_error')}</span>
              <span> – </span>
            </React.Fragment>
          )}
          {[TaskStatus.downloading, TaskStatus.seeding].includes(task.status) && (
            <React.Fragment>
              <span>{task.eta ? `${task.eta} ${i18n('remaining')}` : i18n('no_estimates')}</span>
              <span> – </span>
            </React.Fragment>
          )}
          <span>
            {formatBytes(task.received)} of {formatBytes(task.size)} downloaded
          </span>
        </>
      }
      progress={getEstimatedSpeed(task)}
      progressBar={
        showProgressBar
          ? {
              props: {
                variant: [TaskStatus.seeding, TaskStatus.extracting, TaskStatus.finishing].includes(task.status) ? 'indeterminate' : 'determinate',
                color: taskStatusToColor(task.status),
              },
              value: task.progress ?? 0,
              percentage: expanded || !hover,
            }
          : undefined
      }
    />
  );
};

export default TaskCard;
