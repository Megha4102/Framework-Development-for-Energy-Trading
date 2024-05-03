import React, {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {contractCall} from "../utils/contractUtils";

const AuctionListing = ({listing, onClick}) => {
    const [certDetails, setCertDetails] = useState([]);

    async function updateCertificateDetails(certID) {
        if (certID) {
            try {
                const certStruct = await contractCall('energyCertificate', 'getCertificateDetails', [certID]);
                setCertDetails(certStruct);
            } catch (error) {
                // Handle errors
                console.error('Error fetching certificate details:', error)
            }
        }
    }

    useEffect(() => {
        let fetch1 = updateCertificateDetails(listing[0]);
    }, [listing]);

    return (
        <ListItem button onClick={onClick}>
            <Card sx={{width: '100%', boxShadow: 5,
                borderRadius: 2,}}>
                <CardContent>
                    <ListItemText
                        primary={listing[0][0]}
                        secondary={`Energy Amount: ${certDetails[2]} KWh`}
                    />
                </CardContent>
            </Card>
        </ListItem>
    );
};

export default AuctionListing;
