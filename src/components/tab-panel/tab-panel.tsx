import React from 'react';
import TaskPanel from "../task-panel/task-panel";
import {Route, Switch} from "react-router-dom";
import Settings from "../settings/settings";
import TaskAdd from "../task-add/task-add";

export const TabPanel = () => {
    return (
        <React.Fragment>
            <Switch>
                <Route exact path="/settings" component={Settings}/>
                <Route exact path="/add" component={TaskAdd}/>
                <Route path="/" component={TaskPanel}/>
            </Switch>
        </React.Fragment>
    )
}

export default TabPanel;
