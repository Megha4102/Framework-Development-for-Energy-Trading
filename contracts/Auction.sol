// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Community.sol";
import "./GridInteraction.sol";
import "./Admin.sol";


contract Auction {

    Community public communityContract;
    GridInteraction public gridInteraction;
    Admin public adminContract;

    struct ListingDetails {
        uint256 energyCertificateId;
        address payable seller;
        uint256 startingPrice;
        uint256 highestBid; // will be represented in smallest units
        address payable highestBidder;
        ListingState state;
    }
    enum ListingState {Bidding, Ended}

    mapping(uint256 => ListingDetails) public listings;

    struct Bid {
        address payable bidder;
        uint256 amount; // will be represented in smallest units
    }

    mapping(uint256 => Bid[]) public bids;
    mapping(uint256 => address) public blacklistedBidders;


    uint256 public auctionEndTime; // In the Auction contract
    uint256[] public activeListingIds; // Array to track active listings

    event AuctionStarted(uint256 endTime);
    event AuctionEnded();
    event ListingStarted(uint256 indexed certificateId, address indexed seller, uint256 startingPrice);
    event ListingEnded(uint256 indexed certificateId, address indexed seller, address indexed highestBidder, uint256 highestBid);
    event NewBid(uint256 indexed certificateId, address indexed bidder, uint256 amount);
    event BidderWithdrew(uint256 indexed certificateId, address indexed bidder);

    constructor(address _adminContractAddress, address _communityContractAddress, address _gridInteractionAddress) {
        communityContract = Community(_communityContractAddress);
//        energyCertificate = EnergyCertificate(_certificateAddress);
        gridInteraction = GridInteraction(_gridInteractionAddress);
        adminContract = Admin(_adminContractAddress);
    }

//    modifier onlyAuctionContract() {
//        require(msg.sender == address(this), "Only the Auction contract can execute trades");
//        _;
//    }

    // TODO: Update modifier to check with sender and not msg.sender because now all contracts will be called by admin.
    // TODO: add onlyCommunityAdmin modifier to startAuction
    modifier onlyCommunityAdmin() {
        require(msg.sender == adminContract.communityAdmin(), "Only the community admin can perform this action");
        _;
    }

    // Function for the Community contract to start an auction
    function startAuction(uint256 endTime) external {  // Modified for Community call
        require(endTime > block.timestamp, "End time must be in the future");
        auctionEndTime = endTime;

        emit AuctionStarted(endTime); // New event
    }

    // Function for the seller to start a listing
    function startListing(address payable sender, uint256 certificateId, uint256 startingPrice) external {
        require(block.timestamp < auctionEndTime, "Auction is not currently active");
        (address owner,,,,) = communityContract.energyCertificate().getCertificateDetails(certificateId);

        require(owner == sender, "Only the certificate owner can list");

        // Retrieve seller address from the EnergyCertificate
        address seller = owner;

        listings[certificateId] = ListingDetails({
            energyCertificateId: certificateId,
            seller: payable(sender),
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            state: ListingState.Bidding // Updated enum name
        });

        activeListingIds.push(certificateId);

        emit ListingStarted(certificateId, seller, startingPrice);
    }

    //TODO: This function needs to have proper approval from both the parties
    function executeTrade(uint256 certificateId, address payable seller, address payable highestBidder, uint256 highestBid) internal {
        // 1. Transfer Energy Certificate to the highest bidder
        communityContract.energyCertificate().transferOwnership(seller, highestBidder, certificateId);

        // 2. Transfer tokens from highest bidder to the seller
        communityContract.electricityToken().transferFrom(highestBidder, seller, highestBid);

        // 3. Handle 'no bidder' scenario: Seller interacts with Grid
        if (highestBidder == address(0)) { // No bidder
            gridInteraction.purchaseCertificateFromSeller(certificateId, seller);
        }
    }

    //TODO: This function needs to have proper approval from both the parties
    // Function for sellers to end their listings early
    function endListing(address payable sender, uint256 certificateId) public {
        ListingDetails storage listing = listings[certificateId];
        require(listing.seller == sender, "Only the seller can end their listing");
        require(listing.state == ListingState.Bidding, "Listing is not active");

        listing.state = ListingState.Ended;

        // initiate trade
        executeTrade(certificateId, listing.seller, listing.highestBidder, listing.highestBid);

        emit ListingEnded(certificateId, listing.seller, listing.highestBidder, listing.highestBid);
        // Clear listing data
        delete listings[certificateId];

        // Remove from activeListingIds (efficient removal is a bit more complex, this is okay for now)
        for (uint256 i = 0; i < activeListingIds.length; i++) {
            if (activeListingIds[i] == certificateId) {
                activeListingIds[i] = activeListingIds[activeListingIds.length - 1]; // Swap with last
                activeListingIds.pop(); // Remove the last element
                break;
            }
        }
    }

    // Function for buyers to place bids
    function bid(address payable sender, uint256 certificateId, uint256 bidAmount) external {
        ListingDetails storage listing = listings[certificateId];
        require(listing.state == ListingState.Bidding, "Listing is not active");
        require(block.timestamp < auctionEndTime, "Auction has ended");
        require(bidAmount > listing.highestBid, "Bid must be higher than the current highest bid");

        // Check if the bidder is blacklisted for this listing
//        require(!blacklistedBidders[certificateId][msg.sender], "You have withdrawn from this listing");
        require(!isUserBlacklisted(certificateId, sender), "You are blacklisted from this listing");
        // Calculate potential total spend across currently winning bids
        uint256 totalPotentialSpend = bidAmount;
        for (uint256 i = 0; i < activeListingIds.length; i++) {
            if (listings[i].highestBidder == sender) {
                totalPotentialSpend += listings[i].highestBid;
            }
        }

        // Check if the buyer has sufficient token balance
        uint256 buyerBalance = communityContract.electricityToken().balanceOf(sender);
        require(totalPotentialSpend <= buyerBalance, "Insufficient token balance");

        // Update auction state
        listing.highestBid = bidAmount;
        listing.highestBidder = payable(sender);

        // Store the bid
        bids[certificateId].push(Bid(payable(sender), bidAmount));

        emit NewBid(certificateId, sender, bidAmount);
    }

    // Function for buyers to withdraw bids (except the highest bidder)
    function withdrawBid(address payable sender, uint256 certificateId) external {
        ListingDetails storage auction = listings[certificateId];
        require(auction.state == ListingState.Bidding, "Auction is not active");
        require(sender != auction.highestBidder, "Highest bidder cannot withdraw");

        // Prevent re-entry for this bidder on this listing
        blacklistedBidders[certificateId] = sender;

        emit BidderWithdrew(certificateId, sender);
    }

    //TODO: This function needs to have proper approval from both the parties
    // Function to finalize an auction after the end time
    function finalizeAuction() external {
//        require(block.timestamp >= auctionEndTime, "Auction period is not yet over");

        for (uint256 i = 0; i < activeListingIds.length; i++) {
            uint256 certificateId = activeListingIds[i];
            if (listings[certificateId].state == ListingState.Bidding) {
                endListing(listings[certificateId].seller, certificateId);
            }
        }

        // Clear bids and blacklist entries for all listings after finalization
        for (uint256 i = 0; i < activeListingIds.length; i++) {
            uint256 certificateId = activeListingIds[i];
            delete bids[certificateId];
            delete blacklistedBidders[certificateId];
        }

        emit AuctionEnded();

    }

    function getAuctionEndTime() external view returns (uint256) {
        return auctionEndTime;
    }

    function isUserBlacklisted(uint256 certificateId, address user) public view returns (bool) {
        return blacklistedBidders[certificateId] == user;
    }

    function getActiveListings() public view returns (ListingDetails[] memory) {
        ListingDetails[] memory activeListingsData = new ListingDetails[](activeListingIds.length);

        for (uint256 i = 0; i < activeListingIds.length; i++) {
            uint256 listingId = activeListingIds[i];
            ListingDetails storage listing = listings[listingId];

            // Ensure the listing is in the 'Bidding' state
            if (listing.state == ListingState.Bidding) {
                activeListingsData[i] = listing;
            }
        }

        return activeListingsData;
    }

    function getAuctionState() public view returns(bool){
        if(block.timestamp >= auctionEndTime)
            return false;
        return true;
    }
}
