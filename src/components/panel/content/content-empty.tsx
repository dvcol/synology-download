import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { Box, Button, Stack } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import React, { Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useI18n } from '@dvcol/web-extension-utils';

import { AppRoute } from '@src/models';

import { QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { setNavbar } from '@src/store/actions';
import { getLoading, getLogged, getShouldAutoLogin } from '@src/store/selectors';

import type { FC } from 'react';

export const ContentEmpty: FC = () => {
  const i18n = useI18n('panel', 'content', 'empty');
  const logged = useSelector<StoreState, boolean>(getLogged);
  const loading = useSelector<StoreState, number>(getLoading);
  const autoLogin = useSelector<StoreState, boolean>(getShouldAutoLogin);

  const dispatch = useDispatch();

  const clearTab = () => dispatch(setNavbar());

  return (
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
        {!logged ? (
          <Fragment>
            {!loading ? (
              <PowerOffIcon sx={{ mb: '1rem', width: '3rem', height: '3rem' }} />
            ) : (
              <CircularProgress sx={{ mb: '1rem', width: '3rem', height: '3rem' }} />
            )}
            <Box sx={{ mb: '1rem' }}>{i18n('please_login')}</Box>
            <Stack spacing={2} direction="row">
              <Button variant="outlined" color="primary" component={Link} to={AppRoute.Settings} sx={{ fontSize: '0.75rem' }} onClick={clearTab}>
                {i18n('go_to_settings')}
              </Button>
              {autoLogin && (
                <Button
                  variant="outlined"
                  color="secondary"
                  sx={{ fontSize: '0.75rem' }}
                  onClick={() => QueryService.autoLogin({ logged: false }).subscribe()}
                >
                  {i18n('auto_login')}
                </Button>
              )}
            </Stack>
          </Fragment>
        ) : (
          <Fragment>
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
          </Fragment>
        )}
      </Box>
    </Box>
  );
};
