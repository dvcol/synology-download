import React from 'react';

import { SettingHeader } from '@src/models';

import { SettingsHeader } from '../settings-header';
import { SettingsCredentials } from './settings-credentials';
import { SettingsPolling } from './settings-polling';

export function SettingsConnection() {
  return (
    <React.Fragment>
      <SettingsHeader label={SettingHeader.connection} />
      <SettingsCredentials />
      <SettingsPolling />
    </React.Fragment>
  );
}

export default SettingsConnection;
