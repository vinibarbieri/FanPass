// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketNFT
 * @notice NFT de ingresso com restrições: apenas um contrato autorizado pode executar mint, burn e transferências.
 */
contract TicketNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 public nextTokenId;

    address public controller;

    struct PassInfo {
        string sector;
        uint256 clubId;
        uint256 validFrom;
        uint256 validUntil;
    }

    mapping(uint256 => PassInfo) public passInfo;

    error NotAuthorized();
    error OnlyController();
    error NotValid();

    modifier onlyController() {
        if (msg.sender != controller) {
            revert NotAuthorized();
        }
        _;
    }

    constructor(address royaltyReceiver, uint96 royaltyFeeInBips) ERC721("FutPass Ticket", "FTP") Ownable(msg.sender) {
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeInBips);
    }

    /// @notice Define o contrato FanPass controller
    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }

    function getController() external view returns (address) {
        return controller;
    }

    function getOwner() external view returns (address) {
        return owner();
    }

    /// @notice Mint restrito ao controller
    function mint(
        address to,
        string memory sector,
        uint256 clubId,
        uint256 validFrom,
        uint256 validUntil,
        string memory tokenURI
    ) external onlyController {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        passInfo[tokenId] = PassInfo(sector, clubId, validFrom, validUntil);
    }

    /// @notice Burn restrito ao controller
    function burn(uint256 tokenId) external onlyController {
        _burn(tokenId);
        delete passInfo[tokenId];
    }

    /// @notice Bloqueia transferências externas
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // Permite mint e burn (from == 0 ou to == 0), mas bloqueia transferências não autorizadas
        if (from != address(0) && to != address(0)) {
            if (msg.sender != controller) {
                revert OnlyController();
            }
        }

        return super._update(to, tokenId, auth);
    }


    function isValid(uint256 tokenId) public view returns (bool) {
        PassInfo memory info = passInfo[tokenId];
        return block.timestamp >= info.validFrom && block.timestamp <= info.validUntil;
    }

    function getPassInfo(uint256 tokenId) public view returns (
        string memory sector,
        uint256 clubId,
        uint256 validFrom,
        uint256 validUntil
    ) {
        PassInfo memory info = passInfo[tokenId];
        return (info.sector, info.clubId, info.validFrom, info.validUntil);
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory) {
        return tokenURI(tokenId);
    }

    function setDefaultRoyalty(address receiver, uint96 feeInBips) external onlyOwner {
        _setDefaultRoyalty(receiver, feeInBips);
    }

    function isOwner(uint256 tokenId, address user) public view returns (bool) {
        return ownerOf(tokenId) == user;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
