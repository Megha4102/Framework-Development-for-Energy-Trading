// src/utils/sessionStorageUtils.js
export const saveStateToSessionStorage = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        sessionStorage.setItem('state', serializedState);
    } catch (error) {
        console.error('Could not save state to sessionStorage:', error);
    }
};

export const loadStateFromSessionStorage = () => {
    try {
        const serializedState = sessionStorage.getItem('state');
        if (serializedState === null) {
            return undefined; // No state in sessionStorage
        }
        const parsedState = JSON.parse(serializedState);
        return {
            ...parsedState,
            theme: { // Add theme to the returned state
                selectedTheme: parsedState.theme || 'classicBlueTheme'  // Default theme
            }
        };
    } catch (error) {
        console.error('Could not load state from sessionStorage:', error);
        return undefined;
    }
};

// module.exports = {saveStateToSessionStorage, loadStateFromSessionStorage};