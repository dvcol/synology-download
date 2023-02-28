import { Button, Typography } from '@mui/material';

import React from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

import type { DownloadItemButton } from '@src/components';
import type { Download } from '@src/models';

import { dateToLocalString } from '@src/utils';

import ContentDetail from '../content-detail';

import type { FC } from 'react';

type DownloadDetailProps = {
  download: Download;
  buttons: DownloadItemButton[];
  onclick: ($event: React.MouseEvent, key: DownloadItemButton['key']) => void;
};

export const DownloadDetail: FC<DownloadDetailProps> = ({ download, buttons, onclick }) => {
  const i18n = useI18n('panel', 'content', 'download', 'detail');

  return (
    <ContentDetail
      title={
        <Typography variant="caption" component="div">
          {`${i18n('url')} :\t${download.finalUrl}`}
        </Typography>
      }
      info={
        <>
          <Typography variant="caption" component="div">
            {`${i18n('created')} :\t${dateToLocalString(download.createdAt) ?? ''}`}
          </Typography>
          <Typography variant="caption" component="div">
            {`${i18n('destination')} :\t${download.folder}`}
          </Typography>
        </>
      }
      buttons={
        <>
          {buttons.map(button => (
            <Button key={button.key} startIcon={button.icon} variant="contained" color={button.color} onClick={$event => onclick($event, button.key)}>
              {i18n(button.key, 'common', 'buttons')}
            </Button>
          ))}
        </>
      }
    />
  );
};
