import { Typography } from '@mui/material';
import { resetTaskTabs, saveTaskTab } from '@src/store/actions';
import { getTabs } from '@src/store/selectors';
import { StoreState } from '@src/store';
import { defaultTabs, InterfaceHeader, TaskTab } from '@src/models';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsTab } from './settings-tab';
import { SettingsInterface } from '@src/components';

export const SettingsTabs = () => {
  const dispatch = useDispatch();
  const tabs = useSelector<StoreState, TaskTab[]>(getTabs);

  const addNew = (id: string) => {
    const newTab = { ...defaultTabs[0], name: 'New Tab', id };
    dispatch(saveTaskTab(newTab));
  };

  const reset = () => dispatch(resetTaskTabs());

  return (
    <SettingsInterface
      title={InterfaceHeader.tabs}
      list={tabs}
      summary={(t) => (
        <>
          <Typography sx={{ width: '40%', flexShrink: 0, textTransform: 'capitalize' }}>{t.name}</Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              textTransform: 'capitalize',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {t.status?.join(', ')}
          </Typography>
        </>
      )}
      detail={(t) => <SettingsTab tab={t} />}
      addNew={addNew}
      reset={reset}
    />
  );
};
