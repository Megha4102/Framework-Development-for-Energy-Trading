// Notifier.js
import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Button from '@mui/material/Button';

// const React = require('react');
// const {useState } = require('react');
// const {Snackbar, MuiAlert, Button} = require('@mui/material');


const Notifier = () => {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info', // default severity
        vertical: 'bottom', // default vertical position
        horizontal: 'center', // default horizontal position
        onClose: null, // onClose callback function
    });

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setNotification({ ...notification, open: false });
        // Call the onClose callback if it exists
        if (notification.onClose) {
            notification.onClose();
        }
    };

    // Function to show notification
    const showNotification = (message, severity = 'info', onClose, vertical = 'bottom', horizontal = 'center') => {
        setNotification({ open: true, message, severity, onClose,  vertical, horizontal });
        // If onClose is not provided, use timeout
        if (!onClose) {
            setTimeout(() => {
                setNotification({ ...notification, open: false });
            }, 5000); // Auto-close after 5 seconds
        }
    };

    // Expose the showNotification function to the rest of the app
    Notifier.show = showNotification;

    // Action button for the snackbar
    // const action = (
    //     <Button color="secondary" size="small" onClick={handleClose}>
    //         Okay
    //     </Button>
    // );

    return (
        <Snackbar
            open={notification.open}
            autoHideDuration={notification.onClose ? null : 5000}
            onClose={handleClose}
            anchorOrigin={{ vertical: notification.vertical, horizontal: notification.horizontal }}
            // action={action} // Include the action button in the Snackbar
        >
            <MuiAlert elevation={6} variant="filled"  severity={notification.severity}>
                {notification.message}
                <Button color="secondary" size="small" onClick={handleClose} sx={{
                    bgcolor: 'black',
                    color: 'white',
                    marginLeft: '8px'
                }} >
                    Continue
                </Button>
            </MuiAlert>
        </Snackbar>
    );
};

export default Notifier
// module.exports = Notifier;
