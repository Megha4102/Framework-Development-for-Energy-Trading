import logo from './logo.svg';
import './App.css';
import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Provider} from 'react-redux';
import {store} from './store.js'; // Import your Redux store
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import HomePage from './pages/HomePage.js';
import ConnectWallet from './pages/ConnectWallet.js';
import Account from './pages/Account.js';
import BuyTokens from './pages/BuyTokens.js';
import PurchaseFromGrid from './pages/PurchaseFromGrid.js';
import {NotificationProvider} from "./components/NotificationContext.js";
import Auction from "./pages/Auction";
import AdminControls from "./pages/AdminControls";
import {ThemeProvider} from "@mui/material";
import * as themes from "./themes";
import Portfolio from "./pages/Portfolio";

// const logo = require('./logo.svg');
// require('./App.css'); // Load your CSS file
// const React = require('react');
// const { BrowserRouter, Routes, Route } = require('react-router-dom');
// const { Provider } = require('react-redux');
// const { store } = require('./store.js');
// const Header = require('./components/Header.js');
// const Footer = require('./components/Footer.js');
// const HomePage = require('./pages/HomePage.js');
// const ConnectWallet = require('./pages/ConnectWallet.js');
// const Account = require('./pages/Account.js');
// const BuyTokens = require('./pages/BuyTokens.js');
// const PurchaseFromGrid = require('./pages/PurchaseFromGrid.js');
// const { NotificationProvider } = require('./components/NotificationContext.js');

function App() {
    return (
        <Provider store={store}>
            <NotificationProvider>
                <BrowserRouter>
                    {/*<ThemeProvider theme={themes.warmEarthTheme}>*/}
                    <Header/>

                        <Routes className="content-container">
                            <Route path="/" element={<HomePage/>}/>
                            <Route path="/connect" element={<ConnectWallet/>}/>
                            <Route path="/account" element={<Account/>}/>
                            <Route path="/buy-tokens" element={<BuyTokens/>}/>
                            <Route path="/purchase-from-grid" element={<PurchaseFromGrid/>}/>
                            <Route path="/auction" element={<Auction/>}/>
                            <Route path="/admin-controls" element={<AdminControls/>}/>
                            <Route path="/portfolio" element={<Portfolio/>}/>
                            {/* Add more routes as needed */}
                        </Routes>

                    <Footer className="footer--pin"/>
                    {/*</ThemeProvider>*/}
                </BrowserRouter>
            </NotificationProvider>
        </Provider>
    );
}

export default App;
// module.exports = App;