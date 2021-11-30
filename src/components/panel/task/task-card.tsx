import React from 'react';
import { Avatar, Grid, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LoopIcon from '@mui/icons-material/Loop';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import UploadIcon from '@mui/icons-material/Upload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { computeEta, computeProgress, formatBytes, Task, TaskStatus, taskStatusToColor } from '../../../models';
import { blue, green, orange, purple, red } from '@mui/material/colors';
import ProgressBar from '../../progress-bar/progress-bar';

export const TaskCard = ({ task, statuses }: { task: Task; statuses?: TaskStatus[] }) => {
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
        sx={{ maxWidth: '100vw', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflowX: 'hidden' }}
        primary={task.title}
        primaryTypographyProps={{ component: 'span' }}
        secondary={
          <React.Fragment>
            <Grid container>
              <Grid item xs={10}>
                {(!statuses || statuses?.length > 1) && (
                  <React.Fragment>
                    <span>{task.status.toUpperCase()}</span>
                    <span> – </span>
                  </React.Fragment>
                )}
                {[TaskStatus.downloading, TaskStatus.seeding].includes(task.status) && (
                  <React.Fragment>
                    <span>{computeEta(task) ? `${computeEta(task)} remaining` : 'no estimates'}</span>
                    <span> – </span>
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
            <ProgressBar
              variant={[TaskStatus.seeding, TaskStatus.extracting, TaskStatus.finishing].includes(task.status) ? 'indeterminate' : 'determinate'}
              value={computeProgress(task.additional?.transfer?.size_downloaded, task.size)}
              color={taskStatusToColor(task.status)}
            />
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
