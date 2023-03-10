import { Grid, List, ListItem, ListItemText, ToggleButton, ToggleButtonGroup } from '@mui/material';

import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { finalize, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import { ProgressBar } from '@src/components';
import type { RootSlice, Task } from '@src/models';
import { TaskPriority } from '@src/models';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import { getTaskById } from '@src/store/selectors';
import { before, computeProgress, useDebounceObservable } from '@src/utils';

import type { FC } from 'react';

type TaskEditFilesProps = { id: string };
export const TaskEditFiles: FC<TaskEditFilesProps> = ({ id }) => {
  const i18n = useI18n('panel', 'content', 'task', 'edit');

  const task = useSelector<RootSlice, Task | undefined>(getTaskById(id));

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});

  // Loading observable for debounce
  const [, next] = useDebounceObservable<Record<string, boolean>>(setLoadingState, 300);

  if (!task?.additional?.file?.length) return null;

  const onChange = (index: number, priority: TaskPriority | 'skip') =>
    QueryService.editTaskFile({
      task_id: task.id,
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
            LoggerService.error(`Failed to change files '${index}' priority for task '${task.id}'`, { index, priority, task, error });
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

  const files = task.additional.file.map((f, i) => (
    <ListItem key={`${i}-${f.filename}`}>
      <ListItemText
        primary={
          <Grid container>
            <Grid item xs={8} sx={{ alignSelf: 'center' }}>
              <span>{f.filename}</span>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'end' }}>
              <ToggleButtonGroup
                color="primary"
                size="small"
                value={f.wanted ? f.priority : 'skip'}
                exclusive
                onChange={(_, size) => onChange(i, size)}
                aria-label="priority"
                sx={{ height: '3em' }}
                disabled={loadingState[i]}
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
          <ProgressBar props={{ variant: loadingState[i] ? 'indeterminate' : 'determinate' }} value={computeProgress(f.size_downloaded, f.size)} />
        }
        secondaryTypographyProps={{ component: 'span' }}
      />
    </ListItem>
  ));

  return <List>{files}</List>;
};
