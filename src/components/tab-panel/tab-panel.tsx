import React from 'react';
import {Avatar, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {useSelector} from "react-redux";
import {NavbarState} from "../../services/slices/navbar.slice";
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

const TabPanel = () => {
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
        <List>
            <ListItem
                secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                        <DeleteIcon/>
                    </IconButton>
                }
            >
                <ListItemAvatar>
                    <Avatar>
                        <DownloadIcon/>
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={value}
                    secondary={<LinearProgress variant="determinate" value={progress}/>}
                />
            </ListItem>
        </List>
    );
}

export default TabPanel;