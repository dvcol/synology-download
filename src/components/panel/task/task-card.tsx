import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LoopIcon from '@mui/icons-material/Loop';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import UploadIcon from '@mui/icons-material/Upload';
import { Avatar, Grid, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { blue, green, orange, purple, red } from '@mui/material/colors';

import React from 'react';

import { useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { ProgressBar } from '@src/components';
import type { Global, Task } from '@src/models';
import { computeEta, computeProgress, formatBytes, TaskStatus, taskStatusToColor } from '@src/models';
import type { StoreState } from '@src/store';
import { getGlobalTask } from '@src/store/selectors';

export const TaskCard = ({ task, statuses, expanded, visible }: { task: Task; statuses?: TaskStatus[]; expanded?: boolean; visible?: boolean }) => {
  const i18n = useI18n('panel', 'task', 'card');
  const showProgressBar = useSelector<StoreState, Global['task']>(getGlobalTask)?.progressBar;

  const statusIcon = (status: TaskStatus): React.ReactNode => {
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

  return (
    <ListItem sx={{ minWidth: '40rem', padding: '0.5rem 1rem' }} dense={true}>
      <ListItemAvatar sx={{ minWidth: 66 }}>
        <Avatar sx={{ width: 50, height: 50, bgcolor: avatarBgColor(task.status) }}>{statusIcon(task.status)}</Avatar>
      </ListItemAvatar>
      <ListItemText
        sx={{ maxWidth: '100vw', whiteSpace: 'nowrap' }}
        primary={task.title}
        primaryTypographyProps={{
          component: 'span',
          sx: {
            maxWidth: expanded ? '100%' : 'calc(100vw - 136px)',
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'non' : '3',
            WebkitBoxOrient: 'vertical',
          },
        }}
        secondary={
          <React.Fragment>
            <Grid container>
              <Grid item xs={10}>
                {(!statuses || statuses?.length > 1) && (
                  <React.Fragment>
                    <span>{task.status.toUpperCase()}</span>
                    <span> ??? </span>
                  </React.Fragment>
                )}
                {[TaskStatus.downloading, TaskStatus.seeding].includes(task.status) && (
                  <React.Fragment>
                    <span>{computeEta(task) ? `${computeEta(task)} ${i18n('remaining')}` : i18n('no_estimates')}</span>
                    <span> ??? </span>
                  </React.Fragment>
                )}
                <span>
                  {formatBytes(task.additional?.transfer?.size_downloaded)} of {formatBytes(task.size)} downloaded
                </span>
              </Grid>
              <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span>{formatBytes(task.additional?.transfer?.speed_download)}/s</span>
              </Grid>
            </Grid>
            {showProgressBar && (
              <ProgressBar
                props={{
                  variant: [TaskStatus.seeding, TaskStatus.extracting, TaskStatus.finishing].includes(task.status) ? 'indeterminate' : 'determinate',
                  color: taskStatusToColor(task.status),
                }}
                value={computeProgress(task.additional?.transfer?.size_downloaded, task.size)}
                percentage={expanded || !visible}
              />
            )}
          </React.Fragment>
        }
        secondaryTypographyProps={{
          component: 'span',
          variant: 'caption',
          color: 'text.secondary',
          sx: { display: 'inline' },
        }}
      />
    </ListItem>
  );
};

export default TaskCard;
