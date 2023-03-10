import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import StopIcon from '@mui/icons-material/Stop';
import { Box, Button, Grid, ListItem, ListItemText, Typography } from '@mui/material';

import React from 'react';

import type { i18n } from '@dvcol/web-extension-utils';
import { useI18n } from '@dvcol/web-extension-utils';

import { IconLoader, ProgressBar } from '@src/components';
import type { Task } from '@src/models';
import { ColorLevel, TaskStatus } from '@src/models';
import { QueryService } from '@src/services';

import { computeProgress, dateToLocalString, formatBytes } from '@src/utils';

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
  if (task.additional?.file?.length) {
    files = task.additional.file.map((f, i) => (
      <ListItem key={`${i}-${f.filename}`}>
        <ListItemText
          primary={
            <Grid container>
              <Grid item xs={9}>
                <span>{i18n(f.wanted ? f.priority : 'skip', 'common', 'model', 'task_priority')}</span>
                <span> – </span>
                <span>{f.filename}</span>
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
      content={files ? <>{files}</> : undefined}
    />
  );
};

export default TaskDetail;
