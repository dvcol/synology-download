import { styled } from '@mui/material';

import React, { forwardRef, useRef } from 'react';

import { CSSTransition } from 'react-transition-group';

import type { TaskItemProps } from '@src/components';
import { DownloadItem, TaskItem } from '@src/components';
import type { ContentItemAccordionProps } from '@src/components/panel/content/content-item';
import type { Content, Download, Task } from '@src/models';
import { ContentSource } from '@src/models';

import { slideDownAnimation, slideOutAnimation } from '@src/utils';

import type { FC, ForwardRefRenderFunction } from 'react';
import type { TransitionStatus } from 'react-transition-group';
import type { CSSTransitionProps } from 'react-transition-group/CSSTransition';

type ItemComponentProps = {
  item: Content;
  accordion: ContentItemAccordionProps;
  hideStatus: boolean;
  setTaskEdit: TaskItemProps['setTaskEdit'];
  setConfirmation: TaskItemProps['setConfirmation'];
  className?: string;
};
const ItemComponent: ForwardRefRenderFunction<HTMLDivElement, ItemComponentProps> = (
  { item, accordion, hideStatus, setTaskEdit, setConfirmation, className },
  ref,
) => {
  if (item.source === ContentSource.Download) {
    return <DownloadItem ref={ref} className={className} accordion={accordion} download={item as Download} hideStatus={hideStatus} />;
  }
  if (item.source === ContentSource.Task) {
    return (
      <TaskItem
        ref={ref}
        className={className}
        accordion={accordion}
        task={item as Task}
        hideStatus={hideStatus}
        setTaskEdit={setTaskEdit}
        setConfirmation={setConfirmation}
      />
    );
  }
  return null;
};

const duration = { enter: 300, exit: 300 };
const STAGGER = 50;
type StylingProps = { state: TransitionStatus; index: number };
const StyledItemComponent = styled(forwardRef(ItemComponent))<StylingProps>`
  z-index: 0;
  animation-fill-mode: both;

  &.slide-appear,
  &.slide-enter {
    animation-name: ${slideDownAnimation};
    animation-duration: ${duration.enter}ms;
    animation-timing-function: ease-in-out;
  }

  &.slide-enter-done {
    z-index: 1;
  }

  &.slide-exit {
    animation-name: ${slideOutAnimation};
    animation-duration: ${duration.exit}ms;
    animation-timing-function: ease-in-out;
    transition: max-height ${duration.exit}ms ease-in-out;
  }
`;

type ItemTransitionProps = { content: ItemComponentProps & Pick<StylingProps, 'index'> } & Partial<CSSTransitionProps>;
const TransitionComponent: FC<ItemTransitionProps> = props => {
  const ref = useRef<HTMLDivElement>(null);
  const { content, ..._props } = props;
  const { index, item } = content;
  return (
    <CSSTransition
      key={item.key ?? item.id}
      classNames="slide"
      nodeRef={ref}
      timeout={{ ...duration, appear: duration.enter + index * STAGGER }}
      unmountOnExit
      {..._props}
    >
      {state => <StyledItemComponent ref={ref} state={state} {...content} />}
    </CSSTransition>
  );
};

export const ContentItemInstance = TransitionComponent;
