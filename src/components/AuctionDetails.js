import React, {useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import {ethers} from "ethers";
import {contractCall} from "../utils/contractUtils";
import {useSelector} from "react-redux";
import {BigNumber} from "@ethersproject/bignumber";
import contractData from '../contractData.json';
import Notifier from "./Notifier";

const AuctionDetails = ({ listing }) => {

    const walletAddress = useSelector((state) => state.user.walletAddress);
    const [bidAmount, setBidAmount] = useState('');

     const handleBidChange = (event) => {
        setBidAmount(event.target.value);
    };

     const handleBidSubmit = async () => {
        // TODO: Implement bid submission logic
        try {
            const amount = await BigNumber.from(ethers.parseUnits(bidAmount, 18).toString());
            const spender1 = contractData.electricityToken.address;
            const spender2 = contractData.auction.address;
            // let curAllowance = await contractCall('electricityToken', 'allowance', [walletAddress, spender]);
            // curAllowance = BigNumber.from(curAllowance.toString());
            //
            // if(amount > curAllowance)
            // {
            //     const approvalAmount = amount - curAllowance;
            //     const tx = await contractCall('electricityToken', 'approve', [spender, approvalAmount.toString()], walletAddress);
            // }

            const unlimitedApproval = BigNumber.from(ethers.MaxUint256.toString()); // Very large number
            const tmp = await contractCall('electricityToken', 'approve', [spender1, unlimitedApproval.toString()], walletAddress);
            const tmp2 = await contractCall('electricityToken', 'approve', [spender2, unlimitedApproval.toString()], walletAddress);

            const tx = await contractCall('auction', 'bid',[walletAddress, listing[0], amount.toString()]);
            console.log('Bid submitted:', bidAmount);
        }
        catch (error)
        {
            console.log("Error submitting bid.");
            Notifier.show("Error submitting bid.(Causes: Allowance / Bid Amount / Already withdrawn / No auction)", 'error');
        }
    };

    const handleWithdraw = async () => {
        // TODO: Implement withdraw logic
        try {
            const tx = await contractCall('auction', 'withdrawBid', [walletAddress, listing[0]]);
            console.log('Withdraw initiated');
        }
        catch (error)
        {
            console.log("Error withdrawing from listing.");
            Notifier.show('Error withdrawing from bid. (Causes: Highest bid / No auction / Already withdrawn)', 'error');
        }
    };

    return (
        <Card sx={{ width: '100%', boxShadow: 5,
            borderRadius: 2,}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Energy Certificate ID: {listing[0]}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Seller: {listing[1]}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Starting Price: {ethers.formatUnits(listing[2], 18)} ELTK
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Highest Bid: {ethers.formatUnits(listing[3], 18)} ELTK
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Highest Bidder: {listing[4]}
                </Typography>
                {/* Add more listing details here as needed */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TextField
                        label="Bid Amount"
                        value={bidAmount}
                        onChange={handleBidChange}
                        sx={{ mr: 2 }}
                    />
                    <Button variant="contained" onClick={handleBidSubmit}>Bid</Button>
                    <Button variant="outlined" onClick={handleWithdraw} sx={{ ml: 2 }}>
                        Withdraw
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default AuctionDetails;
