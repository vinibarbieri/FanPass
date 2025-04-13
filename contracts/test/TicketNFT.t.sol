// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TicketNFT.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFTTest is Test {
    TicketNFT public ticket;
    address public club;
    address public user;

    function setUp() public {
        club = makeAddr("CLUB");
        user = makeAddr("USER");
        ticket = new TicketNFT(club, 500); // 5% royalty
    }

    function testMintAndReadPassInfo() public {
        // Define dados
        string memory sector = "leste";
        uint256 clubId = 1;
        uint256 start = block.timestamp;
        uint256 end = block.timestamp + 30 days;
        string memory uri = "ipfs://token-uri";

        // Mint para o user
        ticket.mint(user, sector, clubId, start, end, uri);

        // Checa propriedade
        assertEq(ticket.ownerOf(0), user);

        // Checa PassInfo
        (string memory s, uint256 c, uint256 f, uint256 u) = ticket.getPassInfo(0);
        assertEq(s, sector);
        assertEq(c, clubId);
        assertEq(f, start);
        assertEq(u, end);

        // Checa validade
        assertTrue(ticket.isValid(0));
    }

    function testRoyaltyInfo() public {
        ticket.mint(user, "camarote", 2, block.timestamp, block.timestamp + 1 days, "ipfs://x");

        uint256 salePrice = 1 ether;
        (address receiver, uint256 amount) = ticket.royaltyInfo(0, salePrice);

        assertEq(receiver, club);
        assertEq(amount, salePrice * 500 / 10_000); // 5%
    }

    function testSupportsInterfaces() public view {
        assertTrue(ticket.supportsInterface(type(IERC721).interfaceId));
        assertTrue(ticket.supportsInterface(type(IERC2981).interfaceId));
    }

    function test_RevertIf_MintByNonOwner() public {
        // Tenta mintar usando outro address (vai falhar por `onlyOwner`)
        address notOwner = makeAddr("NOT_OWNER");

        vm.prank(notOwner);
        vm.expectRevert();

        ticket.mint(
            notOwner,
            "leste",
            1,
            block.timestamp,
            block.timestamp + 30 days,
            "ipfs://token-uri"
        );
    }

    function testSetDefaultRoyalty() public {
        ticket.setDefaultRoyalty(address(0xabc), 1000); // 10%

        ticket.mint(user, "vip", 2, block.timestamp, block.timestamp + 10 days, "ipfs://q");
        (address receiver, uint256 royalty) = ticket.royaltyInfo(0, 2 ether);

        assertEq(receiver, address(0xabc));
        assertEq(royalty, 2 ether * 1000 / 10_000); // 10%
    }
}