// src/pages/ConnectWallet.js
import React, {useState, useEffect, useLayoutEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {ethers} from 'ethers';
import {Box, Button, Container} from '@mui/material';

import {useSelector, useDispatch} from 'react-redux';
import {connWallet, discWallet, fetchWalletAddress, setUserData} from '../slices/userSlice.js';
import fetchCustomToken from '../utils/firebaseUtils.js';
import {auth} from '../firebaseConfig.js';
import {signInWithCustomToken} from 'firebase/auth';
import {db} from '../firebaseConfig.js';
import {doc, getDoc} from "firebase/firestore";

// const React = require('react');
// const { useState, useEffect, useLayoutEffect } = require('react');
// const { useNavigate } = require('react-router-dom');
// const ethers = require('ethers');
// const { Button } = require('@mui/material');
//
// const { useSelector, useDispatch } = require('react-redux');
// const { connWallet, discWallet, fetchWalletAddress, setUserData } = require('../slices/userSlice.js');
// const fetchCustomToken = require('../utils/firebaseUtils.js');
// const { auth } = require('../firebaseConfig.js');
// const { signInWithCustomToken } = require('firebase/auth');
// const { db } = require('../firebaseConfig.js');
// const { doc, getDoc } = require('firebase/firestore');


const ConnectWallet = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    // console.log('ConnectWallet component re-rendered. User:', user);
    // console.log('ConnectWallet component re-rendered. User.walletAddress:', user.walletAddress);

    const [isLoading, setIsLoading] = useState(false); // Optional loading state

    const connectWallet = async () => {
        if (window.ethereum) {
            setIsLoading(true); // Show loading indicator
            try {
                // ... Your wallet connection logic using ethers.js ...
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send('eth_requestAccounts', []);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();// Get address after connection
                // console.log("Got this address: ", address);
                await dispatch(connWallet({walletAddress: address}));
                // console.log('is the state saved1?: ', await user.walletAddress);
                const userExists = await checkUserExists(address);
                // console.log('inside connectWallet after checkUserExists');

                if (!userExists) {
                    // console.log('inside if because user not exist');
                    // console.log('is the state saved2?: ', user.walletAddress);
                    navigate('/account'); // Redirect to registration form
                    // console.log('inside if after navigate');
                    setIsLoading(false); // Hide loading indicator
                    // console.log('inside if after setIsLoading');
                    return; // to be tested.
                }

                // console.log('this is the part after if, means now user exists');
                // Fetch user data from Firestore
                const userData = await fetchUserData(address);
                dispatch(setUserData(userData));
                // console.log('after fetchUserData and setUserData dispatch');
                // Get custom token and authenticate
                const customToken = await fetchCustomToken(address);
                await signInWithCustomToken(auth, customToken);
                // console.log('after fetchCustomToken and signInWithCustomToken');
                setIsLoading(false); // Hide loading
                // console.log('is the state saved3?: ', user.walletAddress);
                navigate('/');
            } catch (error) {
                console.error('Error:', error);
                // Handle errors appropriately
                setIsLoading(false); // Hide loading
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this app.');
        }

    };

    const checkUserExists = async (address) => {
        // console.log('inside checkUserExists: ', address);

        // const testDetails =doc(db, 'users', 'test');
        // const testSnap = await getDoc(testDetails)
        // console.log('Printing testSnap: ',testSnap.data());

        // console.log('can we fetch state inside checkUserExists: ',user.walletAddress)

        const userRef = doc(db, 'users', address)
        const userSnap = await getDoc(userRef);
        // console.log('Printing userSnap.exists: ', userSnap.exists());
        // console.log('Printing userSnap:', userSnap.data())
        return userSnap.exists();
    };

    const fetchUserData = async (address) => {
        // console.log('inside fetchUserData:', address);
        const userRef = doc(db, 'users', address)
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists) {
            return userSnapshot.data();
        } else {
            // Handle user not found scenario
            throw new Error('User data not found'); // Or handle differently
        }
    };

    const disconnectWallet = () => {
        // console.log('inside disconnectWallet');
        dispatch(discWallet());
    };

    useEffect(() => {
        if (user.walletAddress) {
            // Optionally redirect to the user's dashboard or another page
        }
    }, [user.walletAddress]);

    // useLayoutEffect(() => {
    //     // This effect runs *after* the Redux state update
    //     console.log('is the state saved1.1?: ', user.walletAddress);
    // }, [user.walletAddress]); // Dependency array ensures effect runs when walletAddress changes

    return (
        <Container maxWidth="sm" sx={{mt: 5}} align="center">
            <Box sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper',
                boxShadow: 5,
                borderRadius: 2,
                p: 2,
                minWidth: 300,
                width: 'fit-content',
            }}>
                <div align="left">
                    <div>
                        <h3 align="center">Steps to follow:</h3>
                        <ol>
                            <li>Click the "Connect Wallet" button to continue.</li>
                            <li>Approve from the MetaMask popup (if received any).</li>
                            <li>Once connected, you may start using this app responsibly.</li>
                        </ol>
                    </div>


                    {isLoading ? (
                        <p>Connecting...</p>
                    ) : user.walletAddress ? (
                        <>
                            <p>Connected as: {user.walletAddress}</p>
                            <Button variant="contained" onClick={disconnectWallet} sx={{alignSelf: "center"}}>Disconnect Wallet</Button>
                        </>
                    ) : (
                        <Container maxWidth="sm" sx={{mt: 5}} align="center">
                        <Button variant="contained" onClick={connectWallet} width="100%">Connect Wallet</Button>
                        </Container>
                    )}
                </div>
            </Box>
        </Container>
    );
};

export default ConnectWallet;
// module.exports = ConnectWallet;