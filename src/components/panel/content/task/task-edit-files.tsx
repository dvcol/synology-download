import { Grid, List, ListItem, ListItemText, ToggleButton, ToggleButtonGroup } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { finalize, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import { ProgressBar } from '@src/components';
import type { RootSlice, TaskFile } from '@src/models';
import { TaskPriority } from '@src/models';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import { getTaskFilesById } from '@src/store/selectors';
import { before, computeProgress, useDebounceObservable } from '@src/utils';

import type { FC } from 'react';

type TaskEditFilesProps = { taskId: string };
export const TaskEditFiles: FC<TaskEditFilesProps> = ({ taskId }) => {
  const i18n = useI18n('panel', 'content', 'task', 'edit');

  const taskFiles = useSelector<RootSlice, TaskFile[]>(getTaskFilesById(taskId));

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});

  // Loading observable for debounce
  const [, next] = useDebounceObservable<Record<string, boolean>>(setLoadingState, 300);

  useEffect(() => {
    const sub = QueryService.listTaskFiles(taskId)
      .pipe(
        before(() => {
          setLoading({ ...loading, 'initial-load': true });
          next({ ...loading, 'initial-load': true });
        }),
        finalize(() => {
          setLoading({ ...loading, 'initial-load': false });
          setLoadingState({ ...loading, 'initial-load': false }); // So there is no delay
          next({ ...loading, 'initial-load': false }); // So that observable data is not stale
        }),
      )
      .subscribe({
        error: error => {
          LoggerService.error(`Failed to fetch files for task '${taskId}'`, { taskId, error });
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

  if (!taskFiles?.length) return null;

  const onChange = (index: number, priority: TaskPriority | 'skip') =>
    QueryService.editTaskFile({
      task_id: taskId,
      index: [index],
      wanted: priority === 'skip' ? false : undefined,
      priority: priority !== 'skip' ? priority : undefined,
    })
      .pipe(
        before(() => {
          setLoading({ ...loading, [index]: true });
          next({ ...loading, [index]: true });
        }),
        tap({
          error: error => {
            LoggerService.error(`Failed to change files '${index}' priority for task '${taskId}'`, { index, priority, taskId, error });
            NotificationService.error({
              title: i18n(`task_file_edit_fail`, 'common', 'error'),
              message: error?.message ?? error?.name ?? '',
            });
          },
        }),
        finalize(() => {
          setLoading({ ...loading, [index]: false });
          setLoadingState({ ...loading, [index]: false }); // So there is no delay
          next({ ...loading, [index]: false }); // So that observable data is not stale
        }),
      )
      .subscribe();

  const files = taskFiles.map(f => (
    <ListItem key={`${f.index}-${f.name ?? f.filename}`}>
      <ListItemText
        primary={
          <Grid container>
            <Grid item xs={8} sx={{ alignSelf: 'center' }}>
              <span>{f.name ?? f.filename}</span>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'end' }}>
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={f.wanted ? f.priority : 'skip'}
                exclusive
                onChange={(_, size) => onChange(f.index, size)}
                aria-label="priority"
                sx={{ height: '3em' }}
                disabled={loadingState[f.index]}
              >
                {Object.values(TaskPriority).map(priority => (
                  <ToggleButton key={priority} value={priority} sx={{ textTransform: 'inherit' }}>
                    {i18n(priority, 'common', 'model', 'task_priority')}
                  </ToggleButton>
                ))}
                <ToggleButton key={'skip'} value={'skip'} sx={{ textTransform: 'inherit' }}>
                  {i18n('skip', 'common', 'model', 'task_priority')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        }
        primaryTypographyProps={{
          component: 'span',
          variant: 'caption',
          color: 'text.secondary',
          sx: { display: 'inline' },
        }}
        secondary={
          <ProgressBar
            props={{ variant: loadingState[f.index] ? 'indeterminate' : 'determinate' }}
            value={computeProgress(f.size_downloaded, f.size)}
          />
        }
        secondaryTypographyProps={{ component: 'span' }}
      />
    </ListItem>
  ));

  return <List>{files}</List>;
};
