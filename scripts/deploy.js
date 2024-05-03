// import hardhat from 'hardhat';
// import fs from 'fs';
// import path from 'path';
// const { ethers } = hardhat;

// import {ethers} from "hardhat";
// import path from "path";
// import * as fs from "fs";


const ethers = require('hardhat').ethers;
const path = require('path');
const fs = require('fs');

async function main() {
    // const scaleFactor = 10000;
    // Variables for deployment parameters
    const adminWalletAddress = "0x0E5327D589DE35a425E71Df61cC39a24CB88742e";
    const initialSupply = 10000;

    const initialTokenPrice = ethers.parseEther("0.0017"); // denoted in wei
    const subscriptionFeeAmount = ethers.parseEther("0.05"); //denoted in wei
    const initialGridEnergyPrice = ethers.parseUnits("0.01", 18); // denoted in wei(the smallest unit) for ELTK

    // Deploy p2p.sol first
    const Admin = await ethers.getContractFactory("Admin");
    const admin = await Admin.deploy(adminWalletAddress);
    console.log("Admin deployed to:", await admin.getAddress());

    // Deploy ElectricityToken.sol next
    const ElectricityToken = await ethers.getContractFactory("ElectricityToken");
    const electricityToken = await ElectricityToken.deploy(await admin.getAddress(), initialSupply);
    console.log("ElectricityToken deployed to:", await electricityToken.getAddress());

    // Deploy EnergyCertificate.sol next
    const EnergyCertificate = await ethers.getContractFactory("EnergyCertificate");
    const energyCertificate = await EnergyCertificate.deploy(await admin.getAddress(), await electricityToken.getAddress());
    console.log("EnergyCertificate deployed to:", await energyCertificate.getAddress());

    // Deploy Community.sol next
    const Community = await ethers.getContractFactory("Community");
    const community = await Community.deploy(await admin.getAddress(), await electricityToken.getAddress(), await energyCertificate.getAddress(), initialTokenPrice, subscriptionFeeAmount);
    console.log("Community deployed to:", await community.getAddress());

    // Deploy GridInteraction.sol next
    const GridInteraction = await ethers.getContractFactory("GridInteraction");
    const gridInteraction = await GridInteraction.deploy(await admin.getAddress(), await community.getAddress(), initialGridEnergyPrice);
    console.log("GridInteraction deployed to:", await gridInteraction.getAddress());

    // Now deploy Auction.sol with addresses of P2P and P2G as arguments
    const Auction = await ethers.getContractFactory("Auction");
    const auction = await Auction.deploy(await admin.getAddress(), await community.getAddress(), await gridInteraction.getAddress());
    console.log("Auction deployed to:", await auction.getAddress());

    // Get deployed contract addresses
    const adminAddress = await admin.getAddress();
    const electricityTokenAddress = await electricityToken.getAddress();
    const energyCertificateAddress = await energyCertificate.getAddress();
    const communityAddress = await community.getAddress();
    const gridInteractionAddress = await gridInteraction.getAddress();
    const auctionAddress = await auction.getAddress();

    // Get ABI paths
    // const artifactsPath = path.resolve(import.meta.dirname, '../artifacts');
    const artifactsPath = path.resolve(__dirname, '../artifacts');
    // Get ABI paths
    // const artifactsDir = new URL('../artifacts', import.meta.url); // Construct URL
    // const artifactsPath = path.join(artifactsDir.pathname); // Extract clean path

    const AdminABI = JSON.parse(fs.readFileSync(`${artifactsPath}/contracts/Admin.sol/Admin.json`).toString()).abi;
    const ElectricityTokenABI = JSON.parse(fs.readFileSync(`${artifactsPath}/contracts/ElectricityToken.sol/ElectricityToken.json`).toString()).abi;
    const EnergyCertificateABI = JSON.parse(fs.readFileSync(`${artifactsPath}/contracts/EnergyCertificate.sol/EnergyCertificate.json`).toString()).abi;
    const CommunityABI = JSON.parse(fs.readFileSync(`${artifactsPath}/contracts/Community.sol/Community.json`).toString()).abi;
    const GridInteractionABI = JSON.parse(fs.readFileSync(`${artifactsPath}/contracts/GridInteraction.sol/GridInteraction.json`).toString()).abi;
    const AuctionABI = JSON.parse(fs.readFileSync(`${artifactsPath}/contracts/Auction.sol/Auction.json`).toString()).abi;

    const contractData = {
        admin: {
            address: adminAddress,
            ABI: AdminABI
        },
        electricityToken: {
            address: electricityTokenAddress,
            ABI: ElectricityTokenABI
        },
        energyCertificate: {
            address: energyCertificateAddress,
            ABI: EnergyCertificateABI
        },
        community: {
            address: communityAddress,
            ABI: CommunityABI
        },
        gridInteraction: {
            address: gridInteractionAddress,
            ABI: GridInteractionABI
        },
        auction: {
            address: auctionAddress,
            ABI: AuctionABI
        }
    };
    // Path to the JSON file (inside src folder)
    // const outputPath = path.resolve(import.meta.dirname, '../src/contractData.json');
    const outputPath = path.resolve(__dirname, '../src/contractData.json');

    // Write contract data to JSON
    fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
    console.log("Contract details written to:", outputPath);

    //TODO: Add admin's approval to all contracts code here.
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

