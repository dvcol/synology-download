import { Box, Button, InputAdornment } from '@mui/material';

import React from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

import type { TextFieldProps } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

export type FormInputFileProps = {
  onChange: TextFieldProps['onChange'];
  split?: boolean;
  accept?: string;
};
export const FormInputFile: FC<PropsWithChildren<FormInputFileProps>> = ({ onChange, split, accept }) => {
  const i18n = useI18n('common', 'form', 'input');
  const File = (
    <>
      <input accept={accept} hidden={true} id="raised-button-file" type="file" onChange={onChange} />
      <Box component="label" htmlFor="raised-button-file" sx={{ marginLeft: split ? '0' : '-1em', marginRight: '0.75em' }}>
        <Button variant="outlined" component="span">
          {i18n('upload')}
        </Button>
      </Box>
    </>
  );
  if (split) return File;
  return <InputAdornment position="end">{File}</InputAdornment>;
};
