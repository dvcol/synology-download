import type { Dispatch, JSX, Ref, SetStateAction, SyntheticEvent } from 'react';

import type { GlobalSettings } from '../../../models/settings.model';
import type { StoreState } from '../../../store/store';
import type { ProgressBackgroundProps } from '../../common/loader/progress-background';

import { Accordion, AccordionDetails, AccordionSummary, ButtonGroup } from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { getGlobalTask } from '../../../store/selectors/settings.selector';
import { ProgressBackground } from '../../common/loader/progress-background';

export interface ContentItemAccordionProps {
  index: number;
  expanded: number | false;
  setExpanded: Dispatch<SetStateAction<number | false>>;
}

interface ContentItemProps {
  accordion: ContentItemAccordionProps;
  background?: ProgressBackgroundProps;
  summary: { card: JSX.Element; buttons?: JSX.Element };
  details?: JSX.Element;
  onToggle: (expanded: boolean) => void;
  onHover: (visible: boolean) => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function ContentItem({
  accordion: { index, expanded, setExpanded },
  background,
  summary,
  details,
  onToggle,
  onHover,
  className,
  ref,
}: ContentItemProps) {
  const [hover, setHover] = useState(false);

  const onChange = (_: SyntheticEvent, _expanded: boolean) => {
    setExpanded(_expanded ? index : false);
    onToggle(_expanded);
  };
  const onMouseHover = (_hover: boolean) => {
    onHover(_hover);
    setHover(_hover);
  };

  const showBackground = useSelector<StoreState, GlobalSettings['task']>(getGlobalTask)?.background;
  return (
    <Accordion ref={ref} className={className} expanded={expanded === index} onChange={onChange} slotProps={{ transition: { unmountOnExit: true } }}>
      <AccordionSummary
        aria-controls="task-content"
        id="task-header"
        sx={{ padding: 0, position: 'relative' }}
        onMouseOver={() => onMouseHover(true)}
        onMouseLeave={() => onMouseHover(false)}
      >
        {showBackground && background && <ProgressBackground {...background} />}
        {summary.card}
        {summary.buttons && hover && expanded !== index && (
          <ButtonGroup
            orientation="vertical"
            variant="text"
            sx={{
              display: 'flex',
              alignSelf: 'stretch',
              justifyContent: 'space-evenly',
            }}
          >
            {summary.buttons}
          </ButtonGroup>
        )}
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '1rem' }}>{details}</AccordionDetails>
    </Accordion>
  );
}
