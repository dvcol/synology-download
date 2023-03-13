import DownloadIcon from '@mui/icons-material/Download';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, MenuItem, Stack } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Subscription } from 'rxjs';

import { localClear, localGet, syncClear, syncGet, useI18n } from '@dvcol/web-extension-utils';

import { ButtonWithConfirm, FormInput, JsonExplorer } from '@src/components';
import type { RootSlice, SyncSettings } from '@src/models';
import { AdvancedHeader, ColorLevel, defaultSyncSettings, SyncSettingMode } from '@src/models';
import { setSyncSettings } from '@src/store/actions';
import { getRoot, getSyncSettings } from '@src/store/selectors';
import { downloadJson } from '@src/utils/downlaod.utils';

export const SettingsChromeStorage = () => {
  const i18n = useI18n('panel', 'settings', 'advanced', 'storage');
  const store = useSelector<RootSlice, RootSlice>(getRoot);

  const syncSettings = useSelector<RootSlice, SyncSettings>(getSyncSettings);

  const { handleSubmit, control } = useForm<SyncSettings>({
    mode: 'onChange',
    defaultValues: {
      ...defaultSyncSettings,
      ...syncSettings,
    },
  });

  const dispatch = useDispatch();

  const onEnableChange = handleSubmit(data => dispatch(setSyncSettings(data)));

  const [sync, setSync] = useState({});
  const [local, setLocal] = useState({});

  useEffect(() => {
    const subs = new Subscription();
    subs.add(syncGet<Record<string, any>>().subscribe(_state => setSync(_state)));
    subs.add(localGet<Record<string, any>>().subscribe(_state => setLocal(_state)));
    return () => {
      if (!subs.closed) subs.unsubscribe();
    };
  }, [store]);

  const exportSnapshot = () => downloadJson({ sync, local }, `synology_download_chrome_storage_snapshot_${new Date().toISOString()}.json`);

  return (
    <Card raised={true}>
      <CardHeader
        id={AdvancedHeader.storage}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          title={i18n('sync_mode_title')}
          subheader={i18n('sync_mode_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: `mode`, control }}
              textFieldProps={{
                select: true,
                label: i18n('sync_mode_label'),
                sx: { flex: '0 0 10rem', textTransform: 'capitalize' },
                onChange: onEnableChange,
              }}
            >
              {Object.values(SyncSettingMode).map(mode => (
                <MenuItem key={mode} value={mode}>
                  {i18n(mode, 'common', 'model', 'sync_mode')}
                </MenuItem>
              ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', maxHeight: '30rem', overflow: 'auto' }}>
          <JsonExplorer data={sync} name={'sync'} />
          <JsonExplorer data={local} name={'local'} />
        </Card>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <ButtonWithConfirm
            buttonLabel={i18n('sync__clear')}
            buttonProps={{ variant: 'outlined', color: ColorLevel.error, sx: { flex: '1 1 auto' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => syncClear().subscribe()}
          />
          <ButtonWithConfirm
            buttonLabel={i18n('local__clear')}
            buttonProps={{ variant: 'outlined', color: ColorLevel.error, sx: { flex: '1 1 auto' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => localClear().subscribe()}
          />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color={ColorLevel.primary} startIcon={<DownloadIcon />} type="submit" onClick={exportSnapshot}>
            {i18n('export')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
