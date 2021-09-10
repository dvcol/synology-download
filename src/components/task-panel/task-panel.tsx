import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Container,
    Grid,
    ListItem,
    ListItemText,
    Stack,
    Typography
} from "@mui/material";
import TaskCard from "../task-card/task-card";
import {synologyClient} from "../../services/http/synology-client";
import {finalize, tap} from "rxjs";
import {useSelector} from "react-redux";
import {NavbarState} from "../../services/slices/navbar.slice";
import {computeProgress, formatBytes, Task, TaskStatus} from "../../models/task.model";
import {TabType} from "../../models/navbar.model";
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import EditIcon from '@mui/icons-material/Edit';
import ProgressBar from "../progress/progress";
import {grey} from "@mui/material/colors";
import {isDarkTheme} from "../../themes/dark.theme";

const TaskPanel = () => {
    const tabType = useSelector((state: NavbarState) => state.navbar.tabType);
    const [tasks, setTasks] = useState<Task[]>([]);
    const getStatusesFromTabType = (type: TabType): TaskStatus | TaskStatus[] | undefined => {
        switch (type) {
            case TabType.downloading:
                return TaskStatus.downloading
            case TabType.completed:
                return TaskStatus.finished
            case TabType.active:
                return [TaskStatus.downloading, TaskStatus.finishing, TaskStatus.hash_checking, TaskStatus.extracting, TaskStatus.seeding]
            case TabType.inactive:
                return [TaskStatus.waiting, TaskStatus.filehosting_waiting, TaskStatus.paused, TaskStatus.error]
            case TabType.stopped:
                return TaskStatus.paused
            default:
                return undefined
        }
    }
    useEffect(() => {
        const subscription = synologyClient.getByStatus(getStatusesFromTabType(tabType))
            .pipe(
                tap((res) => console.log(res)),
                finalize(console.log)
            )
            .subscribe((res) => setTasks(res));

        return () => subscription.unsubscribe();
    }, []);
    return (
        <Container disableGutters={true} sx={{overflow: 'auto', maxHeight: '30rem', padding: '0.25rem'}}>
            {tasks.map((t) =>
                <Accordion>
                    <AccordionSummary
                        aria-controls="task-content"
                        id="task-header"
                        sx={{padding: 0}}
                    >
                        <TaskCard task={t} tabType={tabType}/>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography
                            component="span"
                            variant="body2"
                        >
                            <Grid container sx={{alignItems: 'center'}}>
                                <Grid item xs={4}>
                                    <span>Destination: {t.additional?.detail?.destination}</span>
                                </Grid>
                                <Grid item xs={8} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <Stack direction="row" spacing={2}>
                                        <Button startIcon={<PlayArrowIcon/>}
                                                variant="contained"
                                                color="success"
                                                disabled={![TaskStatus.paused, TaskStatus.finished].includes(t.status)}
                                        >Play</Button>
                                        <Button startIcon={<PauseIcon/>}
                                                variant="contained"
                                                color="warning"
                                                disabled={![TaskStatus.downloading, TaskStatus.seeding, TaskStatus.waiting].includes(t.status)}
                                        >Pause</Button>

                                        <Button startIcon={<EditIcon/>}
                                                variant="outlined"
                                                color="secondary"
                                                disabled={![TaskStatus.downloading, TaskStatus.waiting, TaskStatus.paused].includes(t.status)}
                                        >Edit</Button>
                                        <Button startIcon={<DeleteIcon/>} variant="outlined"
                                                color="error">Delete</Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                            <Box sx={{mt: '1rem', bgcolor: isDarkTheme() ? grey[900] : grey[200]}}>
                                {t.additional?.file?.map((f) => (
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
                            </Box>
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            )}
        </Container>
    );
}

export default TaskPanel;