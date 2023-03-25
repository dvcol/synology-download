import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Button, Grid, LinearProgress, ListItem, ListItemText, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { exhaustMap, finalize, map, timer } from 'rxjs';

import { IconLoader, ProgressBar } from '@src/components';
import type { RootSlice, Task, TaskFile } from '@src/models';
import { ColorLevel, TaskStatus, TaskType } from '@src/models';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import { getPollingInterval, getTaskFilesById } from '@src/store/selectors';
import type { i18n } from '@src/utils';
import { useI18n, before, computeProgress, dateToLocalString, formatBytes, useDebounceObservable } from '@src/utils';

import ContentDetail from '../content-detail';

import type { Dispatch, FC, SetStateAction } from 'react';
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
      <Typography variant="caption" component="div" sx={{ pt: Url ? '0.25em' : undefined }}>
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

export type TaskEditState = { open: boolean; task?: Task };
export type ConfirmationState = { open: boolean; title?: string; description?: string; callback?: () => void };

export type TaskDetailProps = {
  task: Task;
  isDisabled: boolean;
  loadingIcon: Record<string, boolean>;
  buttonClick: (button: string, request: Observable<any>, $event?: React.MouseEvent, delay?: number) => void;
  setTaskEdit: Dispatch<SetStateAction<TaskEditState>>;
  setConfirmation: Dispatch<SetStateAction<ConfirmationState>>;
};

type TaskDetailGenericButtonProps = {
  i18n: typeof i18n;
  isDisabled: boolean;
  loadingIcon: Record<string, boolean>;
  buttonName: string;
  buttonColor: ColorLevel;
  buttonIcon: JSX.Element;
  buttonClick: () => void;
};
const TaskDetailGenericButton: FC<TaskDetailGenericButtonProps> = ({
  isDisabled,
  loadingIcon,
  i18n,
  buttonName,
  buttonColor,
  buttonIcon,
  buttonClick,
}) => {
  return (
    <>
      <Button
        startIcon={<IconLoader icon={buttonIcon} loading={loadingIcon?.[buttonName]} props={{ size: '1.25rem', color: buttonColor }} />}
        variant="outlined"
        color={buttonColor}
        onClick={() => buttonClick()}
        disabled={isDisabled}
      >
        {i18n(buttonName, 'common', 'buttons')}
      </Button>
    </>
  );
};

type TaskDetailButtonProps = TaskDetailProps & Pick<TaskDetailGenericButtonProps, 'i18n' | 'isDisabled' | 'loadingIcon'>;

const PlayOrSeedOrRetry: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, buttonClick, i18n }) => {
  if (![TaskStatus.paused, TaskStatus.finished, TaskStatus.error].includes(task.status)) return null;

  let playOrSeedOrRetry: 'play' | 'seed' | 'retry' = 'play';
  if (TaskStatus.finished === task.status) playOrSeedOrRetry = 'seed';
  if (TaskStatus.error === task.status) playOrSeedOrRetry = 'retry';
  return (
    <TaskDetailGenericButton
      i18n={i18n}
      isDisabled={isDisabled}
      loadingIcon={loadingIcon}
      buttonName={playOrSeedOrRetry}
      buttonColor={playOrSeedOrRetry === 'play' ? ColorLevel.success : ColorLevel.secondary}
      buttonIcon={playOrSeedOrRetry === 'retry' ? <ReplayIcon /> : <PlayArrowIcon />}
      buttonClick={() => buttonClick('play', QueryService.resumeTask(task.id))}
    />
  );
};

const PauseButton: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, buttonClick, i18n }) => {
  if (![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status)) return null;

  return (
    <TaskDetailGenericButton
      i18n={i18n}
      isDisabled={isDisabled}
      loadingIcon={loadingIcon}
      buttonName={'pause'}
      buttonColor={ColorLevel.warning}
      buttonIcon={<PauseIcon />}
      buttonClick={() => buttonClick('pause', QueryService.pauseTask(task.id))}
    />
  );
};

const EditButton: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, i18n, setTaskEdit }) => {
  if (![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused, TaskStatus.seeding].includes(task.status)) return null;

  return (
    <TaskDetailGenericButton
      i18n={i18n}
      isDisabled={isDisabled}
      loadingIcon={loadingIcon}
      buttonName={'edit'}
      buttonColor={ColorLevel.secondary}
      buttonIcon={<EditIcon />}
      buttonClick={() => setTaskEdit({ open: true, task })}
    />
  );
};

const StopButton: FC<TaskDetailButtonProps> = ({ task, isDisabled, loadingIcon, buttonClick, setConfirmation, i18n }) => {
  if (TaskStatus.downloading !== task.status || !task.received) return null;

  return (
    <TaskDetailGenericButton
      i18n={i18n}
      isDisabled={isDisabled}
      loadingIcon={loadingIcon}
      buttonName={'stop'}
      buttonColor={ColorLevel.error}
      buttonIcon={<StopIcon />}
      buttonClick={() =>
        setConfirmation({
          open: true,
          title: i18n('confirmation_title'),
          description: i18n('stop__confirmation_description'),
          callback: () => buttonClick('stop', QueryService.stopTask(task.id)),
        })
      }
    />
  );
};

export const TaskDetail: FC<TaskDetailProps> = props => {
  const { task, isDisabled, loadingIcon, buttonClick, setConfirmation } = props;
  const i18n = useI18n('panel', 'content', 'task', 'detail');
  const taskFiles = useSelector<RootSlice, TaskFile[]>(getTaskFilesById(task.id));

  const polling = useSelector<RootSlice, number>(getPollingInterval);
  const [firstLoad, setFirstLoad] = useState<boolean>(task.type === TaskType.bt);
  const [loadingBar, setLoadingBar] = useState<boolean>(task.type === TaskType.bt);

  const showLoadingBar = loadingBar && (firstLoad || taskFiles?.length);

  // Loading observable for debounce
  const [, next] = useDebounceObservable<boolean>(setLoadingBar, 200);

  useEffect(() => {
    if (task.type !== TaskType.bt) return;
    const sub = timer(0, polling * 2)
      .pipe(
        exhaustMap(() =>
          QueryService.listTaskFiles(task.id).pipe(
            before(() => {
              next(true);
            }),
            finalize(() => {
              setLoadingBar(false);
              next(false); // So that observable data is not stale
            }),
          ),
        ),
        map((_timer, index) => {
          if (index === 0) setFirstLoad(false);
          return _timer;
        }),
      )
      .subscribe({
        error: error => {
          LoggerService.error(`Failed to fetch files for task '${task.id}'`, { task, error });
          NotificationService.error({
            title: i18n(`task_list_files_fail`, 'common', 'error'),
            message: error?.message ?? error?.name ?? '',
          });
        },
      });

    return () => {
      if (!sub?.closed) sub?.unsubscribe();
    };
  }, []);

  const DeleteButton = (
    <>
      <Button
        startIcon={<IconLoader icon={<DeleteIcon />} loading={loadingIcon?.delete} props={{ size: '1.25rem', color: 'error' }} />}
        variant="outlined"
        color="error"
        disabled={isDisabled}
        onClick={() =>
          setConfirmation({
            open: true,
            title: i18n('confirmation_title'),
            description: i18n('delete__confirmation_description'),
            callback: () => buttonClick('delete', QueryService.deleteTask(task.id), undefined, 0),
          })
        }
      >
        {i18n('delete', 'common', 'buttons')}
      </Button>
    </>
  );

  let files = null;
  if (taskFiles?.length) {
    files = taskFiles.map(f => (
      <ListItem key={`${f.index}-${f.name ?? f.filename}`}>
        <ListItemText
          primary={
            <Grid container>
              <Grid item xs={9}>
                <span>{i18n(f.wanted ? f.priority : 'skip', 'common', 'model', 'task_priority')}</span>
                <span> – </span>
                <span>{f.name ?? f.filename}</span>
              </Grid>
              <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
    ));
  }

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
        <>
          {taskFiles?.length > 100 && (
            <Typography color={ColorLevel.warning} variant="subtitle2">
              {i18n('files_limit')}
            </Typography>
          )}
          <LinearProgress
            variant={'indeterminate'}
            sx={{
              height: showLoadingBar ? '0.125em' : 0,
              transition: 'height 0.3s linear',
              position: 'sticky',
              top: '0',
            }}
          />
          {files ? <>{files}</> : undefined}
        </>
      }
    />
  );
};

export default TaskDetail;
