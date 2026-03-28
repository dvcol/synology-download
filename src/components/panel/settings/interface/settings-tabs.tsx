import type { ContentTab } from '../../../../models/tab.model';
import type { StoreState } from '../../../../store/store';

import { Typography } from '@mui/material';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { InterfaceHeader } from '../../../../models/settings.model';
import { templateTabs } from '../../../../models/tab.model';
import { TaskStatus } from '../../../../models/task.model';
import { resetContentTabs, saveContentTab, setContentTabs } from '../../../../store/actions/settings.action';
import { getTabs } from '../../../../store/selectors/settings.selector';
import { useI18n } from '../../../../utils/webex.utils';
import { SettingsAccordion } from '../common/settings-accordion';
import { SettingsTab } from './settings-tab';

const saskStatuses = Object.values(TaskStatus).map(String);
export function SettingsTabs() {
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
          onRemove={async () => {
            setExpanded(false);
            return new Promise((r) => {
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
}
