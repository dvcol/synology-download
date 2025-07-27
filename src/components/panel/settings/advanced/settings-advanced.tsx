import React from 'react';

import { SettingHeader } from '@src/models';

import { SettingsHeader } from '../settings-header';

import { SettingsChromeStorage } from './settings-chrome-storage';
import { SettingsExport } from './settings-export';
import { SettingsLogging } from './settings-logging';
import { SettingsRedux } from './settings-redux';

export const SettingsAdvanced = () => (
  <React.Fragment>
    <SettingsHeader label={SettingHeader.advanced} />
    <SettingsLogging />
    <SettingsExport />
    <SettingsRedux />
    <SettingsChromeStorage />
  </React.Fragment>
);

export default SettingsAdvanced;
