import DownloadIcon from '@mui/icons-material/Download';
import { Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { Subscription } from 'rxjs';

import { localGet, syncGet, useI18n } from '@dvcol/web-extension-utils';

import { JsonExplorer } from '@src/components';
import type { RootSlice } from '@src/models';
import { AdvancedHeader, ColorLevel } from '@src/models';
import { getRoot } from '@src/store/selectors';
import { downloadJson } from '@src/utils/downlaod.utils';

export const SettingsChromeStorage = () => {
  const i18n = useI18n('panel', 'settings', 'advanced', 'storage');
  const store = useSelector<RootSlice, RootSlice>(getRoot);

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
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', maxHeight: '30rem', overflow: 'auto' }}>
          <JsonExplorer data={sync} name={'sync'} />
          <JsonExplorer data={local} name={'local'} />
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
