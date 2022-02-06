import React from 'react';
import { Box, Button, Container, Grid, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { computeProgress, formatBytes, Task, TaskStatus } from '@src/models';
import PauseIcon from '@mui/icons-material/Pause';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { isDarkTheme } from '@src/themes';
import { grey } from '@mui/material/colors';
import { ConfirmationDialog, IconLoader, ProgressBar } from '@src/components';
import { Observable } from 'rxjs';
import { QueryService } from '@src/services';
import { TaskEdit } from './task-edit';
import { useI18n } from '@src/utils';

export const TaskDetail = ({
  task,
  loading,
  buttonClick,
}: {
  task: Task;
  loading: Record<string, boolean>;
  buttonClick: (button: string, request: Observable<any>, $event?: React.MouseEvent, delay?: number) => void;
}) => {
  const i18n = useI18n('panel', 'task', 'detail');
  const [prompt, setPrompt] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const isDisabled = () => Object.values(loading).some(Boolean);

  const createdTime = task.additional?.detail?.create_time ? new Date(task.additional?.detail?.create_time * 1000) : undefined;
  const createdAt = createdTime
    ? i18n({
        key: 'created_at',
        substitutions: [
          `${createdTime.toLocaleDateString()} ${createdTime.toLocaleTimeString(navigator.language, {
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        ],
      })
    : '';
  return (
    <Typography component="span" variant="body2">
      <Grid container sx={{ alignItems: 'center' }}>
        <Grid item xs={4}>
          <Box>{`${i18n('created')}${createdAt}${i18n({ key: 'created_by', substitutions: [task.username] })}`}</Box>
          <Box>{`${i18n('destination')}: ${task.additional?.detail?.destination}`}</Box>
        </Grid>
        <Grid item xs={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<IconLoader icon={<PlayArrowIcon />} loading={loading?.play} props={{ size: '1.25rem', color: 'success' }} />}
              variant="contained"
              color={TaskStatus.finished === task.status ? 'secondary' : 'success'}
              onClick={() => buttonClick('play', QueryService.resumeTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.paused, TaskStatus.finished].includes(task.status)}
            >
              {i18n(TaskStatus.finished === task.status ? 'seed' : 'play', 'common', 'buttons')}
            </Button>
            <Button
              startIcon={<IconLoader icon={<PauseIcon />} loading={loading?.pause} props={{ size: '1.25rem', color: 'warning' }} />}
              variant="contained"
              color="warning"
              onClick={() => buttonClick('pause', QueryService.pauseTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status)}
            >
              {i18n('pause', 'common', 'buttons')}
            </Button>
            <Button
              startIcon={<IconLoader icon={<EditIcon />} loading={loading?.edit} props={{ size: '1.25rem', color: 'secondary' }} />}
              variant="outlined"
              color="secondary"
              onClick={() => setOpenEdit(true)}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused].includes(task.status)}
            >
              {i18n('edit', 'common', 'buttons')}
            </Button>
            <TaskEdit open={openEdit} task={task} onFormCancel={() => setOpenEdit(false)} onFormSubmit={() => setOpenEdit(false)} />
            <Button
              startIcon={<IconLoader icon={<DeleteIcon />} loading={loading?.delete} props={{ size: '1.25rem', color: 'error' }} />}
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
        <Container
          disableGutters
          sx={{
            mt: '1rem',
            maxHeight: '20rem',
            overflow: 'auto',
            bgcolor: isDarkTheme() ? grey[900] : grey[200],
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
                      {i18n({ key: 'downloaded', substitutions: [formatBytes(f.size_downloaded), formatBytes(f.size)] })}
                    </Grid>
                  </Grid>
                }
                primaryTypographyProps={{
                  component: 'span',
                  variant: 'caption',
                  color: 'text.secondary',
                  sx: { display: 'inline' },
                }}
                secondary={<ProgressBar variant="determinate" value={computeProgress(f.size_downloaded, f.size)} />}
                secondaryTypographyProps={{ component: 'span' }}
              />
            </ListItem>
          ))}
        </Container>
      )}
    </Typography>
  );
};

export default TaskDetail;
