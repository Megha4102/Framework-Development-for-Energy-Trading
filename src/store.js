// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import {thunk} from 'redux-thunk';
import userReducer from './slices/userSlice';
import themeReducer from './slices/themeSlice';
import {loadStateFromSessionStorage} from "./utils/sessionStorageUtils";

const preloadedState = loadStateFromSessionStorage();

export const store = configureStore({
    reducer: {
        user: userReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk), // Add Thunk
    preloadedState, // Use preloadedState as the initial state
});

// module.exports = store;
