/* eslint-disable react/no-array-index-key  -- tab can have duplicate labels */
import type { FC, SyntheticEvent } from 'react';

import type { SettingsPanelTab } from '../../../models/settings.model';

import { Paper, Tab, Tabs } from '@mui/material';
import React from 'react';

import { AppRoute } from '../../../models/routes.model';
import { SettingHeader } from '../../../models/settings.model';
import { useI18n } from '../../../utils/webex.utils';
import { HashLink as Link } from '../../common/router/hash-link';

interface SettingsNavbarProps { tabs: SettingsPanelTab[] }
export const SettingsNavbar: FC<SettingsNavbarProps> = ({ tabs }) => {
  const i18n = useI18n('panel', 'settings');

  const [tab, setTab] = React.useState<string>(SettingHeader.connection);
  const handleChange = (event: SyntheticEvent, newValue: SettingHeader) => setTab(newValue);

  return (
    <Paper elevation={1} sx={{ overflow: 'auto' }}>
      <Tabs
        orientation="vertical"
        selectionFollowsFocus={true}
        value={tab}
        onChange={handleChange}
        sx={{
          'flex': '1 1 auto',
          '& .MuiTab-root': {
            alignItems: 'flex-start',
            minWidth: '9rem',
          },
          'overflow': 'auto',
        }}
      >
        {tabs.map(({ label, anchor, links }, i) => [
          <Tab
            label={i18n(label)}
            key={`${i}-${label}`}
            value={label}
            disableFocusRipple={true}
            component={Link}
            to={`${AppRoute.Settings}/${label}#${anchor ?? label}`}
            sx={{
              fontWeight: '700',
              fontSize: '0.75rem',
              backdropFilter: 'contrast(1.1)',
              whiteSpace: 'nowrap',
              minHeight: '3rem',
            }}
          />,
          ...(links?.map((l, j) => (
            <Tab
              label={i18n(`${label}_${l}`)}
              key={`${i}-${j}-${l}`}
              value={l}
              disableFocusRipple={true}
              component={Link}
              to={`${AppRoute.Settings}/${label}#${l}`}
              sx={{ backdropFilter: 'contrast(0.9)', whiteSpace: 'nowrap', minHeight: '2.78rem' }}
            />
          )) ?? []),
        ])}
      </Tabs>
    </Paper>
  );
};
/* eslint-enable react/no-array-index-key */
