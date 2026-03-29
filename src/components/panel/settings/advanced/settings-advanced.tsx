import * as React from 'react';

import { SettingHeader } from '../../../../models/settings.model';
import { SettingsHeader } from '../settings-header';
import { SettingsChromeStorage } from './settings-chrome-storage';
import { SettingsExport } from './settings-export';
import { SettingsLogging } from './settings-logging';
import { SettingsRedux } from './settings-redux';

export function SettingsAdvanced() {
  return (
    <React.Fragment>
      <SettingsHeader label={SettingHeader.advanced} />
      <SettingsLogging />
      <SettingsExport />
      <SettingsRedux />
      <SettingsChromeStorage />
    </React.Fragment>
  );
}

export default SettingsAdvanced;
