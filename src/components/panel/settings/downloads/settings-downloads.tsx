import React from 'react';

import { SettingHeader } from '../../../../models/settings.model';
import { SettingsHeader } from '../settings-header';
import { SettingsDownloadsHistory } from './settings-downloads-history';
import { SettingsDownloadsIntercept } from './settings-downloads-intercept';
import { SettingsDownloadsLocal } from './settings-downloads-local';

export function SettingsDownloads() {
  return (
    <React.Fragment>
      <SettingsHeader label={SettingHeader.downloads} />
      <SettingsDownloadsLocal />
      <SettingsDownloadsIntercept />
      <SettingsDownloadsHistory />
    </React.Fragment>
  );
}

export default SettingsDownloads;
