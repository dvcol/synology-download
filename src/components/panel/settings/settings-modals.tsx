import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';

export const SettingsModal = () => {
  return (
    <Card raised={true}>
      <CardHeader title={'Popup Modal'} titleTypographyProps={{ variant: 'h6', color: 'text.primary' }} sx={{ p: '1rem 1rem 0' }} />
      <CardContent>Modal settings</CardContent>
    </Card>
  );
};
