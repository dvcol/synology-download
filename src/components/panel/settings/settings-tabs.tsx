import { Accordion, AccordionSummary, Button, Card, CardActions, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getTabs, resetTaskTabs, saveTaskTab } from '../../../store';
import AddIcon from '@mui/icons-material/Add';
import { defaultTabs, InterfaceHeader } from '../../../models';
import { v4 as uuid } from 'uuid';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SettingsTab } from './settings-tab';

export const SettingsTabs = () => {
  const dispatch = useDispatch();
  const tabs = useSelector(getTabs);

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleExpand = (id: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? id : false);
  };

  const addNewTab = () => {
    const newTab = { ...defaultTabs[0], name: 'New Tab', id: uuid() };
    dispatch(saveTaskTab(newTab));
    setExpanded(newTab.id);
  };

  const resetTabs = () => dispatch(resetTaskTabs());

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
        {tabs?.map((t) => (
          <Accordion key={t.id} expanded={expanded === t.id} onChange={handleExpand(t.id)} sx={{ borderRadius: '0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header" sx={{ overflow: 'hidden' }}>
              <Typography sx={{ width: '33%', flexShrink: 0, textTransform: 'capitalize' }}>{t.name}</Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  textTransform: 'capitalize',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {t.status?.join(', ')}
              </Typography>
            </AccordionSummary>
            <SettingsTab tab={t} />
          </Accordion>
        ))}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
          <Button variant="outlined" color="secondary" sx={{ flex: '0 1 8rem' }} startIcon={<SettingsBackupRestoreIcon />} onClick={resetTabs}>
            Restore
          </Button>
          <Button variant="outlined" color="primary" sx={{ flex: '0 1 8rem' }} startIcon={<AddIcon />} onClick={addNewTab}>
            Add new
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
