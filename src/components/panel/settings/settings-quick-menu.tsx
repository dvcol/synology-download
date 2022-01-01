import { Typography } from '@mui/material';
import React from 'react';
import { InterfaceHeader } from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { getQuick, resetQuickMenus, saveQuickMenu, StoreState } from '../../../store';
import { defaultQuickMenu, QuickMenu } from '../../../models/menu.model';
import { SettingsMenu } from './settings-menu';
import { SettingsInterface } from './settings-interface';

export const SettingsQuickMenu = () => {
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);

  const addNew = (id: string) => {
    const newMenu = { ...defaultQuickMenu, id };
    dispatch(saveQuickMenu(newMenu));
  };

  const reset = () => dispatch(resetQuickMenus());

  return (
    <SettingsInterface
      title={InterfaceHeader.quickMenu}
      list={menus}
      summary={(m) => (
        <>
          <Typography sx={{ width: '40%', flexShrink: 0 }}>{m.title}</Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {m.destination?.path?.replaceAll('/', ' / ') ?? 'Default folder'}
          </Typography>
        </>
      )}
      detail={(m) => <SettingsMenu menu={m} />}
      addNew={addNew}
      reset={reset}
    />
  );
};
