import * as React from 'react';

import { SettingHeader } from '../../../../models/settings.model';
import { SettingsHeader } from '../settings-header';
import { SettingsContextMenus } from './settings-context-menus';
import { SettingsGlobal } from './settings-global';
import { SettingsQuickMenus } from './settings-quick-menus';
import { SettingsTabs } from './settings-tabs';

export function SettingsInterface() {
  return (
    <React.Fragment>
      <SettingsHeader label={SettingHeader.interface} />
      <SettingsGlobal />
      <SettingsTabs />
      <SettingsQuickMenus />
      <SettingsContextMenus />
    </React.Fragment>
  );
}

export default SettingsInterface;
