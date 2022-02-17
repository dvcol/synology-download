import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTabOrFirst, getTasksForActiveTab } from '@src/store/selectors';
import TaskItem from './task-item';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Button, Stack } from '@mui/material';
import { useI18n } from '@src/utils';
import { Link } from 'react-router-dom';
import { InterfaceHeader, SettingHeader } from '@src/models';
import { setNavbar } from '@src/store/actions';

export const TaskPanel = () => {
  const i18n = useI18n('panel', 'task');
  const tab = useSelector(getTabOrFirst);
  const tasks = useSelector(getTasksForActiveTab);

  const dispatch = useDispatch();
  const clearTab = () => dispatch(setNavbar());

  return (
    <React.Fragment>
      {tasks?.map((task) => (
        <TaskItem key={task.id} task={task} status={tab?.status} />
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
              mb: '48px',
            }}
          >
            <InfoOutlinedIcon sx={{ mb: '1rem', width: '3rem', height: '3rem' }} />
            <Box sx={{ mb: '0.25rem' }}>{i18n('no_task_found')}</Box>
            <Box sx={{ mb: '1rem' }}>{i18n('create_or_settings')}</Box>
            <Stack spacing={2} direction="row">
              <Button variant="outlined" color="primary" component={Link} to="/add" sx={{ fontSize: '12px' }} onClick={clearTab}>
                {i18n('create_task')}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                component={Link}
                to={`/settings/${SettingHeader.interface}#${InterfaceHeader.tabs}`}
                sx={{ fontSize: '12px' }}
                onClick={clearTab}
              >
                {i18n('go_to_settings')}
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

export default TaskPanel;
