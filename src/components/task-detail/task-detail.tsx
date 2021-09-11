import React from 'react';
import {Button, Container, Grid, ListItem, ListItemText, Stack, Typography} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {computeProgress, formatBytes, Task, TaskStatus} from "../../models/task.model";
import PauseIcon from "@mui/icons-material/Pause";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {isDarkTheme} from "../../themes/dark.theme";
import {grey} from "@mui/material/colors";
import ProgressBar from "../progress-bar/progress-bar";


const TaskDetail = ({task}: { task: Task }) => {

    return (
        <Typography
            component="span"
            variant="body2"
        >
            <Grid container sx={{alignItems: 'center'}}>
                <Grid item xs={4}>
                    <span>Destination: {task.additional?.detail?.destination}</span>
                </Grid>
                <Grid item xs={8} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                    <Stack direction="row" spacing={2}>
                        <Button startIcon={<PlayArrowIcon/>}
                                variant="contained"
                                color="success"
                                disabled={![TaskStatus.paused, TaskStatus.finished].includes(task.status)}
                        >Play</Button>
                        <Button startIcon={<PauseIcon/>}
                                variant="contained"
                                color="warning"
                                disabled={![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(task.status)}
                        >Pause</Button>

                        <Button startIcon={<EditIcon/>}
                                variant="outlined"
                                color="secondary"
                                disabled={![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused].includes(task.status)}
                        >Edit</Button>
                        <Button startIcon={<DeleteIcon/>} variant="outlined"
                                color="error">Delete</Button>
                    </Stack>
                </Grid>
            </Grid>
            <Container disableGutters sx={{
                mt: '1rem', maxHeight: '13rem', overflow: 'auto',
                bgcolor: isDarkTheme() ? grey[900] : grey[200]
            }}>
                {task.additional?.file?.map((f) => (
                    <ListItem>
                        <ListItemText
                            primary={<Typography
                                sx={{display: 'inline'}}
                                component="span"
                                variant="caption"
                                color="text.secondary"
                            >
                                <Grid container>
                                    <Grid item xs={8}>
                                        <span>{f.priority}</span>
                                        <span> – </span>
                                        <span>{f.filename}</span>
                                    </Grid>
                                    <Grid item xs={4}
                                          sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                        {formatBytes(f.size_downloaded)} of {formatBytes(f.size)} downloaded
                                    </Grid>
                                </Grid>
                            </Typography>}
                            secondary={<ProgressBar
                                variant="determinate"
                                value={computeProgress(f.size_downloaded, f.size)}
                            />}
                        />
                    </ListItem>
                ))}
            </Container>
        </Typography>
    )
}

export default TaskDetail;
