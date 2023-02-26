import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, Stack } from '@mui/material';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useI18n } from '@dvcol/web-extension-utils';

import { DownloadItem, TaskItem } from '@src/components';
import type { Download, Task } from '@src/models';
import { AppRoute } from '@src/models';
import type { StoreState } from '@src/store';
import { setNavbar } from '@src/store/actions';
import { getDownloads, getTabOrFirst, getTasksForActiveTab } from '@src/store/selectors';

export const ContentPanel = () => {
  const i18n = useI18n('panel', 'content');
  const tab = useSelector(getTabOrFirst);
  const tasks = useSelector<StoreState, Task[]>(getTasksForActiveTab);
  const downloads = useSelector<StoreState, Download[]>(getDownloads);

  const dispatch = useDispatch();
  const clearTab = () => dispatch(setNavbar());

  return (
    <React.Fragment>
      {downloads?.map(download => (
        <DownloadItem key={download.id} download={download} hideStatus={(tab?.status?.length ?? 0) > 1} />
      ))}
      {tasks?.map(task => (
        <TaskItem key={task.id} task={task} hideStatus={(tab?.status?.length ?? 0) > 1} />
      ))}
      {!tasks?.length && (
        <Box
          sx={{
            height: '100%',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: '1 1 auto',
              mb: '3rem',
            }}
          >
            <InfoOutlinedIcon sx={{ mb: '1rem', width: '3rem', height: '3rem' }} />
            <Box sx={{ mb: '0.25rem' }}>{i18n('no_task_found')}</Box>
            <Box sx={{ mb: '1rem' }}>{i18n('create_or_settings')}</Box>
            <Stack spacing={2} direction="row">
              <Button variant="outlined" color="primary" component={Link} to={AppRoute.Add} sx={{ fontSize: '0.75rem' }} onClick={clearTab}>
                {i18n('create_task')}
              </Button>
              <Button variant="outlined" color="secondary" component={Link} to={AppRoute.Settings} sx={{ fontSize: '0.75rem' }} onClick={clearTab}>
                {i18n('go_to_settings')}
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};
