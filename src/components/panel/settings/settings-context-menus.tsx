import { Typography } from '@mui/material';
import { getMenus, resetContextMenu, saveContextMenu, StoreState } from '../../../store';
import { ChromeMessageType, ContextMenu, defaultContextMenu, InterfaceHeader } from '../../../models';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsContextMenu } from './settings-context-menu';
import { SettingsInterface } from './settings-interface';
import { sendMessage } from '../../../utils';

export const SettingsContextMenus = () => {
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, ContextMenu[]>(getMenus);

  const addNew = (id: string) => {
    const newMenu = { ...defaultContextMenu, id };
    sendMessage<ContextMenu>({ type: ChromeMessageType.addMenu, payload: newMenu }).subscribe(() => {
      dispatch(saveContextMenu(newMenu));
    });
  };

  const reset = () => {
    sendMessage<ContextMenu[]>({ type: ChromeMessageType.resetMenu, payload: [defaultContextMenu] }).subscribe(() => {
      dispatch(resetContextMenu());
    });
  };

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
      detail={(c) => <SettingsContextMenu menu={c} />}
      addNew={addNew}
      reset={reset}
    />
  );
};
