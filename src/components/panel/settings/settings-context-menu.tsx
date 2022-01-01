import { Typography } from '@mui/material';
import { getMenus, resetQuickMenus, saveContextMenu, StoreState } from '../../../store';
import { ContextMenu, defaultContextMenu, InterfaceHeader } from '../../../models';
import { v4 as uuid } from 'uuid';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsMenu } from './settings-menu';
import { SettingsInterface } from './settings-interface';

export const SettingsContextMenu = () => {
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, ContextMenu[]>(getMenus);

  const addNew = (id: string) => {
    const newMenu = { ...defaultContextMenu, id: uuid() };
    dispatch(saveContextMenu(newMenu));
  };

  const reset = () => dispatch(resetQuickMenus());

  return (
    <SettingsInterface
      title={InterfaceHeader.contextMenu}
      list={menus}
      summary={(c) => (
        <>
          <Typography sx={{ width: '40%', flexShrink: 0 }}>{c.title}</Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {c.destination?.path?.replaceAll('/', ' / ') ?? 'Default folder'}
          </Typography>
        </>
      )}
      detail={(c) => <SettingsMenu menu={c} />}
      addNew={addNew}
      reset={reset}
    />
  );
};
