import {initializeApp} from 'firebase/app';
import {getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Add this line
// const {initializeApp} = require('firebase/app');
// const {getFirestore} = require('firebase/firestore');
// const {getAuth} = require('firebase/auth');


// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAmkS9UCtqCjJgNpJR5ocK8zWigDFdi4-U",
    authDomain: "energy-trading-app.firebaseapp.com",
    projectId: "energy-trading-app",
    storageBucket: "energy-trading-app.appspot.com",
    messagingSenderId: "487893160480",
    appId: "1:487893160480:web:61a0d7b2133ff195926245"
};


const app = initializeApp(firebaseConfig);

// Initialize Firestore and export for use in other components
export const db = getFirestore(app);
export const auth = getAuth(); // Export auth

// module.exports = {db, auth};

