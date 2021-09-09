import React from 'react';
import {Avatar, LinearProgress, ListItem, ListItemAvatar, ListItemText, Typography} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {TabType, tabTypeToColor} from "../../models/navbar.model";
import {useSelector} from "react-redux";
import {NavbarState} from "../../services/slices/navbar.slice";

const TaskCard = () => {

    const value = useSelector((state: NavbarState) => state.navbar.value);

    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar>
                    <DownloadIcon/>
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={'ubuntu-budgie-20.04.3-desktop-amd64.iso.torrent'}
                secondary={
                    <Typography
                        sx={{display: 'inline'}}
                        component="span"
                        variant="caption"
                        color="text.primary"
                    >
                        <React.Fragment>
                            <div>{value === TabType.all && `${value.toUpperCase()} -`} {Math.round(progress * 100) / 100}MB
                                of 5GB
                                downloaded
                                - {Math.round(progress * 100) / 100}MB/s - {tabTypeToColor(value)}
                            </div>
                            <LinearProgress
                                variant="determinate" value={progress}
                                color={tabTypeToColor(value)}
                            />
                        </React.Fragment>
                    </Typography>
                }
            />
        </ListItem>
    )
}

export default TaskCard;