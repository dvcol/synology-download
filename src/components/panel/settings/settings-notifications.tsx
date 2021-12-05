import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';

export const SettingsNotifications = () => {
  return (
    <Card raised={true}>
      <CardHeader title={'Notifications'} titleTypographyProps={{ variant: 'h6', color: 'text.primary' }} sx={{ p: '1rem 1rem 0' }} />
      <CardContent>Notifications settings</CardContent>
    </Card>
  );
};
