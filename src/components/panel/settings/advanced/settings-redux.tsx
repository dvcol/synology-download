import type { RootSlice } from '../../../../models/store.model';

import DownloadIcon from '@mui/icons-material/Download';
import { Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';

import { ColorLevel } from '../../../../models/material-ui.model';
import { AdvancedHeader } from '../../../../models/settings.model';
import { getRoot } from '../../../../store/selectors/root.selector';
import { downloadJson } from '../../../../utils/downlaod.utils';
import { useI18n } from '../../../../utils/webex.utils';
import { JsonExplorer } from '../../../common/explorer/json/json-explorer';

export function SettingsRedux() {
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
          <JsonExplorer data={store} name="redux-store" />
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
}
