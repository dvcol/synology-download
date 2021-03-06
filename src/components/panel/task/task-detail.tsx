import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button, Card, Grid, ListItem, ListItemText, Stack, Typography } from '@mui/material';

import React from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

import { ConfirmationDialog, IconLoader, ProgressBar } from '@src/components';
import type { Task } from '@src/models';
import { computeProgress, formatBytes, TaskStatus } from '@src/models';
import { QueryService } from '@src/services';

import { TaskEdit } from './task-edit';

import type { Observable } from 'rxjs';

export const TaskDetail = ({
  task,
  loading,
  loadingIcon,
  buttonClick,
}: {
  task: Task;
  loading: Record<string, boolean>;
  loadingIcon: Record<string, boolean>;
  buttonClick: (button: string, request: Observable<any>, $event?: React.MouseEvent, delay?: number) => void;
}) => {
  const i18n = useI18n('panel', 'task', 'detail');
  const [prompt, setPrompt] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const isDisabled = () => Object.values(loading).some(Boolean);

  const createdTime = task.additional?.detail?.create_time ? new Date(task.additional.detail.create_time * 1000) : undefined;
  const createdAt = createdTime
    ? `${createdTime.toLocaleDateString()} ${createdTime.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : '';
  return (
    <Typography component="span" variant="body2">
      <Grid container sx={{ alignItems: 'center' }}>
        <Grid item xs={5}>
          <Typography variant="caption" component="div">
            {`${i18n('created')} :\t${createdAt}${i18n({ key: 'created_by', substitutions: [task.username] })}`}
          </Typography>
          <Typography variant="caption" component="div">
            {`${i18n('destination')} :\t${task.additional?.detail?.destination}`}
          </Typography>
        </Grid>
        <Grid item xs={7} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<IconLoader icon={<PlayArrowIcon />} loading={loadingIcon?.play} props={{ size: '1.25rem', color: 'success' }} />}
              variant="contained"
              color={TaskStatus.finished === task.status ? 'secondary' : 'success'}
              onClick={() => buttonClick('play', QueryService.resumeTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status)}
            >
              {i18n(TaskStatus.finished === task.status ? 'seed' : 'play', 'common', 'buttons')}
            </Button>
            <Button
              startIcon={<IconLoader icon={<PauseIcon />} loading={loadingIcon?.pause} props={{ size: '1.25rem', color: 'warning' }} />}
              variant="contained"
              color="warning"
              onClick={() => buttonClick('pause', QueryService.pauseTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status)}
            >
              {i18n('pause', 'common', 'buttons')}
            </Button>
            <Button
              startIcon={<IconLoader icon={<EditIcon />} loading={loadingIcon?.edit} props={{ size: '1.25rem', color: 'secondary' }} />}
              variant="outlined"
              color="secondary"
              onClick={() => setOpenEdit(true)}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused].includes(task.status)}
            >
              {i18n('edit', 'common', 'buttons')}
            </Button>
            <TaskEdit open={openEdit} task={task} onFormCancel={() => setOpenEdit(false)} onFormSubmit={() => setOpenEdit(false)} />
            <Button
              startIcon={<IconLoader icon={<DeleteIcon />} loading={loadingIcon?.delete} props={{ size: '1.25rem', color: 'error' }} />}
              variant="outlined"
              color="error"
              disabled={isDisabled()}
              onClick={() => setPrompt(true)}
            >
              {i18n('delete', 'common', 'buttons')}
            </Button>
            <ConfirmationDialog
              open={prompt}
              title={i18n('confirmation_title')}
              description={i18n('confirmation_description')}
              onCancel={() => setPrompt(false)}
              onConfirm={() => {
                setPrompt(false);
                buttonClick('delete', QueryService.deleteTask(task.id), undefined, 0);
              }}
            />
          </Stack>
        </Grid>
      </Grid>
      {!!task.additional?.file?.length && (
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
                      <span> ??? </span>
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
      )}
    </Typography>
  );
};

export default TaskDetail;
