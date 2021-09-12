import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Container,
    Fab,
    MenuItem,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import {SettingHeader} from "../../models/settings.model";
import {
    addContextMenu,
    addTaskTab,
    removeContextMenu,
    removeTaskTab,
    set,
    SettingsState
} from "../../services/slices/settings.slice";
import {useDispatch, useSelector} from "react-redux";
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {defaultMenu} from "../../models/context-menu.model";
import {defaultTabs} from "../../models/tab.model";

export const Settings = () => {
    // form
    const settings = useSelector((state: SettingsState) => state.settings);
    const dispatch = useDispatch()
    const [error, setError] = React.useState(false);

    // Tab highlight
    const [header, setHeader] = React.useState(SettingHeader.connection);
    const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setHeader(newValue);

    //TODO : Refactor sub card
    const [expanded, setExpanded] = React.useState<string | false>(false);
    const handleExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    //TODO : Refactor sub card
    const [expanded2, setExpanded2] = React.useState<string | false>(false);
    const handleExpand2 = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded2(isExpanded ? panel : false);
    };

    return (
        <Container disableGutters sx={{display: "flex", flex: "1 1 auto", height: '30rem'}}>
            <Paper elevation={1}>
                <Tabs
                    orientation="vertical"
                    selectionFollowsFocus={true}
                    value={header}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{flex: '1 1 auto', '& .MuiTab-root': {alignItems: "flex-start"}}}
                >
                    {Object.values(SettingHeader).map((t) => <Tab label={t} value={t} disableFocusRipple={true}
                                                                  href={`#${t}`}/>)}
                </Tabs>
            </Paper>
            <Container sx={{padding: '1.5rem', overflow: 'auto', '& .MuiCard-root': {mb: '1rem'}}}>

                <Typography id={SettingHeader.connection} variant="h5" color="text.secondary"
                            sx={{mb: '1rem', textTransform: 'capitalize'}}>
                    {SettingHeader.connection}
                </Typography>

                <Card raised={true}>
                    <CardHeader
                        title={
                            <Typography variant="h6" color="text.primary">
                                Credentials
                            </Typography>
                        }
                        subheader={
                            <Typography variant="caption" color="text.secondary" gutterBottom={true}>
                                Two-factor authentication is not currently supported.
                            </Typography>
                        }
                        sx={{p: '1rem 1rem 0'}}
                    >
                    </CardHeader>
                    <CardContent>
                        <Box
                            component="form"
                            sx={{'& .MuiFormControl-root': {m: "0.5rem"},}}
                            noValidate
                            autoComplete="off"
                        >
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <TextField
                                    id="protocol-select"
                                    select
                                    label="Protocol"
                                    defaultValue="http"
                                    value={settings?.connection.protocol}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => dispatch(set({
                                        ...settings,
                                        connection: {protocol: event.target.value}
                                    }))}
                                    sx={{flex: '1 0 6rem'}}
                                    error={error}
                                >
                                    <MenuItem key="http" value="http">http</MenuItem>
                                    <MenuItem key="https" value="https">https</MenuItem>
                                </TextField>
                                <Typography id="protocol-path-slash" variant="body2" color="text.secondary">
                                    ://
                                </Typography>
                                <TextField
                                    id="host-input"
                                    label="Path"
                                    type="text"
                                    sx={{flex: '1 1 auto'}}
                                    error={error}
                                />
                                <Typography id="path-port-dot" variant="body2" color="text.secondary">
                                    :
                                </Typography>
                                <TextField
                                    id="port-input"
                                    label="Port"
                                    type="number"
                                    sx={{flex: '1 0 6rem'}}
                                    error={error}
                                />
                            </Box>
                            <Box sx={{display: 'flex'}}>
                                <TextField
                                    id="username-input"
                                    label="Username"
                                    type="text" sx={{flex: '1 1 auto'}}
                                    error={error}
                                />
                                <TextField
                                    id="password-input"
                                    label="Password"
                                    type="password" sx={{flex: '1 1 auto'}}
                                    error={error}
                                />
                            </Box>
                        </Box>
                    </CardContent>
                    <CardActions sx={{justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem'}}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="outlined" onClick={() => setError(!error)}>
                                Test connection
                            </Button>
                        </Stack>
                    </CardActions>
                </Card>


                <Typography id={SettingHeader.interface} variant="h5" color="text.secondary"
                            sx={{mb: '1rem', textTransform: 'capitalize'}}>
                    {SettingHeader.interface}
                </Typography>

                <Card raised={true}>
                    <CardHeader
                        title={
                            <Typography variant="h6" color="text.primary">
                                Tabs
                            </Typography>
                        }
                        sx={{p: '1rem 1rem 0'}}
                    >
                    </CardHeader>
                    <CardContent>
                        {settings?.tabs?.map((t) => (
                            <Accordion expanded={expanded2 === t.name} onChange={handleExpand2(t.name)}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography sx={{width: '33%', flexShrink: 0}}>
                                        {t.name}
                                    </Typography>
                                    <Typography sx={{color: 'text.secondary'}}>{t.status}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Fab color="primary" aria-label="add"
                                         onClick={() => dispatch(removeTaskTab(t.name))}>
                                        <AddIcon/>
                                    </Fab>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                    <CardActions sx={{justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem'}}>

                        <Fab color="primary" aria-label="add"
                             onClick={() => dispatch(addTaskTab({...defaultTabs[0], name: String(Math.random())}))}>
                            <AddIcon/>
                        </Fab>
                    </CardActions>
                </Card>

                <Card raised={true}>
                    <CardHeader
                        title={
                            <Typography variant="h6" color="text.primary">
                                Popup Modal
                            </Typography>
                        }
                        sx={{p: '1rem 1rem 0'}}
                    >
                    </CardHeader>
                    <CardContent>
                    </CardContent>
                </Card>

                <Card raised={true}>
                    <CardHeader
                        title={
                            <Typography variant="h6" color="text.primary">
                                Context action
                            </Typography>
                        }
                        sx={{p: '1rem 1rem 0'}}
                    >
                    </CardHeader>
                    <CardContent>

                        {settings?.menus?.map((t) => (
                            <Accordion expanded={expanded2 === t.id} onChange={handleExpand2(t.id)}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1bh-content"
                                    id="panel1bh-header"
                                >
                                    <Typography sx={{width: '33%', flexShrink: 0}}>
                                        {t.id}
                                    </Typography>
                                    <Typography sx={{color: 'text.secondary'}}>{t.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Fab color="primary" aria-label="add"
                                         onClick={() => dispatch(removeContextMenu(t.id))}>
                                        <AddIcon/>
                                    </Fab>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                    <CardActions sx={{justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem'}}>
                        <Fab color="primary" aria-label="add"
                             onClick={() => dispatch(addContextMenu({...defaultMenu, id: String(Math.random())}))}>
                            <AddIcon/>
                        </Fab>
                    </CardActions>
                </Card>

                <Typography id={SettingHeader.notification} variant="h5" color="text.secondary"
                            sx={{mb: '1rem', textTransform: 'capitalize'}}>
                    {SettingHeader.notification}
                </Typography>

            </Container>

        </Container>
    )
}

export default Settings;
