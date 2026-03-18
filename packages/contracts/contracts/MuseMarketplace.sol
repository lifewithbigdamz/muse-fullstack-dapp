// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MuseMarketplace is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _listingCounter;

    struct Listing {
        uint256 tokenId;
        address nftContract;
        address seller;
        uint256 price;
        bool active;
        uint256 createdAt;
    }

    struct Offer {
        uint256 listingId;
        address offeror;
        uint256 amount;
        bool active;
        uint256 expiresAt;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256[]) public userListings;
    mapping(uint256 => uint256) public listingToOfferIndex;

    uint256 public marketplaceFee = 250; // 2.5% in basis points
    uint256 public constant MAX_FEE = 1000; // 10% max fee

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice
    );

    event ListingCancelled(uint256 indexed listingId);

    event ItemSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event OfferCreated(
        uint256 indexed listingId,
        address indexed offeror,
        uint256 amount,
        uint256 expiresAt
    );

    event OfferAccepted(
        uint256 indexed listingId,
        address indexed seller,
        address indexed offeror,
        uint256 amount
    );

    event MarketplaceFeeUpdated(uint256 newFee);

    constructor() {}

    function createListing(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(nftContract).getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        uint256 listingId = _listingCounter.current();
        _listingCounter.increment();

        listings[listingId] = Listing({
            tokenId: tokenId,
            nftContract: nftContract,
            seller: msg.sender,
            price: price,
            active: true,
            createdAt: block.timestamp
        });

        userListings[msg.sender].push(listingId);

        emit ListingCreated(listingId, msg.sender, nftContract, tokenId, price);
    }

    function updateListingPrice(uint256 listingId, uint256 newPrice) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");
        require(newPrice > 0, "Price must be greater than 0");

        listing.price = newPrice;

        emit ListingUpdated(listingId, newPrice);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;

        emit ListingCancelled(listingId);
    }

    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 totalPrice = listing.price;
        uint256 fee = (totalPrice * marketplaceFee) / 10000;
        uint256 sellerAmount = totalPrice - fee;

        listing.active = false;

        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        if (fee > 0) {
            (bool success, ) = owner().call{value: fee}("");
            require(success, "Fee transfer failed");
        }

        (bool success, ) = listing.seller.call{value: sellerAmount}("");
        require(success, "Seller transfer failed");

        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = msg.sender.call{
                value: msg.value - totalPrice
            }("");
            require(refundSuccess, "Refund failed");
        }

        emit ItemSold(listingId, listing.seller, msg.sender, totalPrice);
    }

    function createOffer(
        uint256 listingId,
        uint256 amount,
        uint256 duration
    ) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= amount, "Insufficient offer amount");
        require(amount > 0, "Offer must be greater than 0");
        require(listing.seller != msg.sender, "Cannot offer on own listing");

        uint256 expiresAt = block.timestamp + duration;
        require(expiresAt > block.timestamp, "Invalid duration");

        offers[listingId].push(Offer({
            listingId: listingId,
            offeror: msg.sender,
            amount: amount,
            active: true,
            expiresAt: expiresAt
        }));

        emit OfferCreated(listingId, msg.sender, amount, expiresAt);
    }

    function acceptOffer(uint256 listingId, uint256 offerIndex) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        Offer storage offer = offers[listingId][offerIndex];
        require(offer.active, "Offer not active");
        require(block.timestamp <= offer.expiresAt, "Offer expired");

        offer.active = false;
        listing.active = false;

        uint256 totalPrice = offer.amount;
        uint256 fee = (totalPrice * marketplaceFee) / 10000;
        uint256 sellerAmount = totalPrice - fee;

        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            offer.offeror,
            listing.tokenId
        );

        if (fee > 0) {
            (bool success, ) = owner().call{value: fee}("");
            require(success, "Fee transfer failed");
        }

        (bool success, ) = listing.seller.call{value: sellerAmount}("");
        require(success, "Seller transfer failed");

        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = msg.sender.call{
                value: msg.value - totalPrice
            }("");
            require(refundSuccess, "Refund failed");
        }

        emit OfferAccepted(listingId, msg.sender, offer.offeror, totalPrice);
    }

    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }

    function getActiveListings() external view returns (Listing[] memory) {
        uint256 activeCount = 0;
        uint256 totalListings = _listingCounter.current();

        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory activeListings = new Listing[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].active) {
                activeListings[index] = listings[i];
                index++;
            }
        }

        return activeListings;
    }

    function getUserListings(address user) external view returns (Listing[] memory) {
        uint256[] storage userListingIds = userListings[user];
        Listing[] memory userListingArray = new Listing[](userListingIds.length);

        for (uint256 i = 0; i < userListingIds.length; i++) {
            userListingArray[i] = listings[userListingIds[i]];
        }

        return userListingArray;
    }

    function getOffers(uint256 listingId) external view returns (Offer[] memory) {
        return offers[listingId];
    }

    function withdrawFees() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
