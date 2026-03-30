import type { SyncSettings } from '../../../../models/settings.model';
import type { RootSlice, SettingsSlice } from '../../../../models/store.model';

import DownloadIcon from '@mui/icons-material/Download';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Typography } from '@mui/material';
import { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { firstValueFrom, Subscription } from 'rxjs';

import { ColorLevel, ColorLevelCss } from '../../../../models/material-ui.model';
import { AdvancedHeader, defaultSettings, defaultSyncSettings, SyncSettingMode } from '../../../../models/settings.model';
import { setSyncSettings, syncSettings } from '../../../../store/actions/settings.action';
import { ContainerContext } from '../../../../store/context/container.context';
import { getRoot } from '../../../../store/selectors/root.selector';
import { getSyncSettings } from '../../../../store/selectors/settings.selector';
import { settingsSlice } from '../../../../store/slices/settings.slice';
import { downloadJson } from '../../../../utils/downlaod.utils';
import { localClear, localGet, syncClear, syncGet, useI18n } from '../../../../utils/webex.utils';
import { ButtonWithConfirm } from '../../../common/button/button-with-confirm';
import { JsonExplorer } from '../../../common/explorer/json/json-explorer';
import { FormInput } from '../../../common/form/form-input';

export function SettingsChromeStorage() {
  const i18n = useI18n('panel', 'settings', 'advanced', 'storage');

  const store = useSelector<RootSlice, RootSlice>(getRoot);
  const syncSettingsState = useSelector<RootSlice, SyncSettings>(getSyncSettings);

  const { containerRef } = use(ContainerContext);

  const [sync, setSync] = useState({});
  const [local, setLocal] = useState({});
  const [prompt, setPrompt] = useState(false);

  useEffect(() => {
    const subs = new Subscription();
    subs.add(syncGet<Record<string, any>>().subscribe(_state => setSync(_state)));
    subs.add(localGet<Record<string, any>>().subscribe(_state => setLocal(_state)));
    return () => {
      if (!subs.closed) subs.unsubscribe();
    };
  }, [store]);

  const { handleSubmit, control, getValues, reset } = useForm<SyncSettings>({
    mode: 'onChange',
    defaultValues: {
      ...defaultSyncSettings,
      ...syncSettingsState,
    },
  });

  const dispatch = useDispatch();

  const onModeChange = handleSubmit((data) => {
    if (data.mode === SyncSettingMode.local) return dispatch(setSyncSettings(data));
    setPrompt(true);
  });

  const onPromptCancel = () => {
    setPrompt(false);
    reset({ ...getValues(), mode: SyncSettingMode.local });
  };
  const onPromptConfirm = async (action: 'erase' | 'import') => {
    setPrompt(false);
    // overwrite sync with local
    if (action === 'erase') return dispatch(setSyncSettings(getValues()));
    // import from sync
    const settings = await firstValueFrom(syncGet<SettingsSlice>(settingsSlice.name));
    return dispatch(syncSettings({ ...defaultSettings, ...settings }));
  };

  const exportSnapshot = () => downloadJson({ sync, local }, `synology_download_chrome_storage_snapshot_${new Date().toISOString()}.json`);

  return (
    <Card raised={true}>
      <CardHeader
        id={AdvancedHeader.storage}
        title={i18n('title')}
        subheader={i18n('subheader')}
        slotProps={{ title: { variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } } }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          title={i18n('sync_mode_title')}
          subheader={i18n('sync_mode_subheader')}
          slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
          action={(
            <FormInput
              controllerProps={{ name: 'mode', control }}
              textFieldProps={{
                select: true,
                label: i18n('sync_mode_label'),
                sx: { flex: '0 0 10rem', textTransform: 'capitalize' },
                onChange: onModeChange,
              }}
            >
              {Object.values(SyncSettingMode).map(mode => (
                <MenuItem key={mode} value={mode}>
                  {i18n(mode, 'common', 'model', 'sync_mode')}
                </MenuItem>
              ))}
            </FormInput>
          )}
          sx={{ p: '0.5rem 0' }}
        />
        <Dialog open={prompt} onClose={onPromptCancel} aria-labelledby="confirm-sync-dialog" maxWidth="xs" container={() => containerRef?.current ?? null}>
          <DialogTitle id="alert-dialog-title">{i18n('sync_mode_prompt_title')}</DialogTitle>
          <DialogContent sx={{ whiteSpace: 'pre-line' }}>
            <Typography sx={{ mb: '1em' }}>{i18n('sync_mode_prompt_description')}</Typography>

            <Typography sx={{ color: ColorLevelCss.warning }}>{i18n('sync_mode_prompt_warning')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" sx={{ mr: 'auto' }} onClick={onPromptCancel}>
              {i18n('cancel', 'common', 'buttons')}
            </Button>
            <Button variant="outlined" color={ColorLevel.error} startIcon={<RestoreFromTrashIcon />} onClick={async () => onPromptConfirm('erase')}>
              {i18n('sync_mode_prompt_erase')}
            </Button>
            <Button variant="outlined" color={ColorLevel.primary} startIcon={<SettingsBackupRestoreIcon />} onClick={async () => onPromptConfirm('import')}>
              {i18n('sync_mode_prompt_import')}
            </Button>
          </DialogActions>
        </Dialog>
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', maxHeight: '30rem', overflow: 'auto' }}>
          <JsonExplorer data={sync} name="sync" />
          <JsonExplorer data={local} name="local" />
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
}
