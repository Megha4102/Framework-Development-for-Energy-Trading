import { createTheme } from '@mui/material/styles';
const warmEarthTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#FF9100', // Orange
        },
        secondary: {
            main: '#795548',  // Brown
        },
        error: {
            main: '#F44336',
        },
        success: {
            main: '#4CAF50',
        },
        background: {
            default: '#f3e5f5', // Light background
            paper: '#fff', // Slightly whiter for cards, etc.
        },
    },
});

const classicBlueTheme = createTheme({
    palette: {
        mode: 'light' || 'dark', // Set for both modes
        primary: {
            main: '#2196F3',
        },
        secondary: {
            main: '#F44336',
        },
        error: {
            main: '#F44336',
        },
        success: {
            main: '#4CAF50',
        },
        background: {
            default: '#f3e5f5', // Light background
            paper: '#fff', // Slightly whiter for cards, etc.
        },
    },
});

const modernTealTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#009688', // Teal
        },
        secondary: {
            main: '#FF5722', // Deep Orange
        },
        error: {
            main: '#F44336',
        },
        success: {
            main: '#4CAF50',
        },
        background: {
            default: '#f3e5f5', // Light background
            paper: '#fff', // Slightly whiter for cards, etc.
        },
    },
});

const coolDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6200EA', // Purple
        },
        secondary: {
            main: '#03DAC6', // Cyan
        },
        error: {
            main: '#F44336',
        },
        success: {
            main: '#4CAF50',
        },
        background: {
            default: '#f3e5f5', // Light background
            paper: '#fff', // Slightly whiter for cards, etc.
        },
    },
});

const blackAndAmberTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#FFC107', // Amber
        },
        // Don't define a secondary color as we want a dark background
        background: {
            default: '#121212', // Very dark background
            paper: '#212121',  // Slightly lighter for cards, etc.
        },
        text: {
            primary: '#fff',   // White text for good contrast
            secondary: '#ccc', // Lighter grey for secondary text
        },
        // Inherit error and success colors from the Material-UI defaults
        // error: { ... },  // Uncomment if you prefer custom error color
        // success: { ... }, // Uncomment if you prefer custom success color
    },
});

const midnightGreenTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00695C', // Dark Green
        },
        secondary: {
            main: '#FF9800', // Orange
        },
        error: {
            main: '#F44336',
        },
        success: {
            main: '#4CAF50',
        },
        background: {
            default: '#f3e5f5', // Light background
            paper: '#fff', // Slightly whiter for cards, etc.
        },
    },
});

export {
    warmEarthTheme,
    classicBlueTheme,
    modernTealTheme,
    coolDarkTheme,
    blackAndAmberTheme,
    midnightGreenTheme
}