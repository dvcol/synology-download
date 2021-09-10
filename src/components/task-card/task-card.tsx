import React from 'react';
import {Avatar, Grid, ListItem, ListItemAvatar, ListItemText, Typography} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LoopIcon from '@mui/icons-material/Loop';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import UploadIcon from '@mui/icons-material/Upload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {TabType} from "../../models/navbar.model";
import {computeEta, computeProgress, formatBytes, Task, TaskStatus, taskStatusToColor} from "../../models/task.model";
import {blue, green, orange, purple, red} from "@mui/material/colors";
import ProgressBar from "../progress-bar/progress-bar";

const TaskCard = ({task, tabType}: { task: Task, tabType: TabType }) => {
    const statusIcon = (status: TaskStatus): React.ReactNode => {
        switch (status) {
            case TaskStatus.waiting:
                return (<AccessTimeIcon/>);
            case TaskStatus.downloading:
                return (<DownloadIcon/>);
            case TaskStatus.paused:
                return (<PauseCircleOutlineIcon/>);
            case TaskStatus.finished:
                return (<DownloadDoneIcon/>);
            case TaskStatus.seeding:
                return (<UploadIcon/>);
            case TaskStatus.error:
                return (<ErrorOutlineIcon/>);
            default:
                return (<LoopIcon/>);
        }
    }

    const avatarBgColor = (status: TaskStatus): string => {
        switch (status) {
            case TaskStatus.downloading:
                return blue[500];
            case TaskStatus.paused:
                return orange[100];
            case TaskStatus.finished:
                return green[500];
            case TaskStatus.seeding:
                return purple[500];
            case TaskStatus.error:
                return red[500];
            default:
                return blue[100]
        }
    }

    return (
        <ListItem>
            <ListItemAvatar sx={{minWidth: 66}}>
                <Avatar sx={{width: 50, height: 50, bgcolor: avatarBgColor(task.status)}}>
                    {statusIcon(task.status)}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={task.title}
                secondary={
                    <Typography
                        sx={{display: 'inline'}}
                        component="span"
                        variant="caption"
                        color="text.secondary"
                    >
                        <Grid container>
                            <Grid item xs={10}>
                                {tabType === TabType.all &&
                                <React.Fragment>
                                    <span>{task.status.toUpperCase()}</span>
                                    <span> – </span>
                                </React.Fragment>
                                }
                                <span>{computeEta(task) || 'no estimate'}</span>
                                <span> – </span>
                                <span>{formatBytes(task.additional?.transfer?.size_downloaded)} of {formatBytes(task.size)} downloaded</span>
                            </Grid>
                            <Grid item xs={2} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                <span>{formatBytes(task.additional?.transfer?.speed_download)}/s</span>
                            </Grid>
                        </Grid>
                        <ProgressBar
                            variant="determinate"
                            value={computeProgress(task.additional?.transfer?.size_downloaded, task.size)}
                            color={taskStatusToColor(task.status)}
                        />
                    </Typography>
                }
            />
        </ListItem>
    )
}

export default TaskCard;