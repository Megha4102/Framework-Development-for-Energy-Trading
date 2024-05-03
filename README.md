# Getting Started with energytrader3



## Important: Do the following before jumping to the steps!

1. Install and create a workspace in Ganache.
2. In Ganache, go to Settings>Server and change the hostname to Ethernet.
3. Update this url in [hardhat.config.js](hardhat.config.js) and [transaction-server/server.js](transaction-server/server.js)
4. Pick an account to use as communityAdmin and assign its public key to adminWalletAddress in [scripts/deploy.js](scripts/deploy.js).
5. Create a file called `.env` in [transaction-server](transaction-server) and paste the following code in it:
   `COMMUNITY_ADMIN_PRIVATE_KEY='placeholder'`
6. **In the previous step, don't forget to replace the placeholder with your communityAdmin's private key**.

## Steps

1. Open a terminal at the [project directory]() (Terminal 1).
2. Open a terminal at the [firebase-auth directory](firebase-auth) (Terminal 2).
3. Open a terminal at the [transaction-server directory](transaction-server) (Terminal 3).
4. In each terminal (Terminal 1, 2 and 3), run: `npm install`
5. Wait for these to complete.
6. In Terminal 1, run: `npx hardhat compile` and then `npx hardhat run scripts/deploy.js --network ganache`
7. In Terminal 2 and 3, run `node server.js` to start both the servers. 
8. Finally run `npm start` in Terminal 1 to start the application.



