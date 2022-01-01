import { Accordion, AccordionSummary, Button, Card, CardActions, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import React from 'react';
import { InterfaceHeader } from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { getQuick, resetQuickMenus, saveQuickMenu, StoreState } from '../../../store';
import { defaultQuickMenu, QuickMenu } from '../../../models/quick-menu.model';
import { v4 as uuid } from 'uuid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import AddIcon from '@mui/icons-material/Add';
import { SettingsMenu } from './settings-menu';

export const SettingsQuickMenu = () => {
  const dispatch = useDispatch();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleExpand = (id: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? id : false);
  };

  const addNew = () => {
    const newMenu = { ...defaultQuickMenu, id: uuid() };
    dispatch(saveQuickMenu(newMenu));
    setExpanded(newMenu.id);
  };

  const reset = () => dispatch(resetQuickMenus());

  const title = InterfaceHeader.quickMenu;
  return (
    <Card raised={true}>
      <CardHeader id={title} title={title} titleTypographyProps={{ variant: 'h6', color: 'text.primary' }} sx={{ p: '1rem 1rem 0' }} />
      <CardContent>
        {menus?.map((m) => (
          <Accordion
            key={m.id}
            expanded={expanded === m.id}
            onChange={handleExpand(m.id)}
            sx={{ borderRadius: '0' }}
            TransitionProps={{ unmountOnExit: true }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header" sx={{ overflow: 'hidden' }}>
              <Typography sx={{ width: '40%', flexShrink: 0 }}>{m.title}</Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {m.destination?.path?.replaceAll('/', ' / ') ?? 'Default folder'}
              </Typography>
            </AccordionSummary>
            <SettingsMenu menu={m} />
          </Accordion>
        ))}
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', flex: '1 1 auto' }}>
          <Button variant="outlined" color="secondary" sx={{ flex: '0 1 8rem' }} startIcon={<SettingsBackupRestoreIcon />} onClick={reset}>
            Restore
          </Button>
          <Button variant="outlined" color="primary" sx={{ flex: '0 1 8rem' }} startIcon={<AddIcon />} onClick={addNew}>
            Add new
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
