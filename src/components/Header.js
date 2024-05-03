import React, {useState} from 'react';
import {AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, Avatar} from '@mui/material';
import {Link, useNavigate} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import {discWallet} from '../slices/userSlice.js';
import {contractCall} from "../utils/contractUtils";

// const React = require('react');
// const {useState} = require('react');
// const {AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, Avatar} = require('@mui/material')
// const {Link, useNavigate} = require('react-router-dom');
// const {useSelector, useDispatch} = require('react-redux');
// const {discWallet} = require('../slices/userSlice.js');

function Header() {
    const walletAddress = useSelector((state) => state.user.walletAddress);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const adminAddress = '0x0E5327D589DE35a425E71Df61cC39a24CB88742e';

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/"
                            sx={{flexGrow: 1, textDecoration: 'none', color: 'white'}}>
                    Energy Trading App
                </Typography>
                <Button color="inherit" component={Link} to="/">Home</Button>

                <Button color="inherit" component={Link} to="/buy-tokens">Buy Tokens</Button>
                <Button color="inherit" component={Link} to="/purchase-from-grid">Purchase From Grid</Button>
                <Button color="inherit" component={Link} to="/auction">Auction</Button>

                <div>
                    <IconButton
                        onClick={handleMenuOpen}
                        size="small"
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar sx={{width: 32, height: 32}}>
                            {/*{walletAddress.slice(0, 2)} */}
                            {'⚡'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleMenuClose}
                        PaperProps={{
                            // ... (Include menu styling from the provided example if desired)
                        }}
                        transformOrigin={{horizontal: 'right', vertical: 'top'}}
                        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                    >
                        {/*<MenuItem component={Link} to="/account">Account</MenuItem>*/}
                        {/*<MenuItem onClick={() => {*/}
                        {/*    dispatch(discWallet());*/}
                        {/*    navigate('/');*/}
                        {/*}}>Disconnect Wallet</MenuItem>*/}

                        {walletAddress ? (
                            <div>
                                <MenuItem component={Link} to="/account">Account</MenuItem>
                                {walletAddress === adminAddress ?
                                    (
                                        <div>
                                            <MenuItem component={Link} to="/admin-controls">Admin Controls</MenuItem>
                                            <MenuItem component={Link} to="/portfolio">Portfolio</MenuItem>
                                        </div>
                                    )
                                    : (
                                        <MenuItem component={Link} to="/portfolio">Portfolio</MenuItem>
                                    )
                                }
                                <MenuItem onClick={() => {
                                    dispatch(discWallet());
                                    navigate('/');
                                }}>Disconnect Wallet</MenuItem>
                            </div>
                        ) : (
                            <MenuItem component={Link} to="/connect">Connect Wallet</MenuItem>
                        )}
                    </Menu>
                </div>

            </Toolbar>
        </AppBar>
    )
        ;
}

export default Header;
// module.exports = Header;