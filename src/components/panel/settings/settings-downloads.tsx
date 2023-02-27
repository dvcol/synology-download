import { Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { FormSwitch } from '@src/components';
import type { Downloads } from '@src/models';
import { defaultDownloads, InterfaceHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { syncDownloads } from '@src/store/actions';
import { getSettingsDownloads } from '@src/store/selectors';

export const SettingsDownloads = () => {
  const i18n = useI18n('panel', 'settings', 'downloads');
  const dispatch = useDispatch();
  const state = useSelector<StoreState, Downloads>(getSettingsDownloads);

  const {
    handleSubmit,
    reset,
    control,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<Downloads>({
    mode: 'onChange',
    defaultValues: {
      ...state,
      enabled: state.enabled ?? defaultDownloads.enabled,
    },
  });

  const onSubmit = (data: Downloads) => {
    dispatch(syncDownloads(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={InterfaceHeader.downloads}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent></CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '5rem' }}
            type="submit"
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
