import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Accordion, AccordionSummary, Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';

import React from 'react';
import { v4 as uuid } from 'uuid';

import { ButtonWithConfirm, SortableList } from '@src/components';
import type { InterfaceHeader } from '@src/models';
import { useI18n } from '@src/utils';

export const SettingsAccordion = <T extends { id: string }>({
  title,
  list,
  detail,
  summary,
  addNew,
  reset,
  onChange,
}: {
  title: InterfaceHeader;
  list: T[];
  summary: (item: T) => JSX.Element;
  detail: (item: T) => JSX.Element;
  addNew?: (id: string) => void;
  reset?: () => void;
  onChange?: (item: T[]) => void;
}) => {
  const i18n = useI18n('panel', 'settings', 'accordion');
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleExpand = (id: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? id : false);
  };

  const _addNew = () => {
    const id = uuid();
    addNew?.(id);
    setTimeout(() => setExpanded(id), 330);
  };

  const _reset = () => reset && reset();

  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={i18n(`title__${title}`)}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <SortableList
          values={list}
          render={(i: T) => (
            <Accordion
              key={i.id}
              expanded={expanded === i.id}
              onChange={handleExpand(i.id)}
              sx={{ borderRadius: '0' }}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ overflow: 'hidden' }}>
                {summary(i)}
              </AccordionSummary>
              {detail(i)}
            </Accordion>
          )}
          onChange={onChange}
          disabled={!!expanded}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={_reset}
          />
          <Button variant="outlined" color="primary" sx={{ flex: '0 1 8rem' }} startIcon={<AddIcon />} onClick={_addNew}>
            {i18n('add_new', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
