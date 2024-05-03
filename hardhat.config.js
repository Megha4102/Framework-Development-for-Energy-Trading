require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    ganache: {
      url: "http://192.168.56.1:7545", // The URL of your Ganache instance, we are using ethernet for hostname in server settings.
      accounts: ["0x94c83d271c723fd1ca8434fdcb8fd2abb88f5fd6b745e53aac51520cfc14f6ad"] // Array of account private keys
    }
  }
};


// // hardhat.config.js
// import "@nomicfoundation/hardhat-toolbox";
//
// const config = {
//   solidity: "0.8.24",
//   networks: {
//     ganache: {
//       url: "http://192.168.56.1:7545",
//       accounts: ["0x8f99d7e305249e5c21f3241438bfe63b445771d05b09bd0e76ae6f05acf3cea6"]
//     }
//   }
// };
//
// export default config;
// export { ethers } from "hardhat";
