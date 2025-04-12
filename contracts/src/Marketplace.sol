// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    struct Listing {
        address seller;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    IERC20 public paymentToken;
    address public platformFeeReceiver;
    uint96 public platformFeeBps = 500; // 5%

    error PaymentToSellerFailed();
    error PaymentToPlatformFailed();
    error ListingNotActive();
    error InvalidFee();
    error InvalidReceiver();
    error InvalidNFT();
    error InvalidTokenId();
    error InvalidPrice();
    error InvalidListingId();
    error InvalidNFTAddress();

    uint256 public listingId;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed id, address seller, address nft, uint256 tokenId, uint256 price);
    event Purchased(uint256 indexed id, address buyer, address nft, address seller, uint256 tokenId, uint256 price);

    constructor(address _paymentToken, address _platformFeeReceiver) {
        paymentToken = IERC20(_paymentToken);
        platformFeeReceiver = _platformFeeReceiver;
    }

    function listNFT(address nft, uint256 tokenId, uint256 price) external {
        IERC721(nft).transferFrom(msg.sender, address(this), tokenId);

        listings[listingId] = Listing({
            seller: msg.sender,
            nftAddress: nft,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit Listed(listingId, msg.sender, nft, tokenId, price);
        listingId++;
    }

    function buyNFT(uint256 id) external {
        Listing storage item = listings[id];
        require(item.active, ListingNotActive());
        require(item.price > 0, InvalidPrice());
        require(item.seller != address(0), InvalidReceiver());
        require(item.nftAddress != address(0), InvalidNFTAddress());

        uint256 fee = (item.price * platformFeeBps) / 10000;
        uint256 sellerAmount = item.price - fee;

        // Melhorar lógica para devolver paymentToken se falhar
        if (paymentToken.transferFrom(msg.sender, item.seller, sellerAmount)) {
            if (paymentToken.transferFrom(msg.sender, platformFeeReceiver, fee)) {
                // Transferir NFT para o comprador
                IERC721(item.nftAddress).transferFrom(address(this), msg.sender, item.tokenId);
            } else {
                revert PaymentToPlatformFailed();
            }
        } else {
            revert PaymentToSellerFailed();
        }

        item.active = false;
        emit Purchased(id, msg.sender, item.nftAddress, item.seller, item.tokenId, item.price);
    }

    function updateFee(uint96 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, InvalidFee());
        platformFeeBps = newFeeBps;
    }

    function setPlatformReceiver(address newReceiver) external onlyOwner {
        require(newReceiver != address(0), InvalidReceiver());
        platformFeeReceiver = newReceiver;
    }
}
