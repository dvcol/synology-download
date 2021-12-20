import React, { useEffect } from 'react';
import { Card, Container } from '@mui/material';
import { Explorer } from '../file';
import { useForm } from 'react-hook-form';
import { QueryService } from '../../../services';
import { FormInput } from '../../form';

type TaskForm = {
  uri: string;
  source?: string; // Custom Task
  destination?: string;
  username?: string;
  password?: string;
  unzip?: string; // unzip password
};

// TODO :  can't select readonly folder
export const TaskAdd = () => {
  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { isValid, isDirty },
  } = useForm<TaskForm>({
    mode: 'onChange',
    defaultValues: {
      uri: '',
      source: 'Custom Task',
      destination: '',
      username: '',
      password: '',
      unzip: '',
    },
  });

  // move to store init
  useEffect(() => {
    QueryService.isReady && QueryService.config().subscribe(({ default_destination: destination }) => reset({ ...getValues(), destination }));
  }, []);

  return (
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 48px)', padding: '0.25rem' }}>
      <Card raised={true}>
        <FormInput
          controllerProps={{ name: 'uri', control }}
          textFieldProps={{
            label: 'Url',
            sx: { flex: '1 0 6rem' },
          }}
        />
        <FormInput
          controllerProps={{ name: 'destination', control }}
          textFieldProps={{
            label: 'Destination',
            sx: { flex: '1 0 6rem' },
            disabled: true,
          }}
        />
        <Card sx={{ p: '0.5rem 1rem', m: '0.5rem 0' }}>
          <Explorer flatten={true} disabled={true} />
        </Card>
      </Card>
    </Container>
  );
};
