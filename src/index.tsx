import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Navbar from './components/navbar/navbar';
import reportWebVitals from './reportWebVitals';
import TaskPanel from "./components/task-panel/task-panel";
import {Provider} from "react-redux";
import store from "./services/store";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {darkTheme} from "./themes/dark.theme";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={darkTheme()}>
                <CssBaseline />
                <Navbar/>
                <TaskPanel/>
            </ThemeProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
