import React, { useState } from 'react';
import { Button, Container, Grid, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { computeProgress, formatBytes, Task, TaskStatus } from '../../../models';
import PauseIcon from '@mui/icons-material/Pause';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { isDarkTheme } from '../../../themes';
import { grey } from '@mui/material/colors';
import ProgressBar from '../../progress-bar/progress-bar';
import { synologyClient } from '../../../services';
import { finalize, Observable } from 'rxjs';
import { useDispatch } from 'react-redux';
import { setTasks } from '../../../store';

export const TaskDetail = ({ task }: { task: Task }) => {
  const dispatch = useDispatch();

  const [loading, setLoading]: [Record<string, boolean>, any] = useState({});

  const onClick = (button: string, request: Observable<any>) => () => {
    setLoading({ ...loading, [button]: true });
    request
      .pipe(
        finalize(() =>
          setLoading({
            ...loading,
            [button]: false,
          })
        )
      )
      .subscribe(() => synologyClient.listTasks().subscribe((res) => dispatch(setTasks(res?.data?.tasks))));
  };

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
              startIcon={loading.play ? <CircularProgress size={'1.25rem'} color="success" /> : <PlayArrowIcon />}
              variant="contained"
              color="success"
              onClick={onClick('play', synologyClient.resumeTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.paused, TaskStatus.finished].includes(task.status)}
            >
              Play
            </Button>
            <Button
              startIcon={loading.pause ? <CircularProgress size={'1.25rem'} color="warning" /> : <PauseIcon />}
              variant="contained"
              color="warning"
              onClick={onClick('pause', synologyClient.pauseTask(task.id))}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status)}
            >
              Pause
            </Button>

            <Button
              startIcon={loading.edit ? <CircularProgress size={'1.25rem'} color="secondary" /> : <EditIcon />}
              variant="outlined"
              color="secondary"
              onClick={onClick('edit', synologyClient.editTask(task.id, 'download'))}
              disabled={isDisabled() || ![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused].includes(task.status)}
            >
              Edit
            </Button>
            <Button
              startIcon={loading.delete ? <CircularProgress size={'1.25rem'} color="error" /> : <DeleteIcon />}
              variant="outlined"
              color="error"
              disabled={isDisabled()}
              onClick={onClick('delete', synologyClient.deleteTask(task.id))}
            >
              Delete
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <Container
        disableGutters
        sx={{
          mt: '1rem',
          maxHeight: '13rem',
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
