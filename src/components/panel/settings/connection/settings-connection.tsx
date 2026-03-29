import * as React from 'react';

import { SettingHeader } from '../../../../models/settings.model';
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
