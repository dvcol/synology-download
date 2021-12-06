import { Accordion, AccordionDetails, AccordionSummary, Card, CardActions, CardContent, CardHeader, Fab, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { addContextMenu, getMenus, removeContextMenu } from '../../../store';
import AddIcon from '@mui/icons-material/Add';
import { defaultMenu, InterfaceHeader } from '../../../models';
import { v4 as uuid } from 'uuid';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const SettingsContext = () => {
  const dispatch = useDispatch();
  const menus = useSelector(getMenus);

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // TODO : migrate to react-hook-form & move this to login service
  const title = InterfaceHeader.context;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        {menus?.map((t) => (
          <Accordion expanded={expanded === t.id} onChange={handleExpand(t.id)} key={`${t.id}`}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
              <Typography sx={{ width: '33%', flexShrink: 0 }}>{t.id}</Typography>
              <Typography sx={{ color: 'text.secondary' }}>{t.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Fab color="primary" aria-label="add" onClick={() => dispatch(removeContextMenu(t.id))}>
                <AddIcon />
              </Fab>
            </AccordionDetails>
          </Accordion>
        ))}
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Fab color="primary" aria-label="add" onClick={() => dispatch(addContextMenu({ ...defaultMenu, id: uuid() }))}>
          <AddIcon />
        </Fab>
      </CardActions>
    </Card>
  );
};
