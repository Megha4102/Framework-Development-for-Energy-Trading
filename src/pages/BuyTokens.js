import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {Box, Button, Container, debounce, Divider, Paper, Stack, styled, TextField} from "@mui/material";
import {ethers} from "ethers";
import contractData from '../contractData.json';
import {BigNumber} from "@ethersproject/bignumber";
import {contractCall, sendEthers} from "../utils/contractUtils.js";
import Notifier from "../components/Notifier.js";

// const React = require('react');
// const { useState, useEffect } = require('react');
// const { useNavigate } = require('react-router-dom');
// const { useSelector } = require('react-redux');
// const { Button, debounce, TextField } = require("@mui/material");
// const ethers = require('ethers');
// const contractData = require('../contractData.json');
// const { BigNumber } = require('@ethersproject/bignumber');
// const { contractCall, sendEthers } = require('../utils/contractUtils.js');
// const Notifier = require('../components/Notifier.js');


const BuyTokens = () => {
    const walletAddress = useSelector((state) => state.user.walletAddress);
    const navigate = useNavigate();
    // local states
    const [isLoading, setIsLoading] = useState(false);
    const [etherAmount, setEtherAmount] = useState('');
    const [eltkAmount, setELTKAmount] = useState('');
    const [tokenPriceWei, setTokenPriceWei] = useState(null);


    const handleConnectClick = () => {
        navigate('/connect');
    };

    useEffect(() => {
        const initialize = async () => {
            if (!walletAddress) return;
            setIsLoading(true);
            try {
                const res = await contractCall('community', 'getTokenPrice', []);
                // console.log('res: ', res);
                const tokenPriceWei = BigNumber.from(res);
                setTokenPriceWei(tokenPriceWei);
            } catch (error) {
                console.error("Error initializing:", error);
            } finally {
                setIsLoading(false);
            }
        };
        (async () => {
            await initialize(); // Handle the Promise here
        })();
    }, [walletAddress]);

    const handleEtherChange = (event) => {
        setEtherAmount(event.target.value.replace(/[^0-9.]/g, ''));
        calculateELTK(event.target.value);
    };

    const handleELTKChange = (event) => {
        setELTKAmount(event.target.value.replace(/[^0-9.]/g, ''));
        calculateEther(event.target.value);
    };

    const calculateELTK = (etherAmount) => {
        if (etherAmount && tokenPriceWei) {
            const etherWei = BigNumber.from(ethers.parseEther(etherAmount)); // Convert Ether to wei
            const eltkAmount = etherWei.div(tokenPriceWei); // wei divided by wei gives exact number
            // // const eltkAmount = ethers.formatUnits(eltkWei.toString(), 18); // Convert wei to ELTK
            // const bigEtherAmount = BigNumber.from(ethers.parseEther(etherAmount));
            // const tokenPriceInEther = ethers.formatUnits(tokenPriceWei.toString(), 18);
            // const eltkAmount = bigEtherAmount.div(tokenPriceInEther);
            setELTKAmount(eltkAmount.toString());
        } else {
            setELTKAmount('');
        }
    };

    const calculateEther = (eltkAmount) => {
        if (eltkAmount && tokenPriceWei) {
            const eltkWei = BigNumber.from(ethers.parseUnits(eltkAmount, 18)); // Convert ELTK to wei
            const etherWei = eltkWei.mul(tokenPriceWei); // wei multiplied by wei gives exact number
            const etherAmount = ethers.formatUnits(etherWei.toString(), 36); // Convert wei to Ether (36 decimals instead of 18 because we multiply two wei of 18 decimals)
            // const myNum = BigNumber.from(eltkAmount);
            // const eltkAmountFull = BigNumber.from(eltkAmount);
            // const tmp =ethers.formatUnits(tokenPriceWei.toString(), 18);
            // const tokenPriceFull = BigNumber.from(tmp);
            // const etherAmount = eltkAmountFull.mul(tokenPriceFull);
            setEtherAmount(etherAmount.toString());
        } else {
            setEtherAmount('');
        }
    };

    const handleBuyClick = async () => {
        if (!walletAddress) return; // Stop if wallet is not connected
        try {
            const amount = BigNumber.from(ethers.parseEther(etherAmount)).toString();
            const adminAddress = await contractCall('admin', 'getCommunityAdmin', []);
            const etherSend = await sendEthers(walletAddress, adminAddress, amount.toString());
            const communityAddress = contractData.community.address;
            const unlimitedApproval = BigNumber.from(ethers.MaxUint256.toString()); // Very large number
            // const appro1= await contractCall('electricityToken', 'approve', [communityAddress, amount], walletAddress);
            const appro2 = await contractCall('electricityToken', 'approve', [communityAddress, unlimitedApproval.toString()]);
            const data = await contractCall('community', 'purchaseTokens', [walletAddress, amount.toString()]);
            Notifier.show("ELTK Transfer Successful", "success");
            // console.log('Transaction successful:', data);

        } catch (error) {
            console.error('Transaction error:', error);
        }
    };

    return (
        <Container maxWidth="sm" sx={{mt:5}} align="center">
            <Box sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper',
                boxShadow: 5,
                borderRadius: 2,
                p: 2,
                minWidth: 300,
                width: 'fit-content',
            }}>
                <div>
                    {walletAddress ? (
                        <div>
                            <h1 align="center">Token Exchange</h1>
                            <Divider flexItem sx={{borderBottomWidth: 3}}/>
                            {tokenPriceWei &&
                                <p>Current Rate: 1 ELTK = {ethers.formatUnits(tokenPriceWei.toString(), 18)} ETH</p>}
                            {/*{tokenPriceWei && <p>Current Rate: 1 ETH = {tokenPriceWei.toString()} ELTK</p>}*/}
                            <Stack direction="row" spacing={{xs: 1, sm: 2}} useFlexGap flexWrap="wrap">
                                    <TextField
                                        label="ETH"
                                        value={etherAmount}
                                        onChange={handleEtherChange}
                                        margin="normal"
                                        type="number"
                                        id="ethInput"
                                    />

                                    <TextField
                                        label="ELTK"
                                        value={eltkAmount}
                                        onChange={handleELTKChange}
                                        margin="normal"
                                        type="number"
                                        id="eltkInput"
                                    />
                            </Stack>
                            <Button variant="contained"
                                    sx={{width: "100%"}}
                                    onClick={handleBuyClick}
                                    disabled={isLoading || !etherAmount || !eltkAmount}>
                                {isLoading ? 'Loading...' : 'Buy ELTK'}
                            </Button>

                        </div>
                    ) : (
                        <div>
                            <h1>Please Connect Your Wallet to Continue</h1>
                            <p>You can connect your wallet on the Connect Wallet page.</p>
                            <Button variant="contained" onClick={handleConnectClick}>
                                Go to Connect Wallet
                            </Button>
                        </div>
                    )}
                </div>
            </Box>
        </Container>
    );
};

export default BuyTokens;
// module.exports = BuyTokens;