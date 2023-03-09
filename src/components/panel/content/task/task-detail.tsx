import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Button, Card, Grid, ListItem, ListItemText, Typography } from '@mui/material';

import React from 'react';

import type { i18n } from '@dvcol/web-extension-utils';
import { useI18n } from '@dvcol/web-extension-utils';

import { ConfirmationDialog, IconLoader, ProgressBar } from '@src/components';
import type { Task } from '@src/models';
import { TaskStatus } from '@src/models';
import { QueryService } from '@src/services';

import { computeProgress, dateToLocalString, formatBytes } from '@src/utils';

import ContentDetail from '../content-detail';

import { TaskEdit } from './task-edit';

import type { FC } from 'react';
import type { Observable } from 'rxjs';

const TaskTitle: FC<{ task: Task }> = ({ task }) => {
  const i18n = useI18n('panel', 'content', 'task', 'detail');
  let Url = null;
  if (task?.additional?.detail?.uri?.length) {
    Url = (
      <Typography variant="caption" component="div">
        {`${i18n('url')} :\t${task?.additional?.detail?.uri}`}
      </Typography>
    );
  }
  let Folder = null;
  if (task.folder?.length) {
    Folder = (
      <Typography variant="caption" component="div">
        {`${i18n('destination')} :\t${task.folder}`}
      </Typography>
    );
  }

  if (!Url && !Folder) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {Url}
      {Folder}
    </Box>
  );
};

type TaskDetailProps = {
  task: Task;
  isDisabled: boolean;
  loadingIcon: Record<string, boolean>;
  buttonClick: (button: string, request: Observable<any>, $event?: React.MouseEvent, delay?: number) => void;
};

type TaskDetailButtonProps = TaskDetailProps & { i18n: typeof i18n };

const PlayOrSeedOrRetry: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, buttonClick, i18n }) => {
  if (![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status)) return null;

  let playOrSeedOrRetry: 'play' | 'seed' | 'retry' = 'play';
  if (TaskStatus.finished === task.status) playOrSeedOrRetry = 'seed';
  if (TaskStatus.error === task.status) playOrSeedOrRetry = 'retry';
  return (
    <Button
      startIcon={
        <IconLoader
          icon={playOrSeedOrRetry === 'retry' ? <ReplayIcon /> : <PlayArrowIcon />}
          loading={loadingIcon?.play}
          props={{ size: '1.25rem', color: 'success' }}
        />
      }
      variant="contained"
      color={playOrSeedOrRetry === 'play' ? 'success' : 'secondary'}
      onClick={() => buttonClick('play', QueryService.resumeTask(task.id))}
      disabled={isDisabled}
    >
      {i18n(playOrSeedOrRetry, 'common', 'buttons')}
    </Button>
  );
};

const PauseButton: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, buttonClick, i18n }) => {
  if (![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status)) return null;

  return (
    <Button
      startIcon={<IconLoader icon={<PauseIcon />} loading={loadingIcon?.pause} props={{ size: '1.25rem', color: 'warning' }} />}
      variant="contained"
      color="warning"
      onClick={() => buttonClick('pause', QueryService.pauseTask(task.id))}
      disabled={isDisabled}
    >
      {i18n('pause', 'common', 'buttons')}
    </Button>
  );
};

const EditButton: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, i18n }) => {
  const [openEdit, setOpenEdit] = React.useState(false);

  if (![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused, TaskStatus.seeding].includes(task.status)) return null;

  return (
    <>
      <Button
        startIcon={<IconLoader icon={<EditIcon />} loading={loadingIcon?.edit} props={{ size: '1.25rem', color: 'secondary' }} />}
        variant="outlined"
        color="secondary"
        onClick={() => setOpenEdit(true)}
        disabled={isDisabled}
      >
        {i18n('edit', 'common', 'buttons')}
      </Button>
      <TaskEdit open={openEdit} task={task} onFormCancel={() => setOpenEdit(false)} onFormSubmit={() => setOpenEdit(false)} />
    </>
  );
};

const StopButton: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, buttonClick, i18n }) => {
  const [prompt, setPrompt] = React.useState(false);
  if (TaskStatus.downloading !== task.status || !task.received) return null;

  return (
    <>
      <Button
        startIcon={<IconLoader icon={<StopIcon />} loading={loadingIcon?.stop} props={{ size: '1.25rem', color: 'error' }} />}
        variant="outlined"
        color="error"
        disabled={isDisabled}
        onClick={() => setPrompt(true)}
      >
        {i18n('stop', 'common', 'buttons')}
      </Button>
      <ConfirmationDialog
        open={prompt}
        title={i18n('confirmation_title')}
        description={i18n('stop__confirmation_description')}
        onCancel={() => setPrompt(false)}
        onConfirm={() => {
          setPrompt(false);
          buttonClick('stop', QueryService.stopTask(task.id));
        }}
      />
    </>
  );
};

export const TaskDetail: FC<TaskDetailProps> = props => {
  const { task, isDisabled, loadingIcon, buttonClick } = props;
  const i18n = useI18n('panel', 'content', 'task', 'detail');
  const [prompt, setPrompt] = React.useState(false);

  const DeleteButton = (
    <>
      <Button
        startIcon={<IconLoader icon={<DeleteIcon />} loading={loadingIcon?.delete} props={{ size: '1.25rem', color: 'error' }} />}
        variant="outlined"
        color="error"
        disabled={isDisabled}
        onClick={() => setPrompt(true)}
      >
        {i18n('delete', 'common', 'buttons')}
      </Button>
      <ConfirmationDialog
        open={prompt}
        title={i18n('confirmation_title')}
        description={i18n('delete__confirmation_description')}
        onCancel={() => setPrompt(false)}
        onConfirm={() => {
          setPrompt(false);
          buttonClick('delete', QueryService.deleteTask(task.id), undefined, 0);
        }}
      />
    </>
  );

  return (
    <ContentDetail
      title={<TaskTitle task={task} />}
      info={
        <>
          <Typography variant="caption" component="div">
            {`${i18n('type')} :\t${i18n(task.type, 'common', 'model', 'task_type')}`}
          </Typography>
          <Typography variant="caption" component="div">
            {`${i18n('created')} :\t${dateToLocalString(task.createdAt) ?? ''}${i18n({ key: 'created_by', substitutions: [task.username] })}`}
          </Typography>
        </>
      }
      buttons={
        <>
          {!task.stopping && <PlayOrSeedOrRetry i18n={i18n} {...props} />}
          {!task.stopping && <PauseButton i18n={i18n} {...props} />}
          {!task.stopping && <EditButton i18n={i18n} {...props} />}
          {!task.stopping && <StopButton i18n={i18n} {...props} />}
          {DeleteButton}
        </>
      }
      content={
        task.additional?.file?.length ? (
          <Card
            elevation={0}
            sx={{
              mt: '1rem',
              maxHeight: '20rem',
              overflow: 'auto',
            }}
          >
            {task.additional.file.map((f, i) => (
              <ListItem key={`${i}-${f.filename}`}>
                <ListItemText
                  primary={
                    <Grid container>
                      <Grid item xs={8}>
                        <span>{f.priority}</span>
                        <span> – </span>
                        <span>{f.filename}</span>
                      </Grid>
                      <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {i18n({
                          key: 'downloaded',
                          substitutions: [formatBytes(f.size_downloaded), formatBytes(f.size)],
                        })}
                      </Grid>
                    </Grid>
                  }
                  primaryTypographyProps={{
                    component: 'span',
                    variant: 'caption',
                    color: 'text.secondary',
                    sx: { display: 'inline' },
                  }}
                  secondary={<ProgressBar props={{ variant: 'determinate' }} value={computeProgress(f.size_downloaded, f.size)} />}
                  secondaryTypographyProps={{ component: 'span' }}
                />
              </ListItem>
            ))}
          </Card>
        ) : undefined
      }
    />
  );
};

export default TaskDetail;
