import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import { Collapse, ListItemText, MenuItem } from '@mui/material';

import React from 'react';

import { MuiIcon } from '@src/components';
import type { QuickMenu } from '@src/models';
import { MaterialIcon, QuickMenuType } from '@src/models';

import type { FC, MouseEvent } from 'react';

type QuickMenuRecentProps = {
  menu: QuickMenu;
  destinations?: string[];
  disabled?: boolean;
  onClick: ($event: MouseEvent, payload: { menu: QuickMenu; destination?: string }) => void;
};
export const QuickMenuRecent: FC<QuickMenuRecentProps> = ({ menu, destinations, disabled, onClick }) => {
  const [expand, setExpand] = React.useState(false);

  const isRecent = menu?.type === QuickMenuType.Recent;
  const toggle = () => setExpand(_expand => !_expand);
  const _onClick = ($event: MouseEvent) => (isRecent ? toggle() : onClick($event, { menu }));

  const ExpandIcon = expand ? <ExpandLess /> : <ExpandMore />;
  return (
    <>
      <MenuItem onClick={_onClick} disabled={disabled} sx={{ fontSize: '1em' }}>
        <MuiIcon icon={menu.icon ?? MaterialIcon.download} props={{ sx: { fontSize: '0.875em', width: '1.25em', height: '1.25em' } }} />
        <ListItemText primary={menu.title} primaryTypographyProps={{ sx: { fontSize: '0.75em', ml: '0.75em' } }} />
        {isRecent && ExpandIcon}
      </MenuItem>
      <Collapse in={expand} timeout="auto" unmountOnExit>
        {destinations?.slice(0, menu?.max ?? 5)?.map((destination, i) => (
          <MenuItem key={i} sx={{ pl: '1.5em', fontSize: '1em' }} onClick={$event => onClick($event, { menu, destination })}>
            <FolderIcon sx={{ fontSize: '0.875em', width: '1.25em', height: '1.25em' }} />
            <ListItemText primary={destination} primaryTypographyProps={{ sx: { fontSize: '0.75em', ml: '1em' } }} />
          </MenuItem>
        ))}
      </Collapse>
    </>
  );
};
