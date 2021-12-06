import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';
import { SettingHeader } from '../../../models';

export const SettingsNotifications = () => {
  const title = SettingHeader.notification;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>Notifications settings</CardContent>
    </Card>
  );
};
