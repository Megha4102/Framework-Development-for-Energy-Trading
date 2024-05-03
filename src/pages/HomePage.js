import React, {useEffect} from 'react';
import {AppBar, Toolbar, Typography, Button, Box, Container, LinearProgress} from '@mui/material';
import { Link } from 'react-router-dom';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';


// const React = require('react');
// const {AppBar, Toolbar, Typography, Button} = require('@mui/material');
// const {Link} = require('react-router-dom');

const HomePage = () => {
    return (
        <Container sx={{mt:5}} align="center">
            <Typography component="div">
                <Box sx={{ fontWeight: 'bold', m: 1, fontSize: 40 }}>Welcome to P2P Energy Trading App</Box>
            </Typography>
            <Box sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'background.paper',
                boxShadow: 5,
                borderRadius: 2,
                p: 2,
                minWidth: 300,
                width: 'min-content',
            }}>
                <Typography>
                    <Box>
                        {/*This app is built to streamline the trade of Electricity among organizations who manage and operate on power grids.*/}
                        Steps to get the best out of this app:
                    </Box>
                    <Box>
                        <Timeline position="alternate">
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineDot color="secondary" />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Box sx={{ ml:-1, mt:-1,p: 0.5, textAlign: 'left', border:1, borderRadius: '16px', borderColor: 'secondary.main', bgcolor: 'secondary.main',width: 'fit-content'}}>
                                        <Typography variant="body1" color="white" align="center">Register</Typography>
                                    </Box>
                                </TimelineContent>
                            </TimelineItem>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineDot color="secondary" />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Box sx={{ mr:-1, mt:-1,p: 0.5, textAlign: 'left', border:1, borderRadius: '16px', borderColor: 'secondary.main', bgcolor: 'secondary.main', width: 'fit-content'}}>
                                        <Typography variant="body1" color="white" >Purchase ELTK</Typography>
                                    </Box>
                                </TimelineContent>
                            </TimelineItem>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineDot  color="secondary" />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Box sx={{ ml:-1, mt:-1,p: 0.5, textAlign: 'left', border:1, borderRadius: '16px', borderColor: 'secondary.main', bgcolor: 'secondary.main', width: 'fit-content'}}>
                                        <Typography variant="body1" color="white">Participate In Auction</Typography>
                                    </Box>
                                </TimelineContent>
                            </TimelineItem>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineDot color="secondary" />
                                    <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Box sx={{ mr:-1, mt:-1,p: 0.5, textAlign: 'left', border:1, borderRadius: '16px', borderColor: 'secondary.main', bgcolor: 'secondary.main', width: 'fit-content'}}>
                                        <Typography variant="body1" color="white" >In a hurry? Purchase from Grid</Typography>
                                    </Box>
                                </TimelineContent>
                            </TimelineItem>
                            <TimelineItem>
                                <TimelineSeparator>
                                    <TimelineDot color="success" />
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Box sx={{ ml:-1, mt:-1, p: 0.5, textAlign: 'left', border:1, borderRadius: '16px', borderColor: 'success.main', bgcolor: 'success.main', width: 'fit-content'}}>
                                        <Typography variant="body1" color="white" >All Done!</Typography>
                                    </Box>
                                </TimelineContent>
                            </TimelineItem>
                        </Timeline>
                    </Box>
                </Typography>
            </Box>
        </Container>
    )
};

export default HomePage;
// module.exports=HomePage;
