// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./ElectricityToken.sol"; // Assuming your ElectricityToken contract
import "./Admin.sol";

contract EnergyCertificate {

    struct Certificate {
        uint256 id;
        address payable owner;
        address payable issuer;
        uint256 energyAmount;
        bool isRedeemed;
        uint256 expiryTimestamp; // Add an expiry timestamp
    }

    ElectricityToken public electricityToken; // Reference to your token contract
    Admin public adminContract; // Reference to your admin contract

    uint256 private certificateIdCounter;
    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => uint256) public certificateCollateral; // Map certificate ID directly to collateral

    uint256 public defaultExpirationPeriod = 30 days; // Example: 30-day default

    event CertificateMinted(uint256 indexed certificateId, address owner, uint256 energyAmount);
    event OwnershipTransferred(uint256 indexed certificateId, address from, address to);
    event CertificateRedeemed(uint256 indexed certificateId);
    event CertificateBurned(uint256 indexed certificateId);

    // Constructor
    constructor(address _adminContractAddress, address _tokenAddress) {
        adminContract = Admin(_adminContractAddress);
        electricityToken = ElectricityToken(_tokenAddress); // Set up token reference
        certificateIdCounter = 1;
    }

    //TODO: Fix all modifiers to use sender instead of msg.sender as all functions will be called by the admin.
    //TODO: Add onlyOwner(certificateId) notExpired(certificateId) notRedeemed(certificateId) to transferOwnership and redeemCertificate.

    modifier onlyOwner(uint256 certificateId) {
        require(msg.sender == certificates[certificateId].owner, "Only the owner can perform this action");
        _;
    }

    modifier notRedeemed(uint256 certificateId) {
        require(!certificates[certificateId].isRedeemed, "Certificate already redeemed");
        _;
    }

    modifier notExpired(uint256 certificateId) {
        require(block.timestamp <= certificates[certificateId].expiryTimestamp, "Certificate has expired");
        _;
    }

    // Function to mint certificates (with collateral)
    function mintCertificate(address payable seller, uint256 energyAmount, uint256 gridEnergyPrice) external returns (uint256){
        uint256 collateralAmount = energyAmount * gridEnergyPrice * 10 / 100;
        electricityToken.transferFrom(seller, adminContract.communityAdmin(), collateralAmount);
        uint256 newCertificateId = certificateIdCounter;
        certificates[newCertificateId] = Certificate({
            id: newCertificateId,
            owner: seller,
            issuer: seller,
            energyAmount: energyAmount,
            isRedeemed: false,
            expiryTimestamp: block.timestamp + defaultExpirationPeriod
        });
        certificateIdCounter++;
        certificateCollateral[newCertificateId] = collateralAmount;
        emit CertificateMinted(newCertificateId, seller, energyAmount);
        return newCertificateId; // Return the ID
    }

    // Function to delete certificate and release collateral
    function burnCertificate(address payable sender, uint256 certificateId) public {
        require(certificates[certificateId].isRedeemed || block.timestamp > certificates[certificateId].expiryTimestamp, "Certificate must be redeemed or expired");
        require(sender == certificates[certificateId].owner || sender == certificates[certificateId].issuer, "Only owner or issuer can burn");

        uint256 collateralToRelease = certificateCollateral[certificateId];
        delete certificateCollateral[certificateId];
        delete certificates[certificateId]; // Delete the certificate itself

//        electricityToken.transfer(certificates[certificateId].issuer, collateralToRelease);
        electricityToken.transferFrom(adminContract.communityAdmin(), certificates[certificateId].issuer, collateralToRelease);
        emit CertificateBurned(certificateId);
    }

    // Function for transferring ownership
    function transferOwnership(address payable sender, address payable to, uint256 certificateId) external  {
        certificates[certificateId].owner = to;
        emit OwnershipTransferred(certificateId, sender, to);
    }

    // Function to simulate redemption/delivery
    function redeemCertificate(address payable sender, uint256 certificateId) external  {
        certificates[certificateId].isRedeemed = true;
        emit CertificateRedeemed(certificateId);
        burnCertificate(sender, certificateId); // Burn after redemption
    }

    // Function to retrieve the details of a specific certificate
    function getCertificateDetails(uint256 certificateId) public view returns (address owner, address issuer, uint256 energyAmount, bool isRedeemed, uint256 expiryTimestamp)
    {
        Certificate storage cert = certificates[certificateId];
        return (cert.owner, cert.issuer, cert.energyAmount, cert.isRedeemed, cert.expiryTimestamp);
    }

    // Function to retrieve all the certificates of a particular person
    function getOwnedCertificates(address owner) external view returns (uint256[] memory) {
        uint256 totalCertificates = certificateIdCounter - 1; // Adjust for starting ID of 1
        uint256[] memory ownedCertificateIds = new uint256[](totalCertificates); // Temporary array
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalCertificates; i++) {
            if (certificates[i].owner == owner) {
                ownedCertificateIds[currentIndex] = i;
                currentIndex++;
            }
        }
        // Resize the array to include only owned certificates
        assembly {mstore(ownedCertificateIds, currentIndex)}
        return ownedCertificateIds;
    }
}
