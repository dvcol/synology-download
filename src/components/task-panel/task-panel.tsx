import React, {useEffect, useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Container} from "@mui/material";
import TaskCard from "../task-card/task-card";
import {synologyClient} from "../../services/http/synology-client";
import {finalize, tap} from "rxjs";
import {useSelector} from "react-redux";
import {NavbarState} from "../../services/slices/navbar.slice";
import {Task, TaskStatus} from "../../models/task.model";
import {TabType} from "../../models/navbar.model";
import TaskDetail from "../task-detail/task-detail";

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
    }, [tabType]);
    return (
        <Container disableGutters sx={{overflow: 'auto', maxHeight: '30rem', padding: '0.25rem'}}>
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
                        <TaskDetail task={t}/>
                    </AccordionDetails>
                </Accordion>
            )}
        </Container>
    );
}

export default TaskPanel;
