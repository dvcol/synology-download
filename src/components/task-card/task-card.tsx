import React from 'react';
import {
    Avatar,
    Box,
    Grid,
    LinearProgress,
    LinearProgressProps,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LoopIcon from '@mui/icons-material/Loop';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import UploadIcon from '@mui/icons-material/Upload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {TabType} from "../../models/navbar.model";
import {
    computeEta,
    computeTaskProgress,
    formatBytes,
    Task,
    TaskStatus,
    taskStatusToColor
} from "../../models/task.model";
import {blue, green, orange, purple, red} from "@mui/material/colors";

const TaskCard = ({task, tabType}: { task: Task, tabType: TabType }) => {

    const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) =>
        (
            <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Box sx={{width: '100%', mr: 1}}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{minWidth: 35, display: 'flex', justifyContent: 'end'}}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(
                        props.value,
                    )}%`}</Typography>
                </Box>
            </Box>
        );

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
                        <React.Fragment>
                            <Grid container>
                                <Grid item xs={10}>
                                    <span>{tabType === TabType.all && task.status.toUpperCase()}</span>
                                    <span> – </span>
                                    <span>{computeEta(task) || 'no estimate'}</span>
                                    <span> – </span>
                                    <span>{formatBytes(task.additional?.transfer?.size_downloaded)} of {formatBytes(task.size)} downloaded</span>
                                </Grid>
                                <Grid item xs={2} sx={{display: 'flex', justifyContent: 'end'}}>
                                    <span>{formatBytes(task.additional?.transfer?.speed_download)}/s</span>
                                </Grid>
                            </Grid>
                            <LinearProgressWithLabel
                                variant="determinate" value={computeTaskProgress(task)}
                                color={taskStatusToColor(task.status)}
                            />
                        </React.Fragment>
                    </Typography>
                }
            />
        </ListItem>
    )
}

export default TaskCard;