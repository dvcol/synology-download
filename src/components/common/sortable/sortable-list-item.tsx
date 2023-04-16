import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Box } from '@mui/material';

import React, { forwardRef } from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import type { BoxProps } from '@mui/material';
import type { ForwardRefRenderFunction, MouseEventHandler, PropsWithChildren, RefCallback } from 'react';

export type SortableItemProps = PropsWithChildren<{ id: UniqueIdentifier; box?: BoxProps; onClick?: MouseEventHandler; className?: string }>;
const SortableListItemComponent: ForwardRefRenderFunction<HTMLDivElement, SortableItemProps> = (
  { id, box, children, onClick, className },
  forward,
) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const _setRef: RefCallback<HTMLDivElement> = node => {
    if (typeof forward === 'function') forward(node);
    else if (forward) forward.current = node;
    setNodeRef(node);
  };

  return (
    <Box className={className} {...box} ref={_setRef} style={style} onClick={onClick} {...attributes} {...listeners}>
      {children}
    </Box>
  );
};

export const SortableListItem = forwardRef(SortableListItemComponent);
