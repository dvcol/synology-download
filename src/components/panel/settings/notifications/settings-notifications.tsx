import React from 'react';

import { SettingHeader } from '@src/models';

import { SettingsHeader } from '../settings-header';

import { SettingsBanner } from './settings-banner';
import { SettingsSnack } from './settings-snack';
import { SettingsTasksCount } from './settings-tasks-count';

export const SettingsNotifications = () => (
  <React.Fragment>
    <SettingsHeader label={SettingHeader.notification} />
    <SettingsTasksCount />
    <SettingsSnack />
    <SettingsBanner />
  </React.Fragment>
);

export default SettingsNotifications;
