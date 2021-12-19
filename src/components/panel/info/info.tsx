import React, { useEffect } from 'react';
import { Container, Grid } from '@mui/material';
import { ApiInfo, InfoResponse } from '../../../models';
import { QueryService } from '../../../services';
import { tap } from 'rxjs';

// TODO: dak info, file info, task info
export const Info = () => {
  const [infos, setInfos] = React.useState<InfoResponse>();

  useEffect(() => {
    QueryService.isReady &&
      QueryService.info()
        .pipe(tap(console.log))
        .subscribe((res) => setInfos(res?.data));
  }, []);

  const ApiInfoDetail = ({ api }: { api: ApiInfo }) => (
    <Grid container>
      <Grid item xs={2}>
        path :
      </Grid>
      <Grid item xs={10}>
        {api?.path}
      </Grid>
      <Grid item xs={2}>
        minVersion
      </Grid>
      <Grid item xs={10}>
        {api?.minVersion}
      </Grid>
      <Grid item xs={2}>
        maxVersion
      </Grid>
      <Grid item xs={10}>
        {api?.maxVersion}
      </Grid>
    </Grid>
  );
  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 48px)', flexDirection: 'column' }} maxWidth={false}>
      {infos &&
        Object.entries(infos)?.map(([k, v]) => (
          <div key={k}>
            <div>{k}</div>
            <ApiInfoDetail api={v} />
          </div>
        ))}
    </Container>
  );
};

export default Info;
