import { Accordion, AccordionDetails, AccordionSummary, ButtonGroup } from '@mui/material';

import React, { forwardRef, useState } from 'react';

import { useSelector } from 'react-redux';

import type { ProgressBackgroundProps } from '@src/components';
import { ProgressBackground } from '@src/components';

import type { GlobalSettings } from '@src/models';
import type { StoreState } from '@src/store';
import { getGlobalTask } from '@src/store/selectors';

import type { Dispatch, ForwardRefRenderFunction, SetStateAction } from 'react';

export type ContentItemAccordionProps = {
  index: number;
  expanded: number | false;
  setExpanded: Dispatch<SetStateAction<number | false>>;
};

type ContentItemProps = {
  accordion: ContentItemAccordionProps;
  background?: ProgressBackgroundProps;
  summary: { card: JSX.Element; buttons?: JSX.Element };
  details?: JSX.Element;
  onToggle: (expanded: boolean) => void;
  onHover: (visible: boolean) => void;
};

const ContentItemComponent: ForwardRefRenderFunction<HTMLDivElement, ContentItemProps> = (
  { accordion: { index, expanded, setExpanded }, background, summary, details, onToggle, onHover },
  ref,
) => {
  const [hover, setHover] = useState(false);

  const onChange = (_: React.SyntheticEvent, _expanded: boolean) => {
    setExpanded(_expanded ? index : false);
    onToggle(_expanded);
  };
  const onMouseHover = (_hover: boolean) => {
    onHover(_hover);
    setHover(_hover);
  };

  const showBackground = useSelector<StoreState, GlobalSettings['task']>(getGlobalTask)?.background;
  return (
    <Accordion ref={ref} expanded={expanded === index} onChange={onChange} TransitionProps={{ unmountOnExit: true }}>
      <AccordionSummary
        aria-controls="task-content"
        id="task-header"
        sx={{ padding: 0, position: 'relative' }}
        onMouseOver={() => onMouseHover(true)}
        onMouseLeave={() => onMouseHover(false)}
      >
        {showBackground && background && <ProgressBackground {...background} />}
        {summary.card}
        {summary.buttons && hover && !expanded && (
          <ButtonGroup orientation="vertical" variant="text">
            {summary.buttons}
          </ButtonGroup>
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '1rem' }}>{details}</AccordionDetails>
    </Accordion>
  );
};

export const ContentItem = forwardRef(ContentItemComponent);
