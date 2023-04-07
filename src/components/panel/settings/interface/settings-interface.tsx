import React from 'react';

import { SettingHeader } from '@src/models';

import { SettingsHeader } from '../settings-header';

import { SettingsContextMenus } from './settings-context-menus';
import { SettingsGlobal } from './settings-global';
import { SettingsQuickMenus } from './settings-quick-menus';
import { SettingsTabs } from './settings-tabs';

export const SettingsInterface = () => (
  <React.Fragment>
    <SettingsHeader label={SettingHeader.interface} />
    <SettingsGlobal />
    <SettingsTabs />
    <SettingsQuickMenus />
    <SettingsContextMenus />
  </React.Fragment>
);

export default SettingsInterface;
