import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

import { Button, Stack } from '@mui/material';

import React, { useState } from 'react';

import type { File, Folder } from '@src/models';

import { ExplorerLeafEdit } from './explorer-leaf-edit';

import type { ButtonProps } from '@mui/material';
import type { FC } from 'react';

export type ExplorerLeafAddProps = {
  nodeId: string;
  path: string;
  disabled?: boolean;
  spliceTree?: (nodeId: string, newFolder?: Folder | File, oldFolder?: Partial<Folder | File>) => void;
};

export const ExplorerLeafAdd: FC<ExplorerLeafAddProps> = ({ nodeId, path, disabled, spliceTree }) => {
  const [editing, setEditing] = useState(false);

  const onClick: ButtonProps['onClick'] = event => {
    event.stopPropagation();
    setEditing(true);
  };

  const onCancel: ButtonProps['onClick'] = event => {
    event.stopPropagation();
    setEditing(false);
  };

  return (
    <Stack direction="row" sx={{ flex: '1 1 auto' }}>
      {editing ? (
        <Stack direction="row" sx={{ flex: '1 1 auto', p: '0 0.5em', alignItems: 'center' }}>
          <CreateNewFolderOutlinedIcon sx={{ mr: '0.25em', ml: '-0.125em' }} />
          <ExplorerLeafEdit
            folder={{ path }}
            isEditing={true}
            placeholder={'Create a new folder'}
            disabled={disabled}
            onChange={(...args) => spliceTree?.(nodeId, ...args)}
            onCancel={onCancel}
            onSave={onCancel}
          />
        </Stack>
      ) : (
        <Button
          variant="text"
          startIcon={<CreateNewFolderOutlinedIcon sx={{ ml: '0.125em', mr: '-0.25em' }} />}
          sx={{
            height: '1.5em',
            flex: '1 1 auto',
            p: '0 0.5em',
            justifyContent: 'flex-start',
            textTransform: 'none',
          }}
          onClick={onClick}
        >
          Create a new Folder
        </Button>
      )}
    </Stack>
  );
};
