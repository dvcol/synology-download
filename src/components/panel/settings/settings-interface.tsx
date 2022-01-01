import { Accordion, AccordionSummary, Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuid } from 'uuid';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import React from 'react';

export const SettingsInterface = <T extends { id: string }>({
  title,
  list,
  detail,
  summary,
  addNew,
  reset,
}: {
  title: string;
  list: T[];
  summary: (item: T) => JSX.Element;
  detail: (item: T) => JSX.Element;
  addNew?: (id: string) => void;
  reset?: () => void;
}) => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleExpand = (id: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? id : false);
  };

  const _addNew = () => {
    const id = uuid();
    addNew && addNew(id);
    setExpanded(id);
  };

  const _reset = () => reset && reset();

  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        {list?.map((i) => (
          <Accordion
            key={i.id}
            expanded={expanded === i.id}
            onChange={handleExpand(i.id)}
            sx={{ borderRadius: '0' }}
            TransitionProps={{ unmountOnExit: true }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header" sx={{ overflow: 'hidden' }}>
              {summary(i)}
            </AccordionSummary>
            {detail(i)}
          </Accordion>
        ))}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
          <Button variant="outlined" color="secondary" sx={{ flex: '0 1 8rem' }} startIcon={<SettingsBackupRestoreIcon />} onClick={_reset}>
            Restore
          </Button>
          <Button variant="outlined" color="primary" sx={{ flex: '0 1 8rem' }} startIcon={<AddIcon />} onClick={_addNew}>
            Add new
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
