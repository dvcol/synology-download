import React from 'react';

import { SettingHeader } from '@src/models';

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
