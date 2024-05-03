// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ElectricityToken.sol";
import "./EnergyCertificate.sol";
import "./Admin.sol";

// Assume OpenZeppelin ERC20 is already imported
import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // Import the ERC20 implementation
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Community {

    enum Role {Buyer, Seller}
    struct User {
        address payable userAddress;
        Role role;
        uint reputationScore;
    }

    mapping(address => User) public users;

    ElectricityToken public electricityToken;
    EnergyCertificate public energyCertificate;
    Admin public adminContract;  // Reference to your Admin contract
    uint256 public subscriptionFeeAmount; // This is in wei as users will be paying this in Eth
    uint256 public tokenPrice; // This is also in wei as users will be acquiring tokens by paying in Eth

    event UserRegistered(address indexed userAddress, Role role);
    event UserModified(address indexed userAddress, Role role);
    event UserDeregistered(address indexed userAddress);
    event SubscriptionFeePaid(address indexed userAddress, uint256 amount);


    constructor(address _adminContractAddress, address _tokenAddress, address _certificateAddress, uint256 _initialTokenPrice, uint256 _subscriptionFeeAmount) {
        adminContract = Admin(_adminContractAddress);
        electricityToken = ElectricityToken(_tokenAddress);
        energyCertificate = EnergyCertificate(_certificateAddress);
        tokenPrice = _initialTokenPrice;
        subscriptionFeeAmount = _subscriptionFeeAmount;
    }

    //TODO: Update modifier to check with sender and not msg.sender because now all contracts will be called by admin.
    //TODO: add onlyCommunityAdmin modifier to setTokenPrice and setSubscriptionFee
    modifier onlyCommunityAdmin() {
        require(msg.sender == adminContract.communityAdmin(), "Only the community admin can perform this action");
        _;
    }

    //TODO: This contract currently assumes that the subscription fee is paid beforehand. Then only this function is called.
    function registerUser(address payable sender, Role desiredRole) public {
        require(!(users[sender].role == Role.Buyer) && !(users[sender].role == Role.Seller), "User already registered");
        require(desiredRole == Role.Buyer || desiredRole == Role.Seller, "Invalid role");
        // Call paySubscriptionFee automatically
//        paySubscriptionFee(sender);
//        require(paySubscriptionFee(sender), "Subscription fee payment failed");
        users[sender] = User(payable(sender), desiredRole, 0);
        emit UserRegistered(sender, desiredRole);
    }

    function modifyUser(address payable sender, Role newRole) public {
        require(users[sender].role == Role.Buyer || users[sender].role == Role.Seller, "User is not registered");
        require(newRole == Role.Buyer || newRole == Role.Seller, "Invalid role");
        require(newRole != users[sender].role, "Role is already the same");

        users[sender].role = newRole;
        emit UserModified(sender, newRole);
    }

    function deregisterUser(address payable sender) public {
        require(users[sender].role == Role.Buyer || users[sender].role == Role.Seller, "User is not registered");
        delete users[sender]; // Reset User Data
        emit UserDeregistered(sender);
    }

    //TODO: the paySubscriptionFee function is not used anywehere as of now. We do not have a good mechanism for getting ethers from the user yet.
    function paySubscriptionFee(address payable sender) private returns (bool) {
//        uint256 estimatedTransferGas = this.estimateGas.transfer(subscriptionFeeAmount);
////        adminContract.communityAdmin().transfer(msg.value);
////        electricityToken.transferFrom(sender, adminContract.communityAdmin(), msg.value);
//        sender.transfer(msg.value);
//        emit SubscriptionFeePaid(sender, msg.value);
        uint256 gasStipend = 2300; // As per transfer function's description
        uint256 requiredBalance = subscriptionFeeAmount + tx.gasprice * gasStipend;

        require(sender.balance > requiredBalance, "Insufficient balance for subscription fee and gas");

        // Transfer the subscriptionFeeAmount (gas will be deducted automatically)
        sender.transfer(subscriptionFeeAmount);

        emit SubscriptionFeePaid(sender, subscriptionFeeAmount);
        return true;
    }

    //TODO: This contract currently assumes that the weiAmount of ethers is paid beforehand. Then only this function is called.
    function purchaseTokens(address payable sender, uint256 weiAmount) public payable {
        require(weiAmount > 0, "Must send a positive amount of Ether");
        // Calculate tokens to transfer (no changes needed here)
        uint256 tokensToTransfer = (weiAmount / tokenPrice) * 10 ** 18;
        require(electricityToken.balanceOf(adminContract.communityAdmin()) >= tokensToTransfer, "Not enough tokens available");
        require(electricityToken.allowance(adminContract.communityAdmin(), address(this)) >= tokensToTransfer, "Not enough allowance");

//        uint256 someval =electricityToken.allowance(adminContract.communityAdmin(), address(this));
//        revert (string.concat("Allowance: ", Strings.toString(someval), ", address(this): ", Strings.toHexString(uint256(uint160(address(this))), 20), ", msg.sender", Strings.toHexString(uint256(uint160(mSender)), 20), ", communityAdmin: ", Strings.toHexString(uint256(uint160(address(adminContract.communityAdmin()))), 20), ", tokensToTransfer: ", Strings.toString(tokensToTransfer)));
        electricityToken.transferFrom(adminContract.communityAdmin(), sender, tokensToTransfer);
    }

    function getUser(address userAddress) public view returns (User memory) {
        require(users[userAddress].role == Role.Buyer || users[userAddress].role == Role.Seller, "User not registered"); // Add a check
        return users[userAddress];
    }

    // TODO: Reputation mechanism will be added in the future
//    function updateReputationScore(address userAddress, int delta) public {
//        require(users[userAddress].role == Role.Buyer || users[userAddress].role == Role.Seller, "Invalid user");
//        users[userAddress].reputationScore += delta;
//    }

    function setTokenPrice(uint256 newTokenPrice) external {
        tokenPrice = newTokenPrice;
    }

    function getTokenPrice() external view returns (uint256) {
        return tokenPrice;
    }

    function setSubscriptionFee(uint256 newSubscriptionFeeAmount) external {
        subscriptionFeeAmount = newSubscriptionFeeAmount;
    }

    function getSubscriptionFee() external view returns (uint256) {
        return subscriptionFeeAmount;
    }
}
