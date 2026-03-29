import type { BoxProps, ButtonProps, TooltipProps } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

import { Box, Button, Tooltip } from '@mui/material';

export interface ContentButtonProps extends PropsWithChildren {
  TooltipProps: Omit<TooltipProps, 'children'>;
  ButtonProps: ButtonProps;
  BoxProps?: Partial<BoxProps>;
}

export const ContentButton: FC<ContentButtonProps> = ({ TooltipProps, BoxProps, ButtonProps, children }) => {
  const { key, ...buttonProps } = ButtonProps as ButtonProps & { key?: string };
  return (
    <Tooltip arrow placement="left" {...TooltipProps} slotProps={{ popper: { disablePortal: true, ...TooltipProps?.slotProps?.popper } }}>
      <Box
        {...BoxProps}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          ...BoxProps?.sx,
        }}
      >
        <Button
          key={key}
          component="span"
          {...buttonProps}
          sx={{
            p: '0 1rem',
            ...buttonProps?.sx,
          }}
        >
          {children}
        </Button>
      </Box>
    </Tooltip>
  );
};
