import { Typography } from '@mui/material';

import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import type { ContentTab } from '@src/models';
import { InterfaceHeader, TaskStatus, templateTabs } from '@src/models';
import type { StoreState } from '@src/store';
import { resetContentTabs, saveContentTab, setContentTabs } from '@src/store/actions';
import { getTabs } from '@src/store/selectors';
import { useI18n } from '@src/utils';

import { SettingsAccordion } from '../common';

import { SettingsTab } from './settings-tab';

const saskStatuses = Object.values(TaskStatus).map(String);
export const SettingsTabs = () => {
  const dispatch = useDispatch();

  const tabs = useSelector<StoreState, ContentTab[]>(getTabs);
  const state = useState<string | false>(false);
  const setExpanded = state[1];

  const i18n = useI18n();

  const addNew = (id: string) => {
    const newTab = { ...templateTabs[0], name: 'New Tab', id };
    dispatch(saveContentTab(newTab));
  };

  const reset = () => dispatch(resetContentTabs());

  const onChange = (_tabs: ContentTab[]) => dispatch(setContentTabs(_tabs));

  const translate = (status: string) => i18n(status, 'common', 'model', saskStatuses.includes(status) ? 'task_status' : 'download_status');

  return (
    <SettingsAccordion
      state={state}
      title={InterfaceHeader.tabs}
      list={tabs}
      summary={t => (
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
            {t.status?.map(String).map(translate).join(', ')}
          </Typography>
        </>
      )}
      detail={t => (
        <SettingsTab
          tab={t}
          onRemove={() => {
            setExpanded(false);
            return new Promise(r => {
              setTimeout(r, 500);
            });
          }}
        />
      )}
      addNew={addNew}
      reset={reset}
      onChange={onChange}
    />
  );
};
