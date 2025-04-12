// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "lib/openzeppelin-contracts/contracts/token/common/ERC2981.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

/**
 * @title TicketNFT
 * @notice NFT de ingresso de temporada com setor e validade, compatível com marketplaces e royalties automáticos (EIP-2981).
 */
contract TicketNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 public nextTokenId;

    struct PassInfo {
        string sector;        // setor do estádio (ex: "leste", "camarote", etc.)
        uint256 clubId;       // clube (ex: "Flamengo", "Vasco", etc.)
        uint256 validFrom;    // início da validade (timestamp)
        uint256 validUntil;   // fim da validade (timestamp)
    }

    mapping(uint256 => PassInfo) public passInfo; // mapeia tokenId para PassInfo

    constructor(
        address royaltyReceiver,      // endereço que receberá os royalties
        uint96 royaltyFeeInBips       // valor da taxa de royalties em basis points (ex: 500 = 5%)
    )
        ERC721("FutPass Ticket", "FTP")
        Ownable(msg.sender)
    {
        _setDefaultRoyalty(royaltyReceiver, royaltyFeeInBips);
    }

    /**
     * @notice Mint de novo ingresso
     * @param to endereço do usuário
     * @param sector setor do estádio
     * @param validFrom início da validade (timestamp)
     * @param validUntil fim da validade (timestamp)
     * @param tokenURI URI com metadados do ingresso (imagem, QR, etc)
     */
    function mint(
        address to,
        string memory sector,
        uint256 clubId,
        uint256 validFrom,
        uint256 validUntil,
        string memory tokenURI
    ) external onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        passInfo[tokenId] = PassInfo({
            sector: sector,
            clubId: clubId,
            validFrom: validFrom,
            validUntil: validUntil
        });
    }

    /**
     * @notice Verifica se o ingresso está dentro do período de validade
     */
    function isValid(uint256 tokenId) public view returns (bool) {
        PassInfo memory info = passInfo[tokenId];
        return block.timestamp >= info.validFrom && block.timestamp <= info.validUntil;
    }

    /**
     * @notice Retorna dados do ingresso
     */
    function getPassInfo(uint256 tokenId) public view returns (
        string memory sector,
        uint256 clubId,
        uint256 validFrom,
        uint256 validUntil
    ) {
        PassInfo memory info = passInfo[tokenId];
        return (info.sector, info.clubId, info.validFrom, info.validUntil);
    }

    /**
     * @notice Atualiza a taxa e o destinatário dos royalties
     * @dev Somente o owner (admin)
     */
    function setDefaultRoyalty(address receiver, uint96 feeInBips) external onlyOwner {
        _setDefaultRoyalty(receiver, feeInBips);
    }

    /**
     * @dev Declara suporte às interfaces ERC721, ERC2981
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
