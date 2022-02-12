import React, { useEffect } from 'react';
import { Box, Grid } from '@mui/material';
import { ApiInfo, InfoResponse } from '@src/models';
import { QueryService } from '@src/services';
import { useSelector } from 'react-redux';
import { getOption, getPopup } from '@src/store/selectors';

// TODO: dak info, file info, task info
export const Info = () => {
  const [infos, setInfos] = React.useState<InfoResponse>();

  useEffect(() => {
    QueryService.isReady && QueryService.info().subscribe((info) => setInfos(info));
  }, []);

  const popup = useSelector(getPopup);
  const option = useSelector(getOption);

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
    <Box>
      <span> Popup is open : {popup}</span>
      <span> Option is open : {option}</span>
      {infos &&
        Object.entries(infos)?.map(([k, v]) => (
          <div key={k}>
            <div>{k}</div>
            <ApiInfoDetail api={v} />
          </div>
        ))}
    </Box>
  );
};

export default Info;
