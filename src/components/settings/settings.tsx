import React from 'react';
import {Button, Card, CardActions, CardContent, Container, Paper, Stack, Tab, Tabs, Typography} from "@mui/material";
import {SettingHeader} from "../../models/settings.model";

export const Settings = () => {
    const [setting, setSetting] = React.useState(SettingHeader.connection);
    const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setSetting(newValue);

    return (
        <Container disableGutters sx={{display: "flex", flex: "1 1 auto", maxHeight: '30rem'}}>
            <Paper sx={{flex: "1 0 10rem"}} elevation={1}>
                <Tabs
                    orientation="vertical"
                    selectionFollowsFocus={true}
                    value={setting}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{flex: '1 1 auto'}}
                >
                    {Object.values(SettingHeader).map((t) => <Tab label={t} disableFocusRipple={true} href={`#${t}`}/>)}
                </Tabs>
            </Paper>
            <Container sx={{padding: '1.5rem', overflow: 'auto'}}>

                <Typography id={SettingHeader.connection} sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                    Connection
                </Typography>

                <Card>
                    <CardContent>
                        <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                            Word of the Day
                        </Typography>
                        <Typography variant="body2">
                            well meaning and kindly.
                            <br/>
                            {'"a benevolent smile"'}
                        </Typography>
                    </CardContent>
                    <CardActions sx={{justifyContent: 'flex-end'}}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" color="success">
                                Save
                            </Button>
                            <Button variant="outlined" color="error">
                                Cancel
                            </Button>
                        </Stack>
                    </CardActions>
                </Card>

                <Card>
                    <CardContent>
                        <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                            Word of the Day
                        </Typography>
                        <Typography variant="body2">
                            well meaning and kindly.
                            <br/>
                            {'"a benevolent smile"'}
                        </Typography>
                    </CardContent>
                    <CardActions sx={{justifyContent: 'flex-end'}}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" color="success">
                                Save
                            </Button>
                            <Button variant="outlined" color="error">
                                Cancel
                            </Button>
                        </Stack>
                    </CardActions>
                </Card>

                <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                    Interface
                </Typography>

                <Card>
                    <CardContent>
                        <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
                            Word of the Day
                        </Typography>
                        <Typography variant="body2">
                            well meaning and kindly.
                            <br/>
                            {'"a benevolent smile"'}
                        </Typography>
                    </CardContent>
                    <CardActions sx={{justifyContent: 'flex-end'}}>
                        <Stack direction="row" spacing={2}>
                            <Button variant="contained" color="success">
                                Save
                            </Button>
                            <Button variant="outlined" color="error">
                                Cancel
                            </Button>
                        </Stack>
                    </CardActions>
                </Card>
            </Container>

        </Container>
    )
}

export default Settings;
