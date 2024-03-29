import FolderIcon from '@mui/icons-material/Folder';
import { Container, List, ListItemButton, ListItemText, Tooltip } from '@mui/material';

import React from 'react';

import type { FC } from 'react';

export type ExplorerRecentProps = {
  selected?: string;
  destinations: string[];
  onSelect: (destination: string) => void;
};

export const ExplorerRecent: FC<ExplorerRecentProps> = ({ selected, destinations, onSelect }) => {
  return (
    <Container disableGutters sx={{ overflow: 'auto', height: 'calc(100% - 2.0625em)' }}>
      <List dense={true} sx={{ p: 0 }}>
        {destinations?.map((destination, index) => (
          <ListItemButton key={index} selected={selected === destination} onClick={() => onSelect(destination)} sx={{ p: '0 0.5em', mb: '0.1em' }}>
            <FolderIcon sx={{ mr: '0.25em', width: '1em', fontSize: '1.125em' }} />
            <Tooltip arrow title={destination} PopperProps={{ disablePortal: true, sx: { wordBreak: 'break-all' } }} enterDelay={1000}>
              <ListItemText
                primary={destination}
                primaryTypographyProps={{
                  sx: {
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontSize: '0.875em',
                  },
                }}
                sx={{ mb: 0, mt: 0 }}
              />
            </Tooltip>
          </ListItemButton>
        ))}
      </List>
    </Container>
  );
};
