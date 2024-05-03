const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccount = require('./energy-trading-app-firebase-adminsdk-adtbq-d47abf5ed7.json'); // Replace with the path to your Firebase service account JSON file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Endpoint to generate a custom token
app.post('/generateCustomToken', async (req, res) => {
    const { ethereumAddress } = req.body;
    // console.log(ethereumAddress)
    // if (!ethereumAddress) {
    //     return res.status(400).send('Ethereum address is required');
    // }

    // Check if the Ethereum address is a non-empty string
    if (typeof ethereumAddress !== 'string' || ethereumAddress.trim() === '') {
        return res.status(400).send('The `uid` argument must be a non-empty string.');
    }

    try {
        const customToken = await admin.auth().createCustomToken(ethereumAddress);
        res.json({ customToken });
    } catch (error) {
        console.error('Error creating custom token:', error);
        res.status(500).send('Error creating custom token');
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
