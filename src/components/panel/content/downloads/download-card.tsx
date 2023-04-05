import DownloadIcon from '@mui/icons-material/Download';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';
import FolderDeleteIcon from '@mui/icons-material/FolderDelete';
import LoopIcon from '@mui/icons-material/Loop';

import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import { blue, green, orange, purple, red } from '@mui/material/colors';

import React from 'react';

import { useSelector } from 'react-redux';

import type { Download, GlobalSettings } from '@src/models';
import { DownloadStatus, downloadStatusToColor } from '@src/models';

import type { StoreState } from '@src/store';
import { getGlobalDownload } from '@src/store/selectors';
import { formatBytes, useI18n } from '@src/utils';

import { ContentCard } from '../content-card';

import type { FC } from 'react';

type DownloadCardProps = { download: Download; hideStatus?: boolean; expanded?: boolean; hover?: boolean };
export const DownloadCard: FC<DownloadCardProps> = ({ download, hideStatus, expanded, hover }) => {
  const i18n = useI18n('panel', 'content', 'download', 'card');
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
      case DownloadStatus.deleted:
        return <FolderDeleteIcon />;
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
      case DownloadStatus.deleted:
        return purple[200];
      default:
        return blue[100];
    }
  };

  const showProgressBar = useSelector<StoreState, GlobalSettings['download']>(getGlobalDownload)?.progressBar;
  return (
    <ContentCard
      hover={hover}
      expanded={expanded}
      title={download.title ?? download.filename}
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
          {download.error && (
            <React.Fragment>
              <span>{i18n(download.error.toLowerCase(), 'common', 'model', 'download_error')}</span>
              <span> – </span>
            </React.Fragment>
          )}
          {download.status === DownloadStatus.downloading && (
            <React.Fragment>
              <span>{download.eta ? `${download.eta} ${i18n('remaining')}` : i18n('no_estimates')}</span>
              <span> – </span>
            </React.Fragment>
          )}
          <span>
            {formatBytes(download.received)} of {formatBytes(download.size)} downloaded
          </span>
        </>
      }
      progress={download.speed ? <span>{formatBytes(download.speed)}/s</span> : undefined}
      progressBar={
        showProgressBar
          ? {
              props: {
                variant: 'determinate',
                color: downloadStatusToColor(download.status),
              },
              value: download.progress ?? 0,
              percentage: expanded || !hover,
            }
          : undefined
      }
    />
  );
};
