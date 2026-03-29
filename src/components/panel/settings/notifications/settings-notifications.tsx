import * as React from 'react';

import { SettingHeader } from '../../../../models/settings.model';
import { SettingsHeader } from '../settings-header';
import { SettingsBanner } from './settings-banner';
import { SettingsSnack } from './settings-snack';
import { SettingsTasksCount } from './settings-tasks-count';

export function SettingsNotifications() {
  return (
    <React.Fragment>
      <SettingsHeader label={SettingHeader.notification} />
      <SettingsTasksCount />
      <SettingsSnack />
      <SettingsBanner />
    </React.Fragment>
  );
}

export default SettingsNotifications;
