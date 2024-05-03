// src/utils/contractUtils.js
import {ethers} from "ethers";
import Notifier from "../components/Notifier.js";

// const ethers = require('ethers');
// const Notifier = require('../components/Notifier.js');

export async function contractCall(contractName, functionPath, functionArgs = [], walletAddress = null) {
    try {
        const response = await fetch('http://localhost:5000/contractCall', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                contractName: contractName,
                functionPath: functionPath,
                functionArgs: functionArgs,
                walletAddress: walletAddress
            })
        });

        if (!response.ok) {
            throw new Error('Contract call failed');
        }

        const data = await response.json();
        // console.log('Contract call successful!');

        // if (data.result.hash) {
        //     return {transactionHash: data.result.hash}; // Transaction details
        // } else {
        //     return data.result; // Returned values (could be a single value or an array)
        // }
        return data.result;
    } catch (error) {
        console.error('Error in contractCall: ', error);
        Notifier.show("Error running: ".concat(contractName, ".", functionPath), "error");
    }
}

export async function sendEthers(from, to, amount) {
    try {
        let tx;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(from);
        try {
            tx = await signer.sendTransaction({
                to: to,
                value: amount
            });
            await tx.wait(); // Wait for transaction confirmation

            // console.log('Ether transfer successful!');
        } catch (error) {
            console.error('Ether transfer failed:', error);
        }
        tx = tx.toString();
        Notifier.show("Ether Transfer Successful!", "success");
        return {transactionHash: tx}; // Transaction details
        // res.send({tx});
    } catch (error) {
        console.error('Error during ether transfer:', error);
        Notifier.show("Ether Transfer failed!", "error");
        // res.status(500).send({ error: error.message });
    }
}

// module.exports = {contractCall, sendEthers};
