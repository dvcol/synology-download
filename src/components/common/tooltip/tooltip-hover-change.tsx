import type { BoxProps, TooltipProps } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

import type { ModifiedEvent } from '../../../models/navbar.model';

import { Box, Tooltip } from '@mui/material';
import { useState } from 'react';

export interface TooltipHoverChangeProps extends PropsWithChildren {
  title?: string;
  hoverTooltip?: ($event: ModifiedEvent) => string | undefined;
  props?: Omit<TooltipProps, 'title' | 'children'>;
  boxProps?: BoxProps;
  getContainer?: () => Element | null;
}

export const TooltipHoverChange: FC<TooltipHoverChangeProps> = ({ title, hoverTooltip, children, props, boxProps, getContainer }) => {
  const [tooltip, setTooltip] = useState<string | undefined>(title);

  const onEvent = ($event: ModifiedEvent) => {
    if (hoverTooltip) setTooltip(hoverTooltip($event));
  };

  return (
    <Tooltip arrow title={tooltip ?? ''} slotProps={{ popper: { disablePortal: !getContainer, container: getContainer } }} {...props}>
      <Box {...boxProps} onMouseOver={onEvent} onKeyUp={onEvent} onKeyDown={onEvent}>
        {children}
      </Box>
    </Tooltip>
  );
};

export default TooltipHoverChange;
