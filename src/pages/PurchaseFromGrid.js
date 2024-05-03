import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {Box, Button, Container, debounce, Divider, Stack, TextField} from "@mui/material";
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


const PurchaseFromGrid = () => {
    const walletAddress = useSelector((state) => state.user.walletAddress);
    const navigate = useNavigate();
    // local states
    const [isLoading, setIsLoading] = useState(false);
    const [totalCost, setTotalCost] = useState('');
    const [units, setUnits] = useState('');
    const [gridEnergyPrice, setGridEnergyPrice] = useState(null);

    // const [eventData, setEventData] = useState(null);
    //
    // useEffect(() => {
    //     const eventSource = new EventSource('http://localhost:5000/events');
    //
    //     eventSource.onmessage = (event) => {
    //         const data = JSON.parse(event.data);
    //         setEventData(data); // Update state with the event data
    //         console.log('New event received:', data);
    //     };
    //
    //     eventSource.onerror = (error) => {
    //         console.error('EventSource failed:', error);
    //         eventSource.close();
    //     };
    //
    //     return () => {
    //         eventSource.close(); // Clean up the connection when the component unmounts
    //     };
    // }, []);


    const handleConnectClick = () => {
        navigate('/connect');
    };

    useEffect(() => {
        const initialize = async () => {
            if (!walletAddress) return;
            setIsLoading(true);
            try {
                const res = await contractCall('gridInteraction', 'getGridEnergyPrice', []);
                // console.log('res: ', res);
                const price = BigNumber.from(res);
                setGridEnergyPrice(price);
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

    const handleTotalCostChange = (event) => {
        setTotalCost(event.target.value.replace(/[^0-9.]/g, ''));
        calculateUnits(event.target.value);
    };

    const handleUnitsChange = (event) => {
        setUnits(event.target.value.replace(/[^0-9.]/g, ''));
        calculateTotalCost(event.target.value);
    };

    const calculateUnits = (totalCost) => {
        if (totalCost && gridEnergyPrice) {
            const totalCostWei = BigNumber.from(ethers.parseEther(totalCost)); // Convert Ether to wei
            const unitsAmount = totalCostWei.div(gridEnergyPrice); // wei divided by wei gives exact number
            // // const eltkAmount = ethers.formatUnits(eltkWei.toString(), 18); // Convert wei to ELTK
            // const bigEtherAmount = BigNumber.from(ethers.parseEther(etherAmount));
            // const tokenPriceInEther = ethers.formatUnits(tokenPriceWei.toString(), 18);
            // const eltkAmount = bigEtherAmount.div(tokenPriceInEther);
            setUnits(unitsAmount.toString());
        } else {
            setUnits('');
        }
    };

    const calculateTotalCost = (units) => {
        if (units && gridEnergyPrice) {
            const unitsWei = BigNumber.from(ethers.parseUnits(units, 18)); // Convert ELTK to wei
            const totalCostWei = unitsWei.mul(gridEnergyPrice); // wei multiplied by wei gives exact number
            const totalCostAmount = ethers.formatUnits(totalCostWei.toString(), 36); // Convert wei to Ether (36 decimals instead of 18 because we multiply two wei of 18 decimals)
            // const myNum = BigNumber.from(eltkAmount);
            // const eltkAmountFull = BigNumber.from(eltkAmount);
            // const tmp =ethers.formatUnits(tokenPriceWei.toString(), 18);
            // const tokenPriceFull = BigNumber.from(tmp);
            // const etherAmount = eltkAmountFull.mul(tokenPriceFull);
            setTotalCost(totalCostAmount.toString());
        } else {
            setTotalCost('');
        }
    };

    const handlePurchaseClick = async () => {
        if (!walletAddress) return; // Stop if wallet is not connected
        try {
            const tc = BigNumber.from(ethers.parseEther(totalCost)).toString();
            const tu = BigNumber.from(units).toString();
            // const adminAddress = await contractCall('admin', 'getCommunityAdmin', []);
            // const etherSend = await sendEthers(walletAddress, adminAddress, amount.toString());
            const gridInteractionAddress = contractData.gridInteraction.address;
            const energyCertificateAddress = contractData.energyCertificate.address;
            const userApprove = await contractCall('electricityToken', 'approve' , [gridInteractionAddress, tc.toString()], walletAddress)
            const unlimitedApproval = BigNumber.from(ethers.MaxUint256.toString()); // Very large number
            const appro2 = await contractCall('electricityToken', 'approve', [gridInteractionAddress, unlimitedApproval.toString()]);
            const appro3 = await contractCall('electricityToken', 'approve', [energyCertificateAddress, unlimitedApproval.toString()]);
            const certID = await contractCall('gridInteraction', 'buyEnergyFromGrid', [walletAddress, tu.toString()]);
            console.log("Purchased certificate with ID: ", certID.toString());
            Notifier.show("Energy Purchased from Grid", "success");
            // await displayDetails();
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
                    <h1 align="center">Buy Energy From Grid</h1>
                    <Divider flexItem sx={{borderBottomWidth: 3}}/>
                    {gridEnergyPrice &&
                        <p>Current Rate: 1 Unit = {ethers.formatUnits(gridEnergyPrice.toString(), 18)} ELTK</p>}
                    <Stack direction="row" spacing={{xs: 1, sm: 2, width: 'inherit'}} useFlexGap flexWrap="wrap">
                    <TextField
                        label="Total Cost"
                        value={totalCost}
                        onChange={handleTotalCostChange}
                        margin="normal"
                        type="number"
                        id="totalCost"
                    />

                    <TextField
                        label="Units"
                        value={units}
                        onChange={handleUnitsChange}
                        margin="normal"
                        type="number"
                        id="units"
                    />
                    </Stack>

                    <Button variant="contained"
                            sx={{width: "100%"}}
                            onClick={handlePurchaseClick}
                            disabled={isLoading || !totalCost || !units}>
                        {isLoading ? 'Loading...' : 'Purchase Energy'}
                    </Button>
                    {/*<Notifier/>*/}

                    {/*<Button variant="contained" onClick={testTransfer} disabled={isLoading}>*/}
                    {/*    {isLoading ? 'Loading...' : 'Test Transfer from Admin'}*/}
                    {/*</Button>*/}
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

export default PurchaseFromGrid;
// module.exports = PurchaseFromGrid;