import React, { useEffect, useState } from 'react';
import { Button, CardActions, Container, LinearProgress, Stack } from '@mui/material';
import { defaultConfig, DownloadStationConfig } from '@src/models';
import { NotificationService, QueryService } from '@src/services';
import { SubmitHandler, useForm } from 'react-hook-form';
import { before, useI18n } from '@src/utils';
import { useDebounceObservable } from '@src/utils/hooks-utils';
import { finalize, Observable } from 'rxjs';

// TODO: check admin permission & isready, else show error/worning
export const Config = () => {
  const i18n = useI18n('panel', 'config');
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<DownloadStationConfig>({ mode: 'onChange', defaultValues: defaultConfig });

  const [error, setError] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBar, setLoadingBar] = useState<boolean>(false);

  // Loading observable for debounce
  const loadingBar$ = useDebounceObservable<boolean>(setLoadingBar);
  const loadingOperator = <T,>(source: Observable<T>) =>
    source.pipe<T, T>(
      before(() => {
        setError(undefined);
        setLoading(true);
        loadingBar$.next(true);
      }),
      finalize(() => {
        setLoading(false);
        setLoadingBar(false); // So there is no delay
        loadingBar$.next(false); // So that observable data is not stale
      })
    );

  useEffect(() => {
    QueryService.isReady &&
      QueryService.getConfig()
        .pipe(loadingOperator)
        .subscribe((_config) => reset(_config));
  }, []);

  const onSubmit: SubmitHandler<DownloadStationConfig> = (config) => {
    QueryService.setConfig(config)
      .pipe(loadingOperator)
      .subscribe({
        complete: () => {
          setError(false);
          reset(config);
          NotificationService.info({ title: 'Config change succes TODO', success: true });
        },
        error: () => {
          setError(true);
          NotificationService.error({ title: 'Error TODO' });
        },
      });
  };

  const onSubmitColor = () => {
    if (error === undefined || isDirty) return 'info';
    return error ? 'error' : 'success';
  };

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 48px)' }} maxWidth={false}>
      <LinearProgress
        sx={{
          height: '2px',
          transition: 'opacity 0.3s linear',
          opacity: loadingBar ? 1 : 0,
        }}
      />
      COntent
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 24px 24px' }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '80px', fontSize: '12px' }}
            type="submit"
            disabled={!isValid || loading || !QueryService.isReady}
            onClick={handleSubmit(onSubmit)}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Container>
  );
};

export default Config;
