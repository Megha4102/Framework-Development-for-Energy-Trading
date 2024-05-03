// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Admin {
    address  payable public communityAdmin;

    constructor(address payable _communityAdmin) {
        communityAdmin = _communityAdmin;
    }

    function getCommunityAdmin() external view returns (address) {
        return communityAdmin;
    }

    function setCommunityAdmin(address payable _newAdmin) external {
        communityAdmin = _newAdmin;
    }
}
