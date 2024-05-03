// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

//import "./EnergyCertificate.sol";
import "./Community.sol";
//import "./ElectricityToken.sol";
import "./Admin.sol";

contract GridInteraction {

//    EnergyCertificate public energyCertificate;
    Community public communityContract;
    Admin public adminContract;
    uint256 public gridEnergyPrice;

    event EnergyCertificatePurchasedFromSeller(uint256 indexed certificateId, address indexed seller);
    event EnergyPurchasedFromGrid(uint256 indexed certificateId, address indexed buyer, uint256 energyAmount);

    constructor(address _adminContractAddress, address _communityContractAddress, uint256 _initialGridEnergyPrice) {
//        energyCertificate = EnergyCertificate(_energyCertificateAddress);
        communityContract = Community(_communityContractAddress); // may not be important
        gridEnergyPrice = _initialGridEnergyPrice;
        adminContract = Admin(_adminContractAddress);
    }

    // TODO: Update modifier to check with sender and not msg.sender because now all contracts will be called by admin.
    // TODO: add onlyCommunityAdmin modifier to setGridEnergyPrice.
    modifier onlyCommunityAdmin() {
        require(msg.sender == adminContract.communityAdmin(), "Only the community admin can perform this action");
        _;
    }

    //TODO: This function needs to be approved appropriately by both the user and the admin.
    function purchaseCertificateFromSeller(uint256 certificateId, address payable seller) external {
//        require(msg.sender == address(this), "Only the grid can purchase from sellers");
        // Ensure the certificate ownership is transferred before burning tokens
//        uint256 amount = energyCertificate.certificates(certificateId).energyAmount * gridEnergyPrice;

        // Retrieve energyAmount using the getter
        (,,,, uint256 energyAmount) = communityContract.energyCertificate().getCertificateDetails(certificateId);
        uint256 amount = energyAmount * gridEnergyPrice;

        require(communityContract.electricityToken().allowance(adminContract.communityAdmin(), address(this)) >= amount, "Not enough allowance from communityAdmin");
        require(communityContract.electricityToken().balanceOf(adminContract.communityAdmin()) >= amount, "Not enough balance available with communityAdmin");

        communityContract.energyCertificate().transferOwnership(seller, adminContract.communityAdmin(), certificateId);
//        communityContract.electricityToken.burnElectricityTokens(adminContract.communityAdmin(), amount);
//        communityContract.electricityToken.mintElectricityTokens(seller, amount);
//        communityContract.electricityToken.transferFrom(adminContract.communityAdmin(), seller, amount);
            communityContract.electricityToken().transferFrom(adminContract.communityAdmin(), seller, amount);
        emit EnergyCertificatePurchasedFromSeller(certificateId, seller);
    }

    //TODO: This function needs to be approved appropriately by both the user and the admin.
    function buyEnergyFromGrid(address payable sender, uint256 energyAmount) external returns (uint256) {
        uint256 totalCost = energyAmount * gridEnergyPrice;
        require(communityContract.electricityToken().balanceOf(sender) >= totalCost, "Not enough balance available with user");
        require(communityContract.electricityToken().balanceOf(adminContract.communityAdmin()) >= totalCost, "Not enough balance available with communityAdmin");

        require(communityContract.electricityToken().allowance(sender, address(this)) >= totalCost, "Not enough allowance from user");
        require(communityContract.electricityToken().allowance(adminContract.communityAdmin(), address(this)) >= totalCost, "Not enough allowance from communityAdmin");

        communityContract.electricityToken().transferFrom(sender, adminContract.communityAdmin(), totalCost);
        uint256 certificateId = communityContract.energyCertificate().mintCertificate(adminContract.communityAdmin(), energyAmount, gridEnergyPrice);
        communityContract.energyCertificate().transferOwnership(adminContract.communityAdmin(), payable(sender), certificateId);

        emit EnergyPurchasedFromGrid(certificateId, sender, energyAmount);

        return certificateId;
    }

    function setGridEnergyPrice(uint256 newPrice) external  {
        gridEnergyPrice = newPrice;
    }

    function getGridEnergyPrice() external view returns (uint256) {
        return gridEnergyPrice;
    }
}
