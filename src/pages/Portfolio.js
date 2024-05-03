import {Box, Container, Grid, Paper, styled, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import AuctionListing from "../components/AuctionListing";
import {contractCall} from "../utils/contractUtils";
import {useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";

const Portfolio = () => {

    const [listings, setListings] = useState([]);
    const walletAddress = useSelector((state) => state.user.walletAddress);
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState([]);
    const [certDetails, setCertDetails] = useState([]);

    const fetchCertificatesOfUser = async () => {
        try {
            const certificatesData = await contractCall('energyCertificate', 'getOwnedCertificates', [walletAddress]);
            setCertificates(certificatesData);
            console.log("certificatesData: ", certificatesData);
        } catch (error) {
            console.error('Error fetching certificates:', error);
            // Consider displaying an error message to the user
        }
    };

    useEffect(() => {
        let fetch1 = fetchCertificatesOfUser();

    }, []);

    const Item = styled(Paper)(({theme}) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));


    return (
        <Container sx={{mt: 5}} align="center">
            <Typography component="div">
                <Box sx={{fontWeight: 'bold', m: 1, fontSize: 40}}>My Portfolio</Box>
            </Typography>
            <Box sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper',
                boxShadow: 5,
                borderRadius: 2,
                p: 2,
                minWidth: 300,
                width: 'fit-content',
            }}>
                {/*<Grid container spacing={2}>*/}
                {/*    <Grid item xs={5}>*/}
                {/*        <Item>ELTK: </Item>*/}
                {/*    </Grid>*/}
                {/*    <Grid item xs={5}>*/}
                {/*        <Item>ETH: </Item>*/}
                {/*    </Grid>*/}

                {/*</Grid>*/}

                <div>
                    <h1>
                        Page under construction...
                    </h1>
                </div>


            </Box>
        </Container>
    )
}

export default Portfolio