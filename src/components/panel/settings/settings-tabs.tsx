import { Accordion, AccordionDetails, AccordionSummary, Card, CardActions, CardContent, CardHeader, Collapse, Fab, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { addTaskTab, getTabs, removeTaskTab, resetTaskTab } from '../../../store';
import AddIcon from '@mui/icons-material/Add';
import { defaultTabs, InterfaceHeader } from '../../../models';
import { v4 as uuid } from 'uuid';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';

export const SettingsTabs = () => {
  const dispatch = useDispatch();
  const tabs = useSelector(getTabs);
  const [expanded, setExpanded] = React.useState<string | false>(false);

  // TODO : migrate to react-hook-form & move this to login service
  const handleExpand2 = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const title = InterfaceHeader.tabs;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        <TransitionGroup component={null}>
          {tabs?.map((t) => (
            <Collapse key={t.id}>
              <Accordion expanded={expanded === t.name} onChange={handleExpand2(t.name)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>{t.name}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{t.status}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Fab color="primary" aria-label="add" onClick={() => dispatch(removeTaskTab(t.id))}>
                    <AddIcon />
                  </Fab>
                </AccordionDetails>
              </Accordion>
            </Collapse>
          ))}
        </TransitionGroup>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Fab
          color="primary"
          aria-label="add"
          onClick={() =>
            dispatch(
              addTaskTab({
                ...defaultTabs[0],
                name: String(Math.random()),
                id: uuid(),
              })
            )
          }
        >
          <AddIcon />
        </Fab>
        <Fab color="primary" aria-label="reset" onClick={() => dispatch(resetTaskTab())}>
          <SettingsBackupRestoreIcon />
        </Fab>
      </CardActions>
    </Card>
  );
};
