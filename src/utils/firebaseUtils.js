// src/utils/firebaseUtils.js
export async function fetchCustomToken(ethereumAddress) {
    const response = await fetch('http://localhost:3001/generateCustomToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ethereumAddress })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch custom token');
    }

    const data = await response.json();
    return data.customToken;
}

export default fetchCustomToken; // Export the function
// module.exports = fetchCustomToken;