// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


interface ITicketNFT is IERC721 {
    function getPassInfo(uint256 tokenId) external view returns (
        uint256 clubId,
        string memory setor,
        uint256 validFrom,
        uint256 validTo
    );
}

contract Marketplace is Ownable, ReentrancyGuard {
    struct SaleListing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 index;
    }

    struct RentListing {
        uint256 tokenId;
        address owner;
        uint256 pricePerDay;
        uint256 maxDuration; // in days
        uint256 minDuration; // in days
        bool active;
        uint256 index;
    }

    struct RentInfo {
        uint256 tokenId;
        address owner;
        address renter;
        uint256 expiresAt;
        bool active;
    }

    address public ticketNFT;

    uint96 public platformFeeBps = 500; // 5%
    address public platformReceiver;

    mapping(address => bool) public allowedExecutors;

    mapping(uint256 => RentInfo) public activeRents;

    mapping(uint256 => SaleListing) public saleListings;
    mapping(uint256 => RentListing) public rentListings;

    uint256[] public activeSaleTokenIds;
    uint256[] public activeRentTokenIds;
    
    // clubId => fan token address
    mapping(uint256 => address) public fanTokens;

    // clubId => receiver address (para royalties)
    mapping(uint256 => address) public clubReceivers;

    event NFTListedForSale(uint256 tokenId, address seller, uint256 price);
    event SaleListingEdited(uint256 tokenId, address seller, uint256 price);
    event NFTSold(uint256 tokenId, address buyer, address seller, uint256 price);

    event NFTListedForRent(uint256 tokenid, address owner, uint256 pricePerDay, uint256 maxDuration, uint256 minDuration);
    event NFTRented(uint256 tokenid, address renter, address owner, uint256 durationDays, uint256 pricePerDay);
    event RentListingEdited(uint256 tokenId, address owner, uint256 pricePerDay, uint256 maxDuration, uint256 minDuration);

    event SaleListingCancelled(uint256 tokenId);
    event RentListingCancelled(uint256 tokenId);

    error FailToPayPlatform();
    error FailToPaySeller();
    error FailToPayClub();
    error NotListed();
    error TooLongDuration();
    error TooShortDuration();
    error InvalidDuration();
    error AlreadyRented();
    error AlreadyListed();
    error NotOwner();
    error NotSeller();
    error MarketplaceNotApproved();
    error TransferToMarketplaceFailed();
    error InvalidPrice();
    error StillRented();
    error StillListedToSell();
    error TicketTransferFailed();
    error FailedToRefundBuyer();
    error TicketRentalFailed();
    error InvalidFee();
    error FailedToPayMarketplace();
    error InsufficientBalance();


    constructor(address _ticketNFT, address _platformReceiver) Ownable(msg.sender) {
        ticketNFT = _ticketNFT;
        platformReceiver = _platformReceiver;
    }

    function setFanToken(uint256 clubId, address token) external onlyOwner {
        fanTokens[clubId] = token;
    }

    function getFanToken(uint256 clubId) external view returns (address) {
        return fanTokens[clubId];
    }

    function setClubReceiver(uint256 clubId, address receiver) external onlyOwner {
        clubReceivers[clubId] = receiver;
    }

    function getClubReceiver(uint256 clubId) external view returns (address) {
        return clubReceivers[clubId];
    }


    function setPlatformFee(uint96 bps) external onlyOwner {
        if (bps == 0 || bps > 1000) {
            revert InvalidFee();
        }
        platformFeeBps = bps;
    }

    function setPlatformReceiver(address receiver) external onlyOwner {
        platformReceiver = receiver;
    }

    function setOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    function getActiveRentInfo(uint256 tokenId) external view returns (RentInfo memory) {
        return activeRents[tokenId];
    }


    function listForSale(uint256 tokenId, uint256 price) external {
        if(ITicketNFT(ticketNFT).ownerOf(tokenId) != msg.sender) {
            revert NotOwner();
        }
        if(price <= 0) {
            revert InvalidPrice();
        }
        if(saleListings[tokenId].active == true) {
            revert AlreadyListed();
        }
        if(activeRents[tokenId].active == true) {
            revert AlreadyRented();
        }
    
        saleListings[tokenId] = SaleListing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            index: activeSaleTokenIds.length

        });
        
        // Add tokenId to active sale list
        activeSaleTokenIds.push(tokenId);

        emit NFTListedForSale(tokenId, msg.sender, price);
    }

    function editSaleListing(uint256 tokenId, uint256 price) external {
        SaleListing storage listing = saleListings[tokenId];
        if(listing.seller != msg.sender) {
            revert NotSeller();
        }
        if(price <= 0) {
            revert InvalidPrice();
        }

        listing.price = price;

        emit SaleListingEdited(tokenId, msg.sender, price);
    }

    function cancelSaleListing(uint256 tokenId) external {
        SaleListing storage listing = saleListings[tokenId];
        if(listing.seller != msg.sender) {
            revert NotSeller();
        }

        delete saleListings[tokenId];
        
        // Remove tokenId from active sale list
        _removeFromActiveSaleList(tokenId);

        emit SaleListingCancelled(tokenId);
    }

    function buy(uint256 tokenId) external nonReentrant {
        SaleListing storage listing = saleListings[tokenId];
        if(!listing.active) {
            revert NotListed();
        }

        if(ITicketNFT(ticketNFT).ownerOf(tokenId) != listing.seller) {
            revert NotOwner();
        }
        if (
            ITicketNFT(ticketNFT).getApproved(tokenId) != address(this) &&
            !ITicketNFT(ticketNFT).isApprovedForAll(ITicketNFT(ticketNFT).ownerOf(tokenId), address(this))
        ) {
            revert MarketplaceNotApproved();
        }


        (uint256 clubId,,,) = ITicketNFT(ticketNFT).getPassInfo(tokenId);
        IERC20 token = IERC20(fanTokens[clubId]);

        uint256 buyerBalance = token.balanceOf(msg.sender);
        if(buyerBalance < listing.price) {
            revert InsufficientBalance();
        }

        uint256 fee = (listing.price * platformFeeBps) / 10000;
        uint256 clubFee = fee / 2;
        uint256 sellerAmount = listing.price - fee;
        uint256 platformAmount = fee - clubFee;

        bool ok = token.transferFrom(msg.sender, address(this), listing.price);
        if (!ok) revert FailedToPayMarketplace();

        // Transfere o NFT para o comprador e os pagamentos apenas se a transferência for bem sucedida
        try ITicketNFT(ticketNFT).safeTransferFrom(listing.seller, msg.sender, tokenId) {
            ok = token.transfer(listing.seller, sellerAmount);
            if (!ok) revert FailToPaySeller();

            ok = token.transfer(clubReceivers[clubId], clubFee);
            if (!ok) revert FailToPayClub();
        
            ok = token.transfer(platformReceiver, platformAmount);
            if (!ok) revert FailToPayPlatform();

            _clearListings(tokenId);
            emit NFTSold(tokenId, msg.sender, listing.seller, listing.price);
        } catch {
            if(!token.transfer(msg.sender, listing.price)) {
                revert FailedToRefundBuyer();
            }
            revert TicketTransferFailed();
        }

    }

    function listForRent(uint256 tokenId, uint256 pricePerDay, uint256 maxDuration, uint256 minDuration) external {
        if(ITicketNFT(ticketNFT).ownerOf(tokenId) != msg.sender) {
            revert NotOwner();
        }
        if(maxDuration <= 0) {
            revert TooShortDuration();
        }
        if(activeRents[tokenId].active == true) {
            revert AlreadyRented();
        }
        if(rentListings[tokenId].active == true) {
            revert AlreadyListed();
        }
        if(pricePerDay <= 0) {
            revert InvalidPrice();
        }

        rentListings[tokenId] = RentListing({
            tokenId: tokenId,
            owner: msg.sender,
            pricePerDay: pricePerDay,
            maxDuration: maxDuration,
            minDuration: minDuration,
            active: true,
            index: activeRentTokenIds.length

        });
        
        // Add tokenId to active rent list
        activeRentTokenIds.push(tokenId);

        emit NFTListedForRent(tokenId, msg.sender, pricePerDay, maxDuration, minDuration);
    }

    function editRentListing(uint256 tokenId, uint256 pricePerDay, uint256 maxDuration, uint256 minDuration) external {
        RentListing storage listing = rentListings[tokenId];
        if(listing.owner != msg.sender) {
            revert NotOwner();
        }
        if(pricePerDay <= 0) {
            revert InvalidPrice();
        }
        if(maxDuration <= 0) {
            revert TooShortDuration();
        }

        listing.pricePerDay = pricePerDay;
        listing.maxDuration = maxDuration;
        listing.minDuration = minDuration;

        emit RentListingEdited(tokenId, msg.sender, pricePerDay, maxDuration, minDuration);
    }

    function rent(uint256 tokenId, uint256 durationDays) external nonReentrant {
        RentListing storage listing = rentListings[tokenId];
        if(!listing.active) {
            revert NotListed();
        }
        if(ITicketNFT(ticketNFT).ownerOf(tokenId) != listing.owner) {
            revert NotOwner();
        }
        if(durationDays > listing.maxDuration) {
            revert TooLongDuration();
        }
        if(durationDays < listing.minDuration) {
            revert TooShortDuration();
        }

        (uint256 clubId,,,) = ITicketNFT(ticketNFT).getPassInfo(tokenId);
        IERC20 token = IERC20(fanTokens[clubId]);

        if (
            ITicketNFT(ticketNFT).getApproved(tokenId) != address(this) &&
            !ITicketNFT(ticketNFT).isApprovedForAll(ITicketNFT(ticketNFT).ownerOf(tokenId), address(this))
        ) {
            revert MarketplaceNotApproved();
        }


        uint256 buyerBalance = token.balanceOf(msg.sender);
        if(buyerBalance < listing.pricePerDay * durationDays) {
            revert InsufficientBalance();
        }

        uint256 totalPrice = listing.pricePerDay * durationDays;
        uint256 fee = (totalPrice * platformFeeBps) / 10000;
        uint256 clubFee = fee / 2;
        uint256 ownerAmount = totalPrice - fee;
        uint256 platformAmount = fee - clubFee;

        bool ok = token.transferFrom(msg.sender, address(this), totalPrice);
        if (!ok) revert FailedToPayMarketplace();

        // Transfere o NFT para o marketplace e os pagamentos apenas se a transferência for bem sucedida
        try ITicketNFT(ticketNFT).safeTransferFrom(listing.owner, address(this), tokenId) {

            activeRents[tokenId] = RentInfo({
                tokenId: tokenId,
                owner: listing.owner,
                renter: msg.sender,
                expiresAt: block.timestamp + (durationDays * 1 days),
                active: true
                });

            ok = token.transfer(listing.owner, ownerAmount);
            if (!ok) revert FailToPaySeller();

            ok = token.transfer(clubReceivers[clubId], clubFee);
            if (!ok) revert FailToPayClub();
        
            ok = token.transfer(platformReceiver, platformAmount);
            if (!ok) revert FailToPayPlatform();

            _clearListings(tokenId);
            emit NFTRented(tokenId, msg.sender, listing.owner, durationDays, listing.pricePerDay);
        } catch {
            if(!token.transfer(msg.sender, totalPrice)) {
                revert FailedToRefundBuyer();
            }
            revert TicketRentalFailed();
        }
    }

    function withdrawRentedNFT(uint256 tokenId) external {
        RentInfo storage info = activeRents[tokenId];
        if(!(msg.sender == info.renter || 
            msg.sender == info.owner ||
            allowedExecutors[msg.sender])) {
            revert NotOwner();
        }
        if(!info.active) {
            revert NotListed();
        }
        if(block.timestamp < info.expiresAt) {
            revert StillRented();
        }

        ITicketNFT(ticketNFT).safeTransferFrom(address(this), info.owner, tokenId);

        delete activeRents[tokenId];
    }

    function isRentalActive(uint256 tokenId) public view returns (bool) {
        RentInfo memory info = activeRents[tokenId];
        return info.active && block.timestamp < info.expiresAt;
    }

    function cancelRentListing(uint256 tokenId) external {
        RentListing storage listing = rentListings[tokenId];
        if(listing.owner != msg.sender) {
            revert NotOwner();
        }
        if(!listing.active) {
            revert NotListed();
        }
        if(isRentalActive(tokenId)) {
            revert StillRented();
        }

        delete rentListings[tokenId];
        
        // Remove tokenId from active rent list
        _removeFromActiveRentList(tokenId);

        emit RentListingCancelled(tokenId);
    }

    function getActiveListings(uint256 tokenId) external view returns (SaleListing memory, RentListing memory) {
        SaleListing memory saleList = saleListings[tokenId];
        RentListing memory rentList = rentListings[tokenId];
        return (saleList, rentList);
    }

    function getPriceToRent(uint256 tokenId, uint256 daysCount) external view returns (uint256) {
        RentListing memory listing = rentListings[tokenId];
        return listing.pricePerDay * daysCount;
    }

    function setExecutors(address executor, bool allowed) external onlyOwner {
        allowedExecutors[executor] = allowed;
    }

    function _clearListings(uint256 tokenId) private {
        delete saleListings[tokenId];
        delete rentListings[tokenId];
        delete activeRents[tokenId];
        
        // Remove from active lists
        _removeFromActiveSaleList(tokenId);
        _removeFromActiveRentList(tokenId);
    }
    
    function _removeFromActiveSaleList(uint256 tokenId) private {
        uint256 index = saleListings[tokenId].index;
        uint256 lastTokenId = activeSaleTokenIds[activeSaleTokenIds.length - 1];

        activeSaleTokenIds[index] = lastTokenId;
        saleListings[lastTokenId].index = index;

        activeSaleTokenIds.pop();
        delete saleListings[tokenId];
    }

    
    function _removeFromActiveRentList(uint256 tokenId) private {
        uint256 index = rentListings[tokenId].index;
        uint256 lastTokenId = activeRentTokenIds[activeRentTokenIds.length - 1];

        activeRentTokenIds[index] = lastTokenId;
        rentListings[lastTokenId].index = index;

        activeRentTokenIds.pop();
        delete rentListings[tokenId];
    }

    function getActiveSaleListings() external view returns (SaleListing[] memory) {
        SaleListing[] memory listings = new SaleListing[](activeSaleTokenIds.length);
        
        for (uint256 i = 0; i < activeSaleTokenIds.length; i++) {
            listings[i] = saleListings[activeSaleTokenIds[i]];
        }
        
        return listings;
    }
    
    function getActiveRentListings() external view returns (RentListing[] memory) {
        RentListing[] memory listings = new RentListing[](activeRentTokenIds.length);
        
        for (uint256 i = 0; i < activeRentTokenIds.length; i++) {
            listings[i] = rentListings[activeRentTokenIds[i]];
        }
        
        return listings;
    }

}