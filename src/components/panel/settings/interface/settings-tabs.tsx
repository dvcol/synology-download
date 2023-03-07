import { Typography } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import type { ContentTab } from '@src/models';
import { defaultTabs, InterfaceHeader, TaskStatus } from '@src/models';
import type { StoreState } from '@src/store';
import { resetContentTabs, saveContentTab, setContentTabs } from '@src/store/actions';
import { getTabs } from '@src/store/selectors';

import { SettingsAccordion } from '../common';

import { SettingsTab } from './settings-tab';

const saskStatuses = Object.values(TaskStatus).map(String);
export const SettingsTabs = () => {
  const dispatch = useDispatch();
  const tabs = useSelector<StoreState, ContentTab[]>(getTabs);
  const i18n = useI18n();

  const addNew = (id: string) => {
    const newTab = { ...defaultTabs[0], name: 'New Tab', id };
    dispatch(saveContentTab(newTab));
  };

  const reset = () => dispatch(resetContentTabs());

  const onChange = (_tabs: ContentTab[]) => dispatch(setContentTabs(_tabs));

  const translate = (status: string) => i18n(status, 'common', 'model', saskStatuses.includes(status) ? 'task_status' : 'download_status');

  return (
    <SettingsAccordion
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
      detail={t => <SettingsTab tab={t} />}
      addNew={addNew}
      reset={reset}
      onChange={onChange}
    />
  );
};
