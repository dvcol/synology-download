import { jsx } from '@emotion/react';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import StorageIcon from '@mui/icons-material/Storage';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import React from 'react';

import { MaterialIcon } from '@src/models';

import type { SvgIconProps } from '@mui/material';

import JSX = jsx.JSX;

export const MuiIcon = ({ icon, props }: { icon: MaterialIcon; props?: SvgIconProps }): JSX.Element => {
  switch (icon) {
    case MaterialIcon.add:
      return <AddIcon {...props} />;
    case MaterialIcon.music:
      return <MusicNoteIcon {...props} />;
    case MaterialIcon.musicLibrary:
      return <LibraryMusicIcon {...props} />;
    case MaterialIcon.video:
      return <SmartDisplayIcon {...props} />;
    case MaterialIcon.videoLibrary:
      return <LibraryMusicIcon {...props} />;
    case MaterialIcon.photo:
      return <InsertPhotoIcon {...props} />;
    case MaterialIcon.photoLibrary:
      return <PhotoLibraryIcon {...props} />;
    case MaterialIcon.document:
      return <FileCopyIcon {...props} />;
    case MaterialIcon.game:
      return <VideogameAssetIcon {...props} />;
    case MaterialIcon.secure:
      return <VpnKeyIcon {...props} />;
    case MaterialIcon.private:
      return <VisibilityOffIcon {...props} />;
    case MaterialIcon.server:
      return <StorageIcon {...props} />;
    case MaterialIcon.folder:
      return <FolderIcon {...props} />;
    case MaterialIcon.history:
      return <HistoryIcon {...props} />;
    case MaterialIcon.download:
      return <DownloadIcon {...props} />;
    default:
      return <></>;
  }
};
