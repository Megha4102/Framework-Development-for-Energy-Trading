// src/slices/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedTheme: 'classicBlue', // Or your preferred initial theme
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.selectedTheme = action.payload;
        },
    },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;