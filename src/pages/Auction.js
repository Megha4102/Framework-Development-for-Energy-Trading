import React, {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import AuctionListing from '../components/AuctionListing';
import AuctionDetails, {handleBidSubmit} from '../components/AuctionDetails';
import {contractCall} from "../utils/contractUtils";
import {Button, Container, Divider, InputLabel, LinearProgress, Modal, Stack, TextField} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {ethers} from "ethers";


// // Replace with actual data fetching logic
// const dummyListings = [
//     {id: 1, title: 'Solar Farm Listing', price: 100},
//     {id: 2, title: 'Wind Energy Listing', price: 250},
//     // ... more listings
// ];

const Auction = () => {

    const walletAddress = useSelector((state) => state.user.walletAddress);
    const navigate = useNavigate();

    const [listingType, setListingType] = useState('all');
    const [selectedListing, setSelectedListing] = useState(null);
    const [listings, setListings] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [certDetails, setCertDetails] = useState([]);
    const [size, setSize] = useState(50);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState('');
    const [startingPrice, setStartingPrice] = useState('');

    const [auctionState, setAuctionState] = useState(false);
    const [progress, setProgress] = React.useState(0);
    const [color, setColor] = useState({ r: 0, g: 255, b: 0 });

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleListingSelect = (event) => {
        setListingType(event.target.value);
    };

    const handleListingClick = (listingId) => {
        setSelectedListing(listings.find(listing => listing[0][0] === listingId));
    };

    const auctionCheck = async () => {
        try {
            const auctionCheck = await contractCall('auction', 'getAuctionState', []);
            setAuctionState(auctionCheck);
        } catch (error) {
            console.error('Error fetching auctionState:', error);
        }
    }

    const fetchListings = async () => {
        try {
            const listingsData = await contractCall('auction', 'getActiveListings', []);
            setListings(listingsData);
            // console.log("listingData: ", listingsData);
        } catch (error) {
            console.error('Error fetching listings:', error);
            // Consider displaying an error message to the user
        }
    };


    const fetchCertificatesOfUser = async () => {
        try {
            const certificatesData = await contractCall('energyCertificate', 'getOwnedCertificates', [walletAddress]);
            setCertificates(certificatesData);
            // console.log("certificatesData: ", certificatesData);
        } catch (error) {
            console.error('Error fetching certificates:', error);
            // Consider displaying an error message to the user
        }
    };

    async function updateCertificateDetails(certID) {
        // console.log('inside udateCertificateDetails');
        if (certID) {
            // console.log('inside if');
            try {
                const certStruct = await contractCall('energyCertificate', 'getCertificateDetails', [certID]);
                setCertDetails(certStruct);
                // console.log("certStruct: ", certStruct);
            } catch (error) {
                // Handle errors
                console.error('Error fetching certificate details:', error)
            }
        }
    }

    const handleConnectClick = () => {
        navigate('/connect');
    };

    const handleAddListing = async () => {
        // 1. Call the function to add a listing
        const price = ethers.parseUnits(startingPrice.toString(), 18);
        const tx1 = await contractCall('auction', 'startListing', [walletAddress, selectedCertificate, price.toString()]);
        // 2. Close the modal
        handleCloseModal();
    };

    // useEffect(() => {
    //     let fetch3 = auctionCheck();
    //     let fetch1 = fetchListings(); // Fetch initial data
    //     let fetch2= fetchCertificatesOfUser();
    //     const intervalId = setInterval(() => {
    //         let fetch1 = fetchListings(); // Update listings every minute
    //         let fetch2 = auctionCheck();
    //     }, 60000);
    //
    //     return () => clearInterval(intervalId); // Cleanup on unmount
    // }, []);
    useEffect(() => {
        let fetch3 = auctionCheck();
        let fetch1 = fetchListings(); // Fetch initial data
        // let fetch2= fetchCertificatesOfUser();
        const intervalId = setInterval(() => {
            let fetch1 = fetchListings(); // Update listings every minute
            let fetch2 = auctionCheck();
        }, 60000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    //TODO: Fix this progress bar, it currently runs only once, then stays at 0
    useEffect(() => {
        const duration = 60000; // Progress duration in milliseconds (1 minute)
        let startTime;
        let timer;
        function startProgress() {
            startTime = Date.now();
            timer = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const progress = elapsedTime / duration * 100; // Calculate percentage based on time

                setProgress(Math.min(progress, 100)); // Ensure it doesn't exceed 100%

                // Update RGB values based on progress
                const maxGreen = 255;
                const maxRed = 255;
                const redRatio = progress / 100;
                const greenRatio = 1 - redRatio;

                const newColor = {
                    r: Math.round(maxRed * redRatio),
                    g: Math.round(maxGreen * greenRatio),
                    b: 0 // Blue remains constant at 0
                };

                setColor(newColor);

                if (progress >= 100) {  // Reset when progress reaches 100%
                    setProgress(0);
                }
            }, 100); // Update frequently for smooth animation (adjust as needed)
        }

        startProgress(); // Start immediately

        return () => {
            clearInterval(timer);
        };
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            let fetch1 = fetchCertificatesOfUser();
        }
    }, [handleOpenModal]);


    const startResizing = (mouseDownEvent) => {
        mouseDownEvent.preventDefault();

        const startSize = size;
        const startPosition = mouseDownEvent.clientX;

        const onMouseMove = (mouseMoveEvent) => {
            const delta = mouseMoveEvent.clientX - startPosition;
            // const newSize = ((startSize * window.innerWidth + delta) * 100) / window.innerWidth;
            let newSize = startSize + (delta / window.innerWidth) * 100;

            // Constrain the newSize to be between 10% and 90% to prevent collapsing
            const constrainedSize = Math.min(Math.max(newSize, 10), 90);
            setSize(constrainedSize);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleGoToHomeClick = () => {
        navigate('/');
    };

    const handleDoubleClick = () => {
        setSize(50);
    };


    // Inline styles
    const containerStyle = {
        display: 'flex',
        height: 'auto',
    };

    const paneStyle = (width) => ({
        flexGrow: 1,
        overflow: 'auto',
        padding: '20px',
        width: `${width}%`,
    });

    const dividerStyle = {
        cursor: 'ew-resize',
        backgroundColor: '#666',
        width: '5px',
        height: 'calc(100vh - 116px)'
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'auto', // Adjust width as needed
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4, // Adds internal padding
        borderRadius: 2,
    };




    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setProgress((oldProgress) => {
    //             if (oldProgress === 100) {
    //                 return 0;
    //             }
    //             const diff = Math.random() * 10;
    //             return Math.min(oldProgress + diff, 100);
    //         });
    //     }, 500);
    //
    //     return () => {
    //         clearInterval(timer);
    //     };
    // }, []);

    // console.log("listings: ", listings);
    //TODO: Add proper check so that only one listing can be made with one certificate.
    return (
        <div>
            {walletAddress ? (
                <div>
                    {auctionState ?
                        <Stack>
                            <Box sx={{width: '100%'}}>
                                <LinearProgress variant="determinate" value={progress} sx={{
                                    '& > .MuiLinearProgress-bar': {
                                        backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                                    }
                                }}/>
                            </Box>


                            <div style={containerStyle}>
                                <div style={paneStyle(size)}>
                                    {/*<Box sx={{width: '100%'}}>*/}
                                    {/*    <LinearProgress variant="determinate" value={progress}/>*/}
                                    {/*</Box>*/}
                                    <h1 align="center">Active Listings</h1>
                                    <Divider flexItem sx={{borderBottomWidth: 3, mb: 1}}/>
                                    {/*<p>This is the left pane. Add your content or components here.</p>*/}
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                        <FormControl sx={{minWidth: 150, mr: 2}}>
                                            {/*<InputLabel>Listings</InputLabel>*/}
                                            <Select value={listingType} onChange={handleListingSelect}>
                                                <MenuItem value='all'>All Listings</MenuItem>
                                                <MenuItem value='my'>My Listings</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button variant="contained" onClick={handleOpenModal}>
                                            Add Listing
                                        </Button>
                                        <Modal open={isModalOpen} onClose={handleCloseModal}>
                                            <Box sx={modalStyle}> {/* Style your modal */}
                                                {/* Dropdown for certificate selection */}
                                                <FormControl sx={{
                                                    boxShadow: 5,
                                                    borderRadius: 2,
                                                }} fullWidth>
                                                    <InputLabel id="certificate-label">Certificate</InputLabel>
                                                    <Select
                                                        labelId="certificate-label"
                                                        value={selectedCertificate}
                                                        // onChange={(event) => setSelectedCertificate(event.target.value)}
                                                        onChange={async (event) => {
                                                            await setSelectedCertificate(event.target.value); // Keep existing logic
                                                            await updateCertificateDetails(event.target.value);// Fetch and update details
                                                            // console.log('after updateCertificateDetails call');
                                                        }}
                                                    >
                                                        {certificates.map((cert) => (
                                                            <MenuItem key={cert} value={cert}>
                                                                {cert}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                {/* Box to display certificate details */}
                                                {selectedCertificate && certDetails && (
                                                    <Card sx={{
                                                        mt: 2, boxShadow: 5,
                                                        borderRadius: 2,
                                                    }}> {/* Adds some margin-top */}
                                                        <CardContent>
                                                            {/* Access and display certificate details from selectedCertificate  */}
                                                            <Typography
                                                                variant="body1">Owner: {certDetails[0]}</Typography>
                                                            <Typography
                                                                variant="body1">Issuer: {certDetails[1]}</Typography>
                                                            <Typography variant="body1">Energy
                                                                Amount: {certDetails[2]}</Typography>
                                                            <Typography variant="body1">Is
                                                                Redeemed: {(certDetails[3] === false ? "No" : "Yes")}</Typography>
                                                            <Typography variant="body1">Expiry
                                                                Timestamp: {certDetails[4]}</Typography>
                                                            {/* Add more fields as needed */}
                                                        </CardContent>
                                                    </Card>
                                                )}
                                                {/* Text field for starting price */}
                                                <TextField
                                                    label="Starting Price"
                                                    value={startingPrice}
                                                    onChange={(event) => setStartingPrice(event.target.value)}
                                                    type="number" // Enforces numerical input
                                                    sx={{
                                                        mt: 2, boxShadow: 5,
                                                        borderRadius: 2,
                                                    }} // Adds top margin for spacing
                                                    fullWidth
                                                />
                                                <Button variant="contained" onClick={handleAddListing}>
                                                    Add to the Auction
                                                </Button>
                                            </Box>
                                        </Modal>
                                        <Typography variant="body1">
                                            {/* Display listings count if needed */}
                                        </Typography>
                                    </Box>
                                    <Box sx={{overflowY: 'auto'}}>
                                        {listings.map((listing) => (
                                            <AuctionListing
                                                key={listing[0][0]}
                                                listing={listing}
                                                // energyCertificateId ={listing[0][0]}
                                                // seller={listing[0][1]}
                                                // startingPrice={listing[0][2]}
                                                // highestBid={listing[0][3]}
                                                // highestBidder={listing[0][4]}
                                                onClick={() => handleListingClick(listing[0][0])}
                                            />
                                        ))}
                                    </Box>

                                </div>
                                <div style={dividerStyle} onMouseDown={startResizing}
                                     onDoubleClick={handleDoubleClick}></div>
                                <div style={paneStyle(100 - size)}>
                                    <h1 align="center">Listing Interaction</h1>
                                    <Divider flexItem sx={{borderBottomWidth: 3, mb: 1}}/>
                                    {/*<p>This is the right pane. Add your content or components here.</p>*/}

                                    {selectedListing ? (
                                        <AuctionDetails listing={selectedListing}/>
                                    ) : (
                                        <Box sx={{p: 2}}> {/* Adjusted Placeholder */}
                                            <Typography variant="body1" align="center">
                                                Select a listing to see more actions.
                                            </Typography>
                                        </Box>
                                    )}
                                </div>
                            </div>
                        </Stack>

                        :
                        <Container maxWidth="sm" sx={{mt: 5}} align="center">
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                bgcolor: 'background.paper',
                                boxShadow: 5,
                                borderRadius: 2,
                                p: 2,
                                minWidth: 300,
                                width: 'fit-content',
                            }}>
                                <div>
                                    <div>
                                        <h1>No ongoing Auction</h1>
                                        <p>Please check back later. </p>
                                        <Button variant="contained" onClick={handleGoToHomeClick}>
                                            Go to Home Page
                                        </Button>
                                    </div>
                                </div>
                            </Box>
                        </Container>
                    }
                </div>
            ) : (
                <Container maxWidth="sm" sx={{mt: 5}} align="center">
                    <Box sx={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper',
                        boxShadow: 5,
                        borderRadius: 2,
                        p: 2,
                        minWidth: 300,
                        width: 'fit-content',
                    }}>
                        <div>
                            <h1>Please Connect Your Wallet to Continue</h1>
                            <p>You can connect your wallet on the Connect Wallet page.</p>
                            <Button variant="contained" onClick={handleConnectClick}>
                                Go to Connect Wallet
                            </Button>
                        </div>
                    </Box>
                </Container>
            )}
        </div>
    );
};

export default Auction;
