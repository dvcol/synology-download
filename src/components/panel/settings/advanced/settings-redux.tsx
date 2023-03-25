import DownloadIcon from '@mui/icons-material/Download';
import { Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';

import React from 'react';

import { useSelector } from 'react-redux';

import { JsonExplorer } from '@src/components';
import type { RootSlice } from '@src/models';
import { AdvancedHeader, ColorLevel } from '@src/models';
import { getRoot } from '@src/store/selectors';
import { useI18n } from '@src/utils';
import { downloadJson } from '@src/utils/downlaod.utils';

export const SettingsRedux = () => {
  const i18n = useI18n('panel', 'settings', 'advanced', 'redux');
  const store = useSelector<RootSlice, RootSlice>(getRoot);

  const exportSnapshot = () => downloadJson(store, `synology_download_redux_snapshot_${new Date().toISOString()}.json`);

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
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', maxHeight: '30rem', overflow: 'auto' }}>
          <JsonExplorer data={store} name={'redux-store'} />
        </Card>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color={ColorLevel.primary} startIcon={<DownloadIcon />} type="submit" onClick={exportSnapshot}>
            {i18n('export')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
