import {ethers} from "ethers";
import {Box, Button, Container, Divider, Paper, Stack, styled, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {contractCall} from "../utils/contractUtils";
import {BigNumber} from "@ethersproject/bignumber";
import Notifier from "../components/Notifier";

// import {DateTimePicker} from "@mui/x-date-pickers";
// import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
// import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";


const AdminControls = () => {
    const walletAddress = useSelector((state) => state.user.walletAddress);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEndTime, setSelectedEndTime] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const adminAddress = '0x0E5327D589DE35a425E71Df61cC39a24CB88742e';

    // console.log('adminAddress from AdminControls.js: ', adminAddress);
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {

            const auctionState = await contractCall('auction', 'getAuctionState', []);
            if (auctionState)
            {
                setIsSubmitted(true);
                Notifier.show('Auction already ongoing', 'warning');
                return;
            }

            if (!selectedEndTime) {
                throw new Error('Please select an end time');
            }
            // const unixTimestamp = selectedEndTime.getTime() / 1000; // To seconds
            // const endTimeBigNumber = BigNumber.from(unixTimestamp);

            // Calculate the end time in UNIX timestamp format (seconds)
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const endTimeInSeconds = currentTimeInSeconds + (selectedEndTime * 60);

            // Convert to BigNumber
            const endTimeBigNumber = BigNumber.from(endTimeInSeconds.toString());

            await contractCall('auction', 'startAuction', [endTimeBigNumber.toString()]);
            setIsSubmitted(true);
            // Call below function after end currentTimeInSeconds - endTimeInSeocnds.
            const delayInSeconds = (selectedEndTime * 3600) - (endTimeInSeconds - currentTimeInSeconds);

            setTimeout(async () => {
                try {
                    await contractCall('auction', 'finalizeAuction', []);
                } catch (error) {
                    console.error('Error finalizing auction:', error);
                }
            }, delayInSeconds * 1000);
        } catch (error) {
            console.error('Error starting auction:', error);
            // Display error message to the user
        }
    };


    const handleSubmit5Minutes = async (event) => {
        event.preventDefault();

        try {

            const auctionState = await contractCall('auction', 'getAuctionState', []);
            if (auctionState)
            {
                setIsSubmitted(true);
                Notifier.show('Auction already ongoing', 'warning');
                return;
            }

            if (!selectedEndTime) {
                throw new Error('Please select an end time');
            }
            // const unixTimestamp = selectedEndTime.getTime() / 1000; // To seconds
            // const endTimeBigNumber = BigNumber.from(unixTimestamp);

            // Calculate the end time in UNIX timestamp format (seconds)
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const endTimeInSeconds = currentTimeInSeconds + (5 * 60);

            // Convert to BigNumber
            const endTimeBigNumber = BigNumber.from(endTimeInSeconds.toString());

            await contractCall('auction', 'startAuction', [endTimeBigNumber.toString()]);
            setIsSubmitted(true);
            // Call below function after end currentTimeInSeconds - endTimeInSeocnds.
            const delayInSeconds = (selectedEndTime * 3600) - (endTimeInSeconds - currentTimeInSeconds);

            setTimeout(async () => {
                try {
                    await contractCall('auction', 'finalizeAuction', []);
                } catch (error) {
                    console.error('Error finalizing auction:', error);
                }
            }, delayInSeconds * 1000);
        } catch (error) {
            console.error('Error starting auction:', error);
            // Display error message to the user
        }
    };

    const handleFinalizeClick = async (event) => {
        event.preventDefault();

        try {

            const auctionState = await contractCall('auction', 'getAuctionState', []);
            // if (!auctionState)
            // {
            //     Notifier.show('No ongoing Auction', 'warning');
            //     return;
            // }
            await contractCall('auction', 'finalizeAuction', []);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error finalizing auction:', error);
            // Display error message to the user
        }
    };

    const handleGoToHomeClick = () => {
        navigate('/');
    };

    // const Item = styled(Paper)(({ theme }) => ({
    //     backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    //     ...theme.typography.body2,
    //     padding: theme.spacing(0),
    //     textAlign: 'center',
    //     color: theme.palette.text.secondary,
    //     flexGrow: 1,
    // }));


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
                {walletAddress === adminAddress.toString() ? (
                    <div>
                        <h1>Admin Controls</h1>
                        <Divider flexItem sx={{borderBottomWidth: 3}}/>
                        <br/>

                        <Stack spacing={{ xs: 1, sm: 2 }}  useFlexGap flexWrap="wrap">
                            {/*<Item>*/}
                                <Button variant="contained"
                                        sx={{width: '100%'}}
                                        onClick={handleSubmit}
                                        disabled={isLoading || isSubmitted}>
                                    {isLoading ? 'Loading...' : 'Start Auction for 1 Hour'}
                                </Button>
                            {/*</Item>*/}
                            {/*<Item>*/}
                                <Button variant="contained"
                                        sx={{width: '100%'}}
                                        onClick={handleSubmit5Minutes}
                                        disabled={isLoading || isSubmitted}>
                                    {isLoading ? 'Loading...' : 'Start Auction for 5 Minutes'}
                                </Button>
                            {/*</Item>*/}
                            {/*<Item>*/}
                                <Button variant="contained"
                                        sx={{width: '100%'}}
                                        onClick={handleFinalizeClick}
                                        disabled={isLoading || isSubmitted}>
                                    {isLoading ? 'Loading...' : 'Manually Finalize Auction'}
                                </Button>
                            {/*</Item>*/}
                        </Stack>
                    </div>
                ) : (
                    <div>
                        <h1>You are not the Admin</h1>
                        <p>You should go back to the home page.</p>
                        <Button variant="contained" onClick={handleGoToHomeClick}>
                            Go to Home Page
                        </Button>
                    </div>
                )}
            </div>
        </Box>
        </Container>
    );
}

export default AdminControls;