import { styled } from '@mui/material';

import React, { createRef, forwardRef } from 'react';

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

type ComponentProps = {
  item: Content;
  accordion: ContentItemAccordionProps;
  hideStatus: boolean;
  setTaskEdit: TaskItemProps['setTaskEdit'];
  setConfirmation: TaskItemProps['setConfirmation'];
  className?: string;
};
const Component: ForwardRefRenderFunction<HTMLDivElement, ComponentProps> = (
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
const StyledComponent = styled(forwardRef(Component))<StylingProps>`
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

type TransitionProps = { content: ComponentProps & Pick<StylingProps, 'index'> } & Partial<CSSTransitionProps>;
const TransitionComponent: FC<TransitionProps> = props => {
  const ref = createRef<HTMLDivElement>();
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
      {state => <StyledComponent ref={ref} state={state} {...content} />}
    </CSSTransition>
  );
};

export const ContentItemInstance = TransitionComponent;
