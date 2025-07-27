import DownloadIcon from '@mui/icons-material/Download';
import PublishIcon from '@mui/icons-material/Publish';
import { Box, Button, Card, CardActions, CardContent, CardHeader, InputAdornment, Stack, Typography } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { JsonExplorer } from '@src/components';
import type { RootSlice, SettingsSlice } from '@src/models';
import { AdvancedHeader, ColorLevel, ColorLevelMap } from '@src/models';
import { LoggerService, NotificationService } from '@src/services';
import { syncSettings } from '@src/store/actions';
import { getSettings } from '@src/store/selectors';
import { useI18n } from '@src/utils';
import { downloadJson } from '@src/utils/downlaod.utils';
import { readJsonFile } from '@src/utils/file.utils';

export const SettingsExport = () => {
  const i18n = useI18n('panel', 'settings', 'advanced', 'export');
  const store = useSelector<RootSlice, SettingsSlice>(getSettings);
  const dispatch = useDispatch();

  const exportSnapshot = () => downloadJson(store, `synology_download_settings_snapshot_${new Date().toISOString()}.json`);

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await readJsonFile<SettingsSlice>(file);
      // Process the imported settings
      dispatch(syncSettings(imported));
      NotificationService.info({ title: i18n('success'), message: file.name });
      // Reset input
      event.target.value = '';
    } catch (error) {
      LoggerService.error(`Importing file '${file.name}' failed.`, error);
      NotificationService.error({ title: i18n('failed'), message: file.name });
    }
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={AdvancedHeader.redux}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
          {i18n('warning')}
        </Typography>
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', maxHeight: '30rem', overflow: 'auto' }}>
          <JsonExplorer data={store} name={'settings'} />
        </Card>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <InputAdornment position="end" sx={{ flex: '1 1 auto', height: 'auto', maxHeight: 'fit-content' }}>
            <input accept={'.json'} hidden={true} id="raised-button-file" type="file" onChange={onChange} />
            <Box component="label" htmlFor="raised-button-file">
              <Button variant="outlined" component="span" startIcon={<PublishIcon />} color={ColorLevel.secondary}>
                {i18n('import', 'common', 'buttons')}
              </Button>
            </Box>
          </InputAdornment>
          <Button variant="outlined" color={ColorLevel.primary} startIcon={<DownloadIcon />} type="submit" onClick={exportSnapshot}>
            {i18n('export', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
