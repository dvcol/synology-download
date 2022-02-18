import { jsx } from '@emotion/react';

import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import FolderIcon from '@mui/icons-material/Folder';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VideogameAssetIcon from '@mui/icons-material/PhotoLibrary';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { SvgIconProps } from '@mui/material';

import React from 'react';

import { MaterialIcon } from '@src/models';

import JSX = jsx.JSX;

export const MuiIcon = ({ icon, props }: { icon: MaterialIcon; props?: SvgIconProps }): JSX.Element => {
  switch (icon) {
    case MaterialIcon.add:
      return <AddIcon />;
    case MaterialIcon.music:
      return <MusicNoteIcon />;
    case MaterialIcon.musicLibrary:
      return <LibraryMusicIcon />;
    case MaterialIcon.video:
      return <SmartDisplayIcon />;
    case MaterialIcon.videoLibrary:
      return <LibraryMusicIcon />;
    case MaterialIcon.photo:
      return <InsertPhotoIcon />;
    case MaterialIcon.photoLibrary:
      return <PhotoLibraryIcon />;
    case MaterialIcon.document:
      return <FileCopyIcon />;
    case MaterialIcon.game:
      return <VideogameAssetIcon />;
    case MaterialIcon.secure:
      return <VpnKeyIcon />;
    case MaterialIcon.private:
      return <VisibilityOffIcon />;
    case MaterialIcon.server:
      return <StorageIcon />;
    case MaterialIcon.folder:
      return <FolderIcon />;
    case MaterialIcon.download:
      return <DownloadIcon {...props} />;
    default:
      return <></>;
  }
};
