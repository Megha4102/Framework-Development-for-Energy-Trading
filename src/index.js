import React, {useContext} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import {store} from './store.js';
import {saveStateToSessionStorage} from "./utils/sessionStorageUtils.js";
import {ThemeProvider} from "@mui/material";
import * as themes from "./themes";
import {useSelector} from "react-redux";

// let someVal;

store.subscribe(() => {
    const state = store.getState();
    // someVal=state.theme.selectedTheme;
    saveStateToSessionStorage({...state, theme: state.theme.selectedTheme});
});

// const ThemeWrapper = () => {
//     const selectedTheme = useSelector((state) => state.theme.selectedTheme);
//
//     return (
//         <React.StrictMode>
//             <ThemeProvider theme={selectedTheme}>
//                 <App />
//             </ThemeProvider>
//         </React.StrictMode>
//     );
// };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        {/*<ThemeProvider theme={someVal}>*/}
            <App/>
        {/*</ThemeProvider>*/}
        {/*<ThemeWrapper />*/}
    </React.StrictMode>

);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
