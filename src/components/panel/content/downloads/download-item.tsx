import CloudSyncIcon from '@mui/icons-material/CloudSync';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadOffIcon from '@mui/icons-material/FileDownloadOff';
import LaunchIcon from '@mui/icons-material/Launch';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay';
import { Button, Dialog, DialogContent, Tooltip } from '@mui/material';

import React, { forwardRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { forkJoin } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import type { ProgressBackgroundProps } from '@src/components';
import { TaskAdd } from '@src/components';

import type { Download, Global, TaskForm } from '@src/models';
import { ColorLevel, ColorLevelMap, DownloadStatus, downloadStatusToColor } from '@src/models';

import { DownloadService } from '@src/services';

import { InterceptService } from '@src/services/download/intercept.service';
import type { StoreState } from '@src/store';
import { getGlobalDownload, getSettingsDownloadsTransfer } from '@src/store/selectors';

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

  // Dialog
  const [dialog, toggleDialog] = React.useState(false);
  const [form] = React.useState<TaskForm>({ uri: download.finalUrl, source: download.referrer });
  const { erase, resume, modal } = useSelector(getSettingsDownloadsTransfer);

  const close = (_erase = false) => {
    toggleDialog(false);
    if (_erase) DownloadService.erase({ id: download.id }).subscribe();
  };

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
        return forkJoin([DownloadService.download({ url: download.finalUrl }), DownloadService.erase({ id: download.id })]).subscribe();
      case 'pause':
        return DownloadService.pause(download.id).subscribe();
      case 'resume':
        return DownloadService.resume(download.id).subscribe();
      case 'open':
        if ($event.shiftKey) return DownloadService.open(download.id).subscribe();
        return DownloadService.show(download.id).subscribe();
      case 'transfer':
        if ($event.shiftKey || !modal) return InterceptService.transfer(download, { erase, resume });
        return toggleDialog(true);
      default:
        console.warn(`Key '${key}' is unknown`);
    }
  };

  const detailsButtons = buttons.slice().reverse();
  detailsButtons.unshift({ key: 'transfer', icon: <CloudSyncIcon />, color: ColorLevel.info });
  return (
    <>
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
      <Dialog open={dialog} fullWidth={true} onClose={() => close()} maxWidth={'md'}>
        <DialogContent sx={{ p: '0' }}>
          <TaskAdd form={form} withCancel={true} onFormCancel={() => close()} onFormSubmit={() => close(erase)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DownloadItem = forwardRef(DownloadItemComponent);
