import React from 'react';
import { MaterialIcon } from '../../models';
import { SvgIconProps } from '@mui/material';
import { jsx } from '@emotion/react';

import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VideogameAssetIcon from '@mui/icons-material/PhotoLibrary';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StorageIcon from '@mui/icons-material/Storage';
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
