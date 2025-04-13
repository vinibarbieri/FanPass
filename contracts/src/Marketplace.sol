// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
        address seller;
        uint256 price;
        bool active;
    }

    struct RentListing {
        address owner;
        uint256 pricePerDay;
        uint256 maxDuration; // in days
        uint256 minDuration; // in days
        bool active;
    }

    struct RentInfo {
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


    constructor(address _ticketNFT, address _platformReceiver, address _initial_owner) Ownable(_initial_owner) {
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
        require(bps <= 1000, InvalidFee());
        platformFeeBps = bps;
    }

    function getPlatformFee() external view returns (uint96) {
        return platformFeeBps;
    }

    function setPlatformReceiver(address receiver) external onlyOwner {
        platformReceiver = receiver;
    }

    function getPlatformReceiver() external view returns (address) {
        return platformReceiver;
    }

    function setOwner(address newOwner) external onlyOwner {
        transferOwnership(newOwner);
    }

    function getOwner() external view returns (address) {
        return owner();
    }

    function listForSale(uint256 tokenId, uint256 price) external {
        require(ITicketNFT(ticketNFT).ownerOf(tokenId) == msg.sender, NotOwner());
        require(price > 0, InvalidPrice());
        require(saleListings[tokenId].active == false, AlreadyListed());
        require(activeRents[tokenId].active == false, AlreadyRented());
    
        saleListings[tokenId] = SaleListing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit NFTListedForSale(tokenId, msg.sender, price);
    }

    function editSaleListing(uint256 tokenId, uint256 price) external {
        SaleListing storage listing = saleListings[tokenId];
        require(listing.seller == msg.sender, NotSeller());
        require(listing.active, NotListed());
        require(price > 0, InvalidPrice());

        listing.price = price;

        emit SaleListingEdited(tokenId, msg.sender, price);
    }

    function cancelSaleListing(uint256 tokenId) external {
        SaleListing storage listing = saleListings[tokenId];
        require(listing.seller == msg.sender, NotSeller());
        require(listing.active, NotListed());

        delete saleListings[tokenId];

        emit SaleListingCancelled(tokenId);
    }

    function buy(uint256 tokenId) external nonReentrant {
        SaleListing storage listing = saleListings[tokenId];
        require(ITicketNFT(ticketNFT).ownerOf(tokenId) == listing.seller, NotOwner());
        require(listing.active, NotListed());

        require(ITicketNFT(ticketNFT).getApproved(tokenId) == address(this), MarketplaceNotApproved());

        (uint256 clubId,,,) = ITicketNFT(ticketNFT).getPassInfo(tokenId);
        IERC20 token = IERC20(fanTokens[clubId]);

        uint256 buyerBalance = token.balanceOf(msg.sender);
        require(buyerBalance >= listing.price, InsufficientBalance());

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
            require(token.transfer(msg.sender, listing.price), FailedToRefundBuyer());
            revert TicketTransferFailed();
        }

    }

    function listForRent(uint256 tokenId, uint256 pricePerDay, uint256 maxDuration, uint256 minDuration) external {
        require(ITicketNFT(ticketNFT).ownerOf(tokenId) == msg.sender, NotOwner());
        require(maxDuration > 0, TooShortDuration());
        require(activeRents[tokenId].active == false, AlreadyRented());
        require(rentListings[tokenId].active == false, AlreadyListed());
        require(pricePerDay > 0, InvalidPrice());

        rentListings[tokenId] = RentListing({
            owner: msg.sender,
            pricePerDay: pricePerDay,
            maxDuration: maxDuration,
            minDuration: minDuration,
            active: true
        });

        emit NFTListedForRent(tokenId, msg.sender, pricePerDay, maxDuration, minDuration);
    }

    function editRentListing(uint256 tokenId, uint256 pricePerDay, uint256 maxDuration, uint256 minDuration) external {
        RentListing storage listing = rentListings[tokenId];
        require(listing.owner == msg.sender, NotOwner());
        require(listing.active, NotListed());
        require(pricePerDay > 0, InvalidPrice());
        require(maxDuration > 0, TooShortDuration());

        listing.pricePerDay = pricePerDay;
        listing.maxDuration = maxDuration;
        listing.minDuration = minDuration;

        emit RentListingEdited(tokenId, msg.sender, pricePerDay, maxDuration, minDuration);
    }

    function rent(uint256 tokenId, uint256 durationDays) external nonReentrant {
        RentListing storage listing = rentListings[tokenId];
        require(ITicketNFT(ticketNFT).ownerOf(tokenId) == listing.owner, NotOwner());
        require(listing.active, NotListed());
        require(durationDays <= listing.maxDuration, TooLongDuration());
        require(durationDays >= listing.minDuration, TooShortDuration());

        (uint256 clubId,,,) = ITicketNFT(ticketNFT).getPassInfo(tokenId);
        IERC20 token = IERC20(fanTokens[clubId]);

        require(ITicketNFT(ticketNFT).getApproved(tokenId) == address(this), MarketplaceNotApproved());

        uint256 buyerBalance = token.balanceOf(msg.sender);
        require(buyerBalance >= listing.pricePerDay * durationDays, InsufficientBalance());

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
            require(token.transfer(msg.sender, totalPrice), FailedToRefundBuyer());
            revert TicketRentalFailed();
        }
    }

    function withdrawRentedNFT(uint256 tokenId) external {
        RentInfo storage info = activeRents[tokenId];
        require(
            msg.sender == info.renter || 
            msg.sender == info.owner ||
            allowedExecutors[msg.sender],
            NotOwner()
        );
        require(info.active, NotListed());
        require(block.timestamp >= info.expiresAt, StillRented());

        ITicketNFT(ticketNFT).safeTransferFrom(address(this), info.owner, tokenId);

        delete activeRents[tokenId];
    }

    function isRentalActive(uint256 tokenId) public view returns (bool) {
        RentInfo memory info = activeRents[tokenId];
        return info.active && block.timestamp < info.expiresAt;
    }

    function cancelRentListing(uint256 tokenId) external {
        RentListing storage listing = rentListings[tokenId];
        require(listing.owner == msg.sender, NotOwner());
        require(listing.active, NotListed());
        require(!isRentalActive(tokenId), StillRented());

        delete rentListings[tokenId];

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

    function _clearListings(uint256 tokenId) public {
        delete saleListings[tokenId];
        delete rentListings[tokenId];
        delete activeRents[tokenId];
    }



}