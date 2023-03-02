import { Card, Grid, Stack, Typography } from '@mui/material';

import React from 'react';

import type { FC } from 'react';

type ContentDetailProps = {
  title?: JSX.Element;
  info: JSX.Element;
  buttons: JSX.Element;
  content?: JSX.Element;
};
export const ContentDetail: FC<ContentDetailProps> = ({ title, info, buttons, content }) => {
  return (
    <Typography component="span" variant="body2">
      {!!title && (
        <Grid container sx={{ alignItems: 'center', wordBreak: 'break-all', margin: '0 0 0.5rem' }}>
          {title}
        </Grid>
      )}
      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Grid item xs={6} sx={{ wordBreak: 'break-all', flexGrow: 1 }}>
          {info}
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Stack direction="row" spacing={2}>
            {buttons}
          </Stack>
        </Grid>
      </Grid>
      {!!content && (
        <Card
          elevation={0}
          sx={{
            mt: '1rem',
            maxHeight: '20rem',
            overflow: 'auto',
          }}
        >
          {content}
        </Card>
      )}
    </Typography>
  );
};

export default ContentDetail;
