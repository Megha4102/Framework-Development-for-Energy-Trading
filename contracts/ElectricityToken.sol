// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Admin.sol";

contract ElectricityToken is ERC20 {
    Admin public adminContract;

    event ElectricityTokensMinted(address indexed by, uint256 amount);
    event ElectricityTokensBurned(address indexed user, uint256 amount);

    constructor(address _adminContractAddress, uint256 initialSupply) ERC20("ElectricityToken", "ELTK") {
        adminContract = Admin(_adminContractAddress);
        _mint(adminContract.communityAdmin(), initialSupply * 10 ** decimals());
    }


    // TODO: Update modifier to check with sender and not msg.sender because now all contracts will be called by admin.
    // TODO: add onlyCommunityAdmin modifier to mintElectricityTokens and burnElectricityTokens
    modifier onlyCommunityAdmin() {
        require(msg.sender == adminContract.communityAdmin(), "Only the designated admin can perform this action");
        _;
    }

    function mintElectricityTokens(address to, uint256 amount) external  {
        _mint(to, amount);
        emit ElectricityTokensMinted(to, amount);
    }

    function burnElectricityTokens(address from, uint256 amount) external  {
        _burn(from, amount);
        emit ElectricityTokensBurned(from, amount);
    }

    // Add the following functions for approval management
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount); // Use the internal _approve function
        return true;
    }
}
