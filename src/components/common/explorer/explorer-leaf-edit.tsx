import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import { Button, Stack, TextField, Tooltip, Typography } from '@mui/material';

import React, { useState } from 'react';

import { i18n } from '@dvcol/web-extension-utils';

import type { File, Folder } from '@src/models';
import { QueryService } from '@src/services';

import type { ButtonProps } from '@mui/material';

import type { InputProps as StandardInputProps } from '@mui/material/Input/Input';
import type { FC } from 'react';

export type ExplorerLeafEditProps = {
  folder: Partial<Folder | File>;
  isEditing?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onChange?: (newFolder?: Folder | File, oldFolder?: Partial<Folder | File>) => void;
  onCancel?: ButtonProps['onClick'];
  onSave?: ButtonProps['onClick'];
};

export const ExplorerLeafEdit: FC<ExplorerLeafEditProps> = ({ folder, isEditing, placeholder, disabled, onChange, onCancel, onSave }) => {
  const [editing, setEditing] = useState(isEditing);
  const [hover, setHover] = useState(false);
  const [name, setName] = useState(folder?.name);

  const onInputChange: StandardInputProps['onChange'] = event => {
    setName(event.target.value);
  };

  const onClick: StandardInputProps['onClick'] = event => {
    event.stopPropagation();
  };

  const onEdit: ButtonProps['onClick'] = event => {
    event.stopPropagation();
    setEditing(true);
  };

  const _onCancel: ButtonProps['onClick'] = event => {
    event.stopPropagation();
    setEditing(false);
    setName(folder?.name);
    onCancel?.(event);
  };

  const onCreateOrRename: ButtonProps['onClick'] = event => {
    event.stopPropagation();
    if (!disabled && folder?.path && name) {
      if (folder.name) {
        QueryService.renameFolder(folder?.path, name).subscribe(res => {
          if (res.files?.length) {
            setName(res.files[0]?.name);
            onChange?.(res.files[0], folder);
          }
          setEditing(false);
        });
      } else {
        QueryService.createFolder(folder?.path, name).subscribe(res => {
          if (res.folders?.length) {
            setName(res.folders[0]?.name);
            onChange?.(res.folders[0], folder);
          }
          setEditing(false);
          onSave?.(event);
        });
      }
    }
  };

  const isDirty = name !== folder.name;

  return (
    <Stack direction="row" sx={{ flex: '1 1 auto' }} onMouseOver={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {editing && !disabled ? (
        <TextField
          id="standard-basic"
          defaultValue={name}
          placeholder={placeholder ?? name}
          focused={true}
          variant="standard"
          fullWidth={true}
          onChange={onInputChange}
          onClick={onClick}
        />
      ) : (
        <Typography sx={{ flex: '1 1 auto', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{folder?.name}</Typography>
      )}
      <Stack direction="row" sx={{ marginRight: editing ? '-8px' : '-4px' }}>
        {!editing && !disabled && hover && (
          <Tooltip title={i18n('edit', 'common', 'buttons')}>
            <span>
              <Button key="edit" sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.125rem' }} disabled={disabled} onClick={onEdit}>
                <EditIcon sx={{ fontSize: '0.9rem' }} />
              </Button>
            </span>
          </Tooltip>
        )}
        {editing && !disabled && isDirty && (
          <Tooltip title={i18n('save', 'common', 'buttons')}>
            <span>
              <Button
                key="save"
                sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.25rem' }}
                disabled={disabled}
                onClick={onCreateOrRename}
              >
                <SaveIcon fontSize="small" />
              </Button>
            </span>
          </Tooltip>
        )}
        {editing && !disabled && (
          <Tooltip title={i18n('cancel', 'common', 'buttons')}>
            <span>
              <Button
                key="cancel"
                color="error"
                sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.25rem' }}
                disabled={disabled}
                onClick={_onCancel}
              >
                <ClearIcon fontSize="small" />
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};
