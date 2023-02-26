import DownloadIcon from '@mui/icons-material/Download';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';
import LoopIcon from '@mui/icons-material/Loop';

import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import { blue, green, orange, red } from '@mui/material/colors';

import React from 'react';

import { useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import type { Download, Global } from '@src/models';
import { DownloadStatus, downloadStatusToColor, formatEstimatedTime, getEstimatedSpeed } from '@src/models';

import type { StoreState } from '@src/store';
import { getGlobalDownload } from '@src/store/selectors';
import { computeProgress, formatBytes } from '@src/utils';

import { ContentCard } from '../content-card';

import type { FC } from 'react';

type DownloadCardProps = { download: Download; hideStatus?: boolean; expanded?: boolean; visible?: boolean };
export const DownloadCard: FC<DownloadCardProps> = ({ download, hideStatus, expanded, visible }) => {
  const i18n = useI18n('panel', 'content', 'download', 'card');
  const title = download.filename?.substr(download.filename.lastIndexOf('/') + 1);
  const statusIcon = (state: DownloadStatus): JSX.Element => {
    switch (state) {
      case DownloadStatus.downloading:
        return <DownloadIcon />;
      case DownloadStatus.complete:
        return <DownloadDoneIcon />;
      case DownloadStatus.paused:
        return <PauseCircleOutlineIcon />;
      case DownloadStatus.cancelled:
        return <FileDownloadOffIcon />;
      case DownloadStatus.error:
        return <ErrorOutlineIcon />;
      default:
        return <LoopIcon />;
    }
  };

  const avatarBgColor = (state: DownloadStatus): string => {
    switch (state) {
      case DownloadStatus.downloading:
        return blue[500];
      case DownloadStatus.complete:
        return green[500];
      case DownloadStatus.paused:
        return orange[100];
      case DownloadStatus.cancelled:
        return orange[700];
      case DownloadStatus.error:
        return red[500];
      default:
        return blue[100];
    }
  };

  const showProgressBar = useSelector<StoreState, Global['download']>(getGlobalDownload)?.progressBar;
  return (
    <ContentCard
      title={title}
      icon={statusIcon(download.status)}
      iconBackground={avatarBgColor(download.status)}
      iconVariant={'rounded'}
      description={
        <>
          {!hideStatus && (
            <React.Fragment>
              <span>{i18n(download.status, 'common', 'model', 'download_status')}</span>
              <span> – </span>
            </React.Fragment>
          )}
          {download.status === DownloadStatus.downloading && (
            <React.Fragment>
              <span>{download.estimatedEndTime ? `${formatEstimatedTime(download)} ${i18n('remaining')}` : i18n('no_estimates')}</span>
              <span> – </span>
            </React.Fragment>
          )}
          <span>
            {formatBytes(download.bytesReceived)} of {formatBytes(download.fileSize)} downloaded
          </span>
        </>
      }
      progress={download.estimatedEndTime ? <span>{getEstimatedSpeed(download)}/s</span> : undefined}
      progressBar={
        showProgressBar
          ? {
              props: {
                variant: 'determinate',
                color: downloadStatusToColor(download.status),
              },
              value: computeProgress(download.bytesReceived, download.fileSize),
              percentage: expanded || !visible,
            }
          : undefined
      }
    />
  );
};
