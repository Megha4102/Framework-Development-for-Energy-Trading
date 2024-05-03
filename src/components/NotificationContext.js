// NotificationContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import Notifier from "./Notifier.js";

// const React = require('react');
// const {createContext, useContext, useState, useCallback} = require('react');
// const Notifier = require('./Notifier.js');

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({children}) => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info',
        vertical: 'bottom',
        horizontal: 'center'
    });

    const showNotification = useCallback(({
                                              message,
                                              severity = 'info',
                                              onClose,
                                              vertical = 'bottom',
                                              horizontal = 'center'
                                          }) => {
        setNotification({open: true, message, severity, onClose, vertical, horizontal});
    }, []);

    const handleClose = useCallback((event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification((prev) => ({...prev, open: false}));
        if (notification.onClose) {
            notification.onClose();
        }
    }, [notification]);

    return (
        <NotificationContext.Provider value={{showNotification}}>
            {children}
            <Notifier notification={notification} onClose={handleClose}/>
        </NotificationContext.Provider>
    );
};

// module.exports = {
//     useNotification,
//     NotificationProvider,
//     // NotificationContext // Export the context itself if needed
// };
