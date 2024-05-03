import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {
    TextField,
    Button,
    Typography,
    Grid,
    Box,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';
import {db} from '../firebaseConfig.js';
import {setDoc, doc, deleteDoc, getDoc, updateDoc} from 'firebase/firestore';
import {connWallet, discWallet, setUserData} from "../slices/userSlice.js";
import Notifier from "../components/Notifier";
import {contractCall} from "../utils/contractUtils";

// const React = require('react');
// const { useState, useEffect } = require('react');
// const { useSelector, useDispatch } = require('react-redux');
// const { useNavigate } = require('react-router-dom');
// const {
//     TextField,
//     Button,
//     Typography,
//     Grid,
//     Box,
//     Select,
//     MenuItem,
//     InputLabel,
//     FormControl,
//     Snackbar
// } = require('@mui/material');
// const MuiAlert = require('@mui/material/Alert');
// const { db } = require('../firebaseConfig.js');
// const { setDoc, doc, deleteDoc, getDoc, updateDoc } = require('firebase/firestore');
// const { connWallet, discWallet, setUserData } = require('../slices/userSlice.js');
// const { useNotification } = require('../components/NotificationContext');
// const Notifier = require('../components/Notifier');

const Account = () => {
    const [formData, setFormData] = useState({
        accountType: '',
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        phoneNumber: '',
    });

    const [isEditing, setIsEditing] = useState(true); // For edit/view mode toggle
    const [isRegistered, setIsRegistered] = useState(false);
    // const [openSnackbar, setOpenSnackbar] = useState(false);
    // const [snackbarMessage, setSnackbarMessage] = useState('');


    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const hasDataInState = Object.values(formData).some((value) => !!value); // Check for data
    const [buttonText, setButtonText] = useState("Register");
    // console.log("hasDataInState: ", hasDataInState)
    // console.log("buttonText: ", buttonText);

    // Load initial data from Redux state (if available)
    useEffect(() => {
        if (user.accountType) { // Check if user data exists
            setFormData({...user}); // Populate form with existing data
            setIsEditing(false); // Start in view mode
            setButtonText("Edit");
        }
    }, [user]);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    // const {showNotification} = useNotification();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // TODO: we aren't taking any subscription fee yet.
            const walletAddress = user.walletAddress;
            const accountType = user.accountType;
            const reg = await contractCall('community', 'registerUser', [walletAddress, accountType.toString()]);

            // Prepare Firestore document data
            const documentData = {
                ...formData,
                walletAddress: user.walletAddress // Include walletAddress from state
            };
            // Create document with walletAddress as the ID
            const userRef = doc(db, 'users', user.walletAddress);
            await setDoc(userRef, documentData);

            // Show the snackbar
            // setSnackbarMessage("In the next screen, click Connect Wallet to continue");
            // setOpenSnackbar(true);
            await dispatch(connWallet({walletAddress: ''}));

            Notifier.show("In the next screen, click Connect Wallet to continue", "success", () => {
                navigate('/connect')
            });

        } catch (error) {
            console.error('Error submitting data:', error);
            // Handle the error appropriately
        } finally {
            setIsEditing(false); // Switch to view mode
            setIsRegistered(true);
        }
    };


    const handleDeleteAccount = async () => {
        try {

            const del = await contractCall('community', 'deregisterUser', [user.walletAddress]);
            // Delete Firestore document
            const userRef = doc(db, 'users', user.walletAddress);
            await deleteDoc(userRef);

            // Clear Redux state (Assuming you're using a 'user' slice)
            dispatch(discWallet()); // Or your specific Redux action
            setIsRegistered(false);

            // Redirect to home page
            navigate('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            // Handle the error appropriately
        }
    };


    const handleUpdateAccount = async () => {

        try {
            // Retrieve necessary data
            const userRef = doc(db, 'users', user.walletAddress);
            const currentUserData = await getDoc(userRef); // Fetch existing data

            console.log(currentUserData.data());

            // Prepare the updated document data
            const updatedDocumentData = {
                ...formData,
                walletAddress: user.walletAddress // Include walletAddress from state
            };

            //Conditionally call smart contract function if userType changed
            if (currentUserData.data().userType !== updatedDocumentData.userType) {
                const upd = await contractCall('community', 'modifyUser', [user.walletAddress, user.accountType]);
            }

            // Update the Firestore document
            await updateDoc(userRef, updatedDocumentData);
            await dispatch(setUserData(updatedDocumentData));

            // console.log('User account updated successfully');
            // Additional actions if needed (e.g., UI updates)

        } catch (error) {
            console.error('Error updating account:', error);
            // Handle the error appropriately
        } finally {
            setIsEditing(false); // Switch to view mode
        }
    };


    const handleButtonClick = async () => {
        // buttonText is "Edit" or "Submit"
        setButtonText(buttonText === "Edit" ? "Submit" : "Edit");
        setIsEditing(!isEditing);
        if (buttonText === "Submit") { // Handle update on Submit
            try {
                await handleUpdateAccount(); // Wait for the Promise to resolve
                // Additional actions after account update, if needed
            } catch (error) {
                console.error('Error during account update:', error);
                // Handle the error appropriately
            }
        }
    };

    return (
        <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Box sx={{
                marginTop: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <Typography component="h1" variant="h5">
                    Account Details
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="account-type-label">Account Type</InputLabel>
                                <Select
                                    name="accountType"
                                    labelId="account-type-label"
                                    id="account-type"
                                    value={formData.accountType}
                                    label="Account Type"
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                >
                                    <MenuItem value="Buyer">Buyer</MenuItem>
                                    <MenuItem value="Seller">Seller</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="firstName"
                                label="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="lastName"
                                label="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                label="Email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="address"
                                label="Address"
                                value={formData.address}
                                onChange={handleChange}
                                disabled={!isEditing}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="phoneNumber"
                                label="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                disabled={!isEditing}
                                fullWidth
                                required
                            />
                        </Grid>
                        {/* ... Add similar TextField components for other fields ... */}
                    </Grid>
                    <Button
                        type={buttonText === "Register" ? "submit" : "button"}
                        variant="contained"
                        sx={{mt: 3, mb: 2}}
                        disabled={!hasDataInState} // Disable if no data
                        onClick={buttonText === "Register" ? handleSubmit : handleButtonClick}
                    >
                        {buttonText}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{mt: 3, mb: 2}}
                        onClick={handleDeleteAccount}
                        disabled={!isRegistered && isEditing} // Disable if no data
                    >
                        Delete Account
                    </Button>

                </Box>
            </Box>
        </Box>
    );
};

export default Account;
// module.exports = Account;
