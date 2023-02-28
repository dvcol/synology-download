import CloudSyncIcon from '@mui/icons-material/CloudSync';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';
import LaunchIcon from '@mui/icons-material/Launch';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { Button, Tooltip } from '@mui/material';

import React, { forwardRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import type { ProgressBackgroundProps } from '@src/components';

import type { Download, Global } from '@src/models';
import { ColorLevel, ColorLevelMap, DownloadStatus, downloadStatusToColor } from '@src/models';

import { DownloadService, QueryService } from '@src/services';

import type { StoreState } from '@src/store';
import { getGlobalDownload } from '@src/store/selectors';

import { ContentItem } from '../content-item';

import { DownloadCard } from './download-card';
import { DownloadDetail } from './download-detail';

import type { ForwardRefRenderFunction } from 'react';

type DownloadItemProps = { download: Download; hideStatus?: boolean };
export type DownloadItemButton = {
  key: 'erase' | 'cancel' | 'retry' | 'pause' | 'resume' | 'open' | 'transfer';
  icon: JSX.Element;
  color: ColorLevel;
};

const ButtonStyle = { display: 'flex', flex: '1 1 auto', minHeight: '2.5rem' };
const DownloadItemComponent: ForwardRefRenderFunction<HTMLDivElement, DownloadItemProps> = ({ download, hideStatus }, ref) => {
  const i18n = useI18n('panel', 'content', 'download', 'item');
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  const buttons: DownloadItemButton[] = [];

  let topButton: DownloadItemButton = { key: 'erase', icon: <DeleteIcon />, color: ColorLevel.error };
  if ([DownloadStatus.downloading, DownloadStatus.paused].includes(download.status))
    topButton = { key: 'cancel', icon: <FileDownloadOffIcon />, color: ColorLevel.primary };
  buttons.push(topButton);

  let bottomButton: DownloadItemButton = { key: 'retry', icon: <ReplayIcon />, color: ColorLevel.secondary };
  if (DownloadStatus.downloading === download.status) {
    bottomButton = { key: 'pause', icon: <PauseIcon />, color: ColorLevel.warning };
  } else if (download.canResume) {
    bottomButton = { key: 'resume', icon: <PlayArrowIcon />, color: ColorLevel.success };
  } else if (DownloadStatus.complete === download.status) {
    bottomButton = { key: 'open', icon: <LaunchIcon />, color: ColorLevel.secondary };
  }
  buttons.push(bottomButton);

  const showBackground = useSelector<StoreState, Global['download']>(getGlobalDownload)?.background;
  const background: ProgressBackgroundProps = showBackground
    ? {
        primary: `${ColorLevelMap[downloadStatusToColor(download.status)]}${visible ? 30 : 20}`,
        secondary: visible ? '#99999910' : 'transparent',
        progress: download.progress ?? 0,
      }
    : {};

  const onclick = ($event: React.MouseEvent, key: DownloadItemButton['key']) => {
    $event.stopPropagation();
    switch (key) {
      case 'erase':
        return DownloadService.erase({ id: download.id }).subscribe();
      case 'cancel':
        return DownloadService.cancel(download.id).subscribe();
      case 'retry':
        return DownloadService.download({
          url: download.finalUrl,
        }).subscribe();
      case 'pause':
        return DownloadService.pause(download.id).subscribe();
      case 'resume':
        return DownloadService.resume(download.id).subscribe();
      case 'open':
        if ($event.shiftKey) return DownloadService.open(download.id).subscribe();
        return DownloadService.show(download.id).subscribe();
      case 'transfer':
        return QueryService.createTask(download.finalUrl).subscribe();
      default:
        console.warn(`Key '${key}' is unknown`);
    }
  };

  const detailsButtons = buttons.slice().reverse();
  detailsButtons.unshift({ key: 'transfer', icon: <CloudSyncIcon />, color: ColorLevel.info });
  return (
    <ContentItem
      ref={ref}
      onHover={_visible => setVisible(_visible)}
      onToggle={_expanded => setExpanded(_expanded)}
      background={background}
      summary={{
        card: <DownloadCard download={download} hideStatus={hideStatus} expanded={expanded} visible={visible} />,
        buttons: (
          <>
            {buttons?.map(button => (
              <Tooltip key={button.key} title={i18n(button.key, 'common', 'buttons')} placement={'left'}>
                <span>
                  <Button key={button.key} sx={ButtonStyle} onClick={$event => onclick($event, button.key)} color={button.color}>
                    {button.icon}
                  </Button>
                </span>
              </Tooltip>
            ))}
          </>
        ),
      }}
      details={<DownloadDetail download={download} buttons={detailsButtons} onclick={onclick} />}
    />
  );
};

export const DownloadItem = forwardRef(DownloadItemComponent);
