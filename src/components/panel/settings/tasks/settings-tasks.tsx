import React from 'react';

import { SettingHeader } from '../../../../models/settings.model';
import { SettingsHeader } from '../settings-header';
import { SettingsTasksAdd } from './settings-tasks-add';

export function SettingsTasks() {
  return (
    <React.Fragment>
      <SettingsHeader label={SettingHeader.tasks} />
      <SettingsTasksAdd />
    </React.Fragment>
  );
}

export default SettingsTasks;
