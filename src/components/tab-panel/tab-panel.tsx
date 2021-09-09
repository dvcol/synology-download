import React, {useEffect, useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import TaskCard from "../task-card/task-card";
import {Drink, synologyClient} from "../../services/http/synology-client";
import {finalize, tap} from "rxjs";

const TabPanel = () => {
    const [drinks, setDrinks] = useState<Drink[]>([]);
    useEffect(() => {
        const subscription = synologyClient.search("gin")
            .pipe(
                tap((res) => console.log(res.drinks)),
                finalize(console.log)
            )
            .subscribe((res) => setDrinks(res.drinks));

        return () => subscription.unsubscribe();
    }, []);
    return (
        <React.Fragment>
            {drinks.map(() =>
                <Accordion>
                    <AccordionSummary
                        aria-controls="task-content"
                        id="task-header"
                        sx={{padding: 0}}
                    >
                        <TaskCard/>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                            malesuada lacus ex, sit amet blandit leo lobortis eget.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            )}
        </React.Fragment>
    );
}

export default TabPanel;