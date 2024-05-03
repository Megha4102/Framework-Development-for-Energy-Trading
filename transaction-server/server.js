const express = require('express');
const {ethers} = require('ethers');
const contractData = require('../src/contractData.json');
const cors = require('cors');
const {BigNumber} = require("@ethersproject/bignumber");
const {firestore} = require('firebase-admin'); // Install Firebase Admin SDK
require('dotenv').config();

const app = express();
const port = 5000;

// Secure private key retrieval (Adapt this for your use case)
const communityAdminPrivateKey = process.env.COMMUNITY_ADMIN_PRIVATE_KEY;
const provider = new ethers.JsonRpcProvider("HTTP://192.168.56.1:7545");
const wallet = new ethers.Wallet(communityAdminPrivateKey, provider);

// Routes for transactions
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies

function stringifyBigInts(data) {
    if (typeof data === 'bigint') {
        return data.toString();
    } else if (Array.isArray(data)) {
        return data.map(stringifyBigInts);
    } else if (typeof data === 'object' && data !== null) {
        const newData = {};
        for (const key in data) {
            newData[key] = stringifyBigInts(data[key]);
        }
        return newData;
    } else {
        return data;
    }
}

app.post('/contractCall', async (req, res) => {
    const {contractName, functionPath, functionArgs, walletAddress} = req.body;

    try {
        // console.log("Contract Name: ", contractName);
        // console.log("Function Path: ", functionPath);
        // console.log("Received functionArgs:", functionArgs); // Add logging
        // Access the contract object
        const contract = contractData[contractName];
        if (!contract) {
            throw new Error(`Invalid contract name: ${contractName}`);
        }

        const transactionWallet = walletAddress ? await provider.getSigner(walletAddress) : wallet;

        // Access the nested contract and function
        let targetFunction = new ethers.Contract(contract.address, contract.ABI, transactionWallet); // Create instance
        // const contractCopy = targetFunction;
        const pathParts = functionPath.split('.');

        for (const part of pathParts) {
            targetFunction = targetFunction[part];

            if (!targetFunction) {
                throw new Error(`Invalid function path: ${functionPath}`);
            }
        }

        // Check if we have a function
        if (typeof targetFunction !== 'function') {
            throw new Error(`'${functionPath}' is not a function`);
        }

        let result;
        // Estimate gas and execute
        let tmp = await targetFunction.estimateGas(...functionArgs);
        const estimatedGas = BigNumber.from(tmp.toString());
        // console.log('estimatedGas: ', estimatedGas);
        // console.log('Type of estimatedGas: ', typeof estimatedGas);
        result = await targetFunction(...functionArgs, {
            gasLimit: estimatedGas.mul(120).div(100).toString()
        });

        // Wait for the transaction to be mined to capture events
        if (result.hash) {
            const receipt = await result.wait(); // Wait for confirmation
        }

        const stringifiedResult = stringifyBigInts(result);
        console.log(contractName + "." + functionPath + " executed successfully.");
        console.log("--------------------------------------------------");
        res.send({result: stringifiedResult});

    } catch (error) {
        // const parsedError = JSON.parse(error);
        // const revertReason = parsedError.info.error.message;
        // const regex = /VM Exception while processing transaction: revert\s*(.*)/;
        // const match = revertReason.match(regex);
        // if (match) {
        //     const revertReason = match[1]; // Access the captured group
        //     console.log("Extracted Revert Reason:", revertReason);
        // } else {
        // }
        console.error('Error during transaction:', error);

        res.status(500).send({error: error.message});
    }
});

app.post('/sendEthers', async (req, res) => {
    const {from, to, amount} = req.body;

    try {
        let tx;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(from);
        try {
            tx = await signer.sendTransaction({
                to: to, value: amount
            });
            await tx.wait(); // Wait for transaction confirmation

            console.log('Ether transfer successful!');
        } catch (error) {
            console.error('Ether transfer failed:', error);
        }

        tx = tx.toString();

        res.send({tx});
    } catch (error) {
        console.error('Error during ether transfer:', error);
        res.status(500).send({error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Transaction server listening on port ${port}`);
});
