import React, {useEffect, useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Container} from "@mui/material";
import TaskCard from "../task-card/task-card";
import {synologyClient} from "../../services/http/synology-client";
import {useSelector} from "react-redux";
import {NavbarState} from "../../services/slices/navbar.slice";
import {Task} from "../../models/task.model";
import TaskDetail from "../task-detail/task-detail";

const TaskPanel = () => {
    const tab = useSelector((state: NavbarState) => state.navbar.tab);
    const [tasks, setTasks] = useState<Task[]>([]);
    useEffect(() => {

        const subscription =
            synologyClient
                .getByStatus(tab.status)
                .subscribe((res) => setTasks(res));

        return () => subscription.unsubscribe();
    }, [tab]);
    return (
        <Container disableGutters sx={{overflow: 'auto', maxHeight: '30rem', padding: '0.25rem'}}>
            {tasks.map((t) =>
                <Accordion>
                    <AccordionSummary
                        aria-controls="task-content"
                        id="task-header"
                        sx={{padding: 0}}
                    >
                        <TaskCard task={t} tabName={tab.name}/>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TaskDetail task={t}/>
                    </AccordionDetails>
                </Accordion>
            )}
        </Container>
    );
}

export default TaskPanel;
