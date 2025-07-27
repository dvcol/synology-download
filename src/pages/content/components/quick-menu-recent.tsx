import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';

import { Collapse, ListItemText, MenuItem } from '@mui/material';

import React from 'react';

import { MuiIcon } from '@src/components';
import type { QuickMenu } from '@src/models';
import { MaterialIcon, QuickMenuType } from '@src/models';

import type { SvgIconProps } from '@mui/material';
import type { FC, MouseEvent } from 'react';

const isDisabled = (type: QuickMenuType, logged: boolean, folders: boolean, destinations: boolean): boolean => {
  switch (type) {
    case QuickMenuType.Download:
      return false;
    case QuickMenuType.RecentDownload:
      return folders;
    case QuickMenuType.Recent:
      return !logged || destinations;
    case QuickMenuType.Task:
    default:
      return !logged;
  }
};

type QuickMenuRecentProps = {
  isDark?: boolean;
  menu: QuickMenu;
  logged: boolean;
  folders?: string[];
  destinations?: string[];
  onClick: ($event: MouseEvent, payload: { menu: QuickMenu; destination?: string }) => void;
  onToggle?: ($event: MouseEvent, open: boolean) => void;
};
export const QuickMenuRecent: FC<QuickMenuRecentProps> = ({ isDark, menu, logged, folders, destinations, onClick, onToggle }) => {
  const [expand, setExpand] = React.useState(false);

  const disabled = isDisabled(menu.type, logged, !folders?.length, !destinations?.length);

  const isRecent = [QuickMenuType.Recent, QuickMenuType.RecentDownload].includes(menu?.type);

  const history = menu.type === QuickMenuType.Recent ? destinations : folders;

  if (isRecent && !history?.length) return null;

  const toggle = ($event: MouseEvent) => {
    setExpand(_expand => !_expand);
    onToggle?.($event, !expand);
  };
  const _onClick = ($event: MouseEvent) => (isRecent ? toggle($event) : onClick($event, { menu }));

  const ExpandIcon: FC<SvgIconProps> = props => (expand ? <ExpandLess {...props} /> : <ExpandMore {...props} />);
  return (
    <>
      <MenuItem onClick={_onClick} disabled={disabled} sx={{ fontSize: '1em' }}>
        <MuiIcon icon={menu.icon ?? MaterialIcon.download} props={{ sx: { fontSize: '0.875em', width: '1.25em', height: '1.25em' } }} />
        <ListItemText primary={menu.title} primaryTypographyProps={{ sx: { fontSize: '0.75em', ml: '0.75em' } }} />
        {isRecent && <ExpandIcon sx={{ ml: '0.5em', fontSize: '1em', width: '1em', height: '1em' }} />}
      </MenuItem>
      <Collapse
        in={expand}
        timeout="auto"
        unmountOnExit
        sx={{
          backgroundColor: `rgba(5, 5, 10, ${isDark ? 0.4 : 0.075})`,
        }}
      >
        {history?.slice(0, menu?.max ?? 5)?.map((destination, i) => (
          <MenuItem key={i} sx={{ pl: '1.5em', fontSize: '1em' }} onClick={$event => onClick($event, { menu, destination })}>
            <FolderIcon sx={{ fontSize: '0.875em', width: '1.25em', height: '1.25em' }} />
            <ListItemText primary={destination} primaryTypographyProps={{ sx: { fontSize: '0.75em', ml: '1em' } }} />
          </MenuItem>
        ))}
      </Collapse>
    </>
  );
};
