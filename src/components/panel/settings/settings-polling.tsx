import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';

export const SettingsPolling = () => {
  return (
    <Card raised={true}>
      <CardHeader title={'Polling'} titleTypographyProps={{ variant: 'h6', color: 'text.primary' }} sx={{ p: '1rem 1rem 0' }} />
      <CardContent>Polling settings</CardContent>
    </Card>
  );
};
