import { styled } from '@mui/material';

import React, { createRef } from 'react';

import { CSSTransition } from 'react-transition-group';

import { slideInAnimation, slideOutAnimation } from '@src/utils';

import { SortableListItem } from './sortable-list-item';

import type { SortableItemProps } from './sortable-list-item';
import type { FC, PropsWithChildren } from 'react';
import type { TransitionStatus } from 'react-transition-group';
import type { CSSTransitionProps } from 'react-transition-group/CSSTransition';

const duration = { enter: 300, exit: 300 };
type StylingProps = { state: TransitionStatus; index: number };
const StyledComponent = styled(SortableListItem)<StylingProps>`
  animation-fill-mode: both;

  &.slide-enter {
    animation-name: ${slideInAnimation};
    animation-duration: ${duration.enter}ms;
    animation-timing-function: ease-in-out;
  }

  &.slide-exit {
    animation-name: ${slideOutAnimation};
    animation-duration: ${duration.exit}ms;
    animation-timing-function: ease-in-out;
    transition: max-height ${duration.exit}ms ease-in-out;
  }
`;

type TransitionProps = PropsWithChildren<{ item: Omit<SortableItemProps, 'children'> & Pick<StylingProps, 'index'> } & Partial<CSSTransitionProps>>;
export const SortableListItemTransition: FC<TransitionProps> = props => {
  const ref = createRef<HTMLDivElement>();
  const { children, item, ..._props } = props;
  return (
    <CSSTransition key={item.id} classNames="slide" nodeRef={ref} timeout={duration} unmountOnExit {..._props}>
      {state => (
        <StyledComponent ref={ref} state={state} key={item.id} {...item}>
          {children}
        </StyledComponent>
      )}
    </CSSTransition>
  );
};
