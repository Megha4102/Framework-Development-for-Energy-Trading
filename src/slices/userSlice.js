// src/slices/userSlice.js
import {configureStore, createSlice} from '@reduxjs/toolkit';
import { db } from '../firebaseConfig.js'; // Import database instance

// const { createSlice } = require('@reduxjs/toolkit');
// console.log('right after createSlice import');
// const { db } = require('../firebaseConfig.js'); // Import database instance


const initialState = {
    walletAddress: null,
    accountType: null,
    address: null,
    email: null,
    firstName: null,
    lastName: null,
    phoneNumber: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        connWallet: (state, action) => {
            state.walletAddress = action.payload.walletAddress;
        },
        setUserData: (state, action) => {
            Object.assign(state, action.payload);
        },
        discWallet: (state) => {
            return initialState; // Reset user state
        },
    },
    extraReducers: (builder) => { // For fetching data asynchronously
        builder.addCase('fetchUserData/fulfilled', (state, action) => {
            Object.assign(state, action.payload);
        });
    },
});

// Export actions
export const { connWallet, setUserData, discWallet } = userSlice.actions;
// Thunk for fetching user data from Firestore (asynchronous)
export const fetchUserData = (walletAddress) => async (dispatch) => {
    try {
        const userRef = db.collection('users').doc(walletAddress);
        const userSnapshot = await userRef.get();

        if (userSnapshot.exists) {
            dispatch({ type: 'fetchUserData/fulfilled', payload: userSnapshot.data() });
        } else {
            // Handle user not found scenario
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle the error appropriately
    }
}

// Export reducer
export default userSlice.reducer;

// Export reducer and actions
// module.exports = {
//     userReducer: userSlice.reducer,
//     connWallet,
//     setUserData,
//     discWallet,
//     fetchUserData,
// };