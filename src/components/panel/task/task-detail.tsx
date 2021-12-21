import React from 'react';
import { Button, Container, Grid, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { computeProgress, formatBytes, Task, TaskStatus } from '../../../models';
import PauseIcon from '@mui/icons-material/Pause';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { isDarkTheme } from '../../../themes';
import { grey } from '@mui/material/colors';
import ProgressBar from '../../ui-element/progress-bar';
import { Observable } from 'rxjs';
import { QueryService } from '../../../services';
import { ConfirmationDialog } from '../../dialog';
import { IconLoader } from '../../ui-element';
import { TaskEdit } from './task-edit';

export const TaskDetail = ({
  task,
  loading,
  buttonClick,
}: {
  task: Task;
  loading: Record<string, boolean>;
  buttonClick: (button: string, request: Observable<any>, $event?: React.MouseEvent, delay?: number) => void;
}) => {
  const [prompt, setPrompt] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const isDisabled = () => Object.values(loading).some(Boolean);
  return (
    <Typography component="span" variant="body2">
      <Grid container sx={{ alignItems: 'center' }}>
        <Grid item xs={4}>
          <span>Destination: {task.additional?.detail?.destination}</span>
        </Grid>
        <Grid item xs={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<IconLoader icon={<PlayArrowIcon />} loading={loading?.play} props={{ size: '1.25rem', color: 'success' }} />}
              variant="contained"
              color="success"
              onClick={() => buttonClick('play', QueryService.resumeTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.paused, TaskStatus.finished].includes(task.status)}
            >
              Play
            </Button>
            <Button
              startIcon={<IconLoader icon={<PauseIcon />} loading={loading?.pause} props={{ size: '1.25rem', color: 'warning' }} />}
              variant="contained"
              color="warning"
              onClick={() => buttonClick('pause', QueryService.pauseTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status)}
            >
              Pause
            </Button>
            <Button
              startIcon={<IconLoader icon={<EditIcon />} loading={loading?.edit} props={{ size: '1.25rem', color: 'secondary' }} />}
              variant="outlined"
              color="secondary"
              onClick={() => setOpenEdit(true)}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused].includes(task.status)}
            >
              Edit
            </Button>{' '}
            <TaskEdit open={openEdit} task={task} onFormCancel={() => setOpenEdit(false)} onFormSubmit={() => setOpenEdit(false)} />
            <Button
              startIcon={<IconLoader icon={<DeleteIcon />} loading={loading?.delete} props={{ size: '1.25rem', color: 'error' }} />}
              variant="outlined"
              color="error"
              disabled={isDisabled()}
              onClick={() => setPrompt(true)}
            >
              Delete
            </Button>
            <ConfirmationDialog
              open={prompt}
              title={'Please confirm'}
              description={'This action will permanently remove this task.'}
              onCancel={() => setPrompt(false)}
              onConfirm={() => {
                setPrompt(false);
                buttonClick('delete', QueryService.deleteTask(task.id), undefined, 0);
              }}
            />
          </Stack>
        </Grid>
      </Grid>
      <Container
        disableGutters
        sx={{
          mt: '1rem',
          maxHeight: '20rem',
          overflow: 'auto',
          bgcolor: isDarkTheme() ? grey[900] : grey[200],
        }}
      >
        {task.additional?.file?.map((f, i) => (
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
                    {formatBytes(f.size_downloaded)} of {formatBytes(f.size)} downloaded
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
    </Typography>
  );
};

export default TaskDetail;
