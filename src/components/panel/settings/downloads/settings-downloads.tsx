import React from 'react';

import { SettingHeader } from '@src/models';

import { SettingsHeader } from '../settings-header';

import { SettingsDownloadsHistory } from './settings-downloads-history';
import { SettingsDownloadsIntercept } from './settings-downloads-intercept';
import { SettingsDownloadsLocal } from './settings-downloads-local';

export const SettingsDownloads = () => (
  <React.Fragment>
    <SettingsHeader label={SettingHeader.downloads} />
    <SettingsDownloadsLocal />
    <SettingsDownloadsIntercept />
    <SettingsDownloadsHistory />
  </React.Fragment>
);

export default SettingsDownloads;
