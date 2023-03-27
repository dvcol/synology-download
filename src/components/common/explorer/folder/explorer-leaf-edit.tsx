import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import { Button, Stack, TextField, Tooltip, Typography } from '@mui/material';

import React, { useState } from 'react';

import type { File, Folder } from '@src/models';
import { QueryService } from '@src/services';
import { i18n } from '@src/utils';

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
        <Tooltip arrow title={folder?.name ?? ''} PopperProps={{ disablePortal: true, sx: { wordBreak: 'break-all' } }} enterDelay={1000}>
          <Typography
            sx={{
              flex: '1 1 auto',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              fontSize: '0.875em',
            }}
          >
            {folder?.name}
          </Typography>
        </Tooltip>
      )}
      <Stack direction="row" sx={{ mt: editing ? '0.25em' : 0 }}>
        {!editing && !disabled && hover && (
          <Tooltip arrow title={i18n('edit', 'common', 'buttons')} PopperProps={{ disablePortal: true }}>
            <Button
              key="edit"
              sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.25em', fontSize: '0.75em' }}
              disabled={disabled}
              onClick={onEdit}
            >
              <EditIcon sx={{ width: '1em', fontSize: '1.125em' }} />
            </Button>
          </Tooltip>
        )}
        {editing && !disabled && isDirty && (
          <Tooltip arrow title={i18n('save', 'common', 'buttons')} PopperProps={{ disablePortal: true }}>
            <Button
              key="save"
              sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.5em', fontSize: '0.75em' }}
              disabled={disabled}
              onClick={onCreateOrRename}
            >
              <SaveIcon fontSize="small" sx={{ width: '1em', fontSize: '1.125em' }} />
            </Button>
          </Tooltip>
        )}
        {editing && !disabled && (
          <Tooltip arrow title={i18n('cancel', 'common', 'buttons')} PopperProps={{ disablePortal: true }}>
            <Button
              key="cancel"
              color="error"
              sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.5em', fontSize: '0.75em' }}
              disabled={disabled}
              onClick={_onCancel}
            >
              <ClearIcon fontSize="small" sx={{ width: '1em', fontSize: '1.125em' }} />
            </Button>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};
