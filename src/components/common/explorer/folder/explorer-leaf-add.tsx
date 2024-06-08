import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

import { Button, Stack, Typography } from '@mui/material';

import React, { useState } from 'react';

import type { File, Folder } from '@src/models';

import { useI18n } from '@src/utils';

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
  const i18n = useI18n('common', 'explorer', 'leaf', 'add');
  const [editing, setEditing] = useState(false);

  const onClick: ButtonProps['onClick'] = event => {
    event.stopPropagation();
    if (disabled) return;
    setEditing(true);
  };

  const onCancel: ButtonProps['onClick'] = event => {
    event.stopPropagation();
    if (disabled) return;
    setEditing(false);
  };

  return (
    <Stack direction="row" sx={{ flex: '1 1 auto' }}>
      {editing ? (
        <Stack direction="row" sx={{ flex: '1 1 auto', p: '0 0.5em', alignItems: 'center' }}>
          <CreateNewFolderOutlinedIcon sx={{ mr: '0.25em', ml: '-0.125em', width: '1em', fontSize: '1.25em' }} />
          <ExplorerLeafEdit
            folder={{ path }}
            isEditing={true}
            placeholder={i18n('new_folder')}
            disabled={disabled}
            onChange={(...args) => spliceTree?.(nodeId, ...args)}
            onCancel={onCancel}
            onSave={onCancel}
          />
        </Stack>
      ) : (
        <Button
          variant="text"
          startIcon={<CreateNewFolderOutlinedIcon sx={{ ml: '0.125em', mr: '-0.25em', width: '1em', fontSize: '1.125em', mb: '0.125em' }} />}
          sx={{
            height: '1.5em',
            flex: '1 1 auto',
            p: '1em 0.5em',
            justifyContent: 'flex-start',
            textTransform: 'none',
            fontSize: '0.875em',
          }}
          disabled={disabled}
          onClick={onClick}
        >
          <Typography
            sx={{
              flex: '1 1 auto',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              fontSize: '0.875em',
              textAlign: 'start',
              ml: '0.25em',
            }}
          >
            {i18n('new_folder')}
          </Typography>
        </Button>
      )}
    </Stack>
  );
};
