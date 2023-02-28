import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, Stack } from '@mui/material';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useI18n } from '@dvcol/web-extension-utils';

import { DownloadItem, TaskItem } from '@src/components';
import type { Content, Download, Task } from '@src/models';
import { AppRoute, ContentSource } from '@src/models';
import type { StoreState } from '@src/store';
import { setNavbar } from '@src/store/actions';
import { getContentsForActiveTab, getTabOrFirst } from '@src/store/selectors';

export const ContentPanel = () => {
  const i18n = useI18n('panel', 'content');
  const tab = useSelector(getTabOrFirst);
  const contents = useSelector<StoreState, Content[]>(getContentsForActiveTab);

  const dispatch = useDispatch();
  const clearTab = () => dispatch(setNavbar());

  return (
    <React.Fragment>
      {contents?.map(item =>
        item.source === ContentSource.Download ? (
          <DownloadItem key={item.id} download={item as Download} hideStatus={(tab?.status?.length ?? 0) <= 1} />
        ) : (
          <TaskItem key={item.id} task={item as Task} hideStatus={(tab?.status?.length ?? 0) <= 1} />
        ),
      )}
      {!contents?.length && (
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
