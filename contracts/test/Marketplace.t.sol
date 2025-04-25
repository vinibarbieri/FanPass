// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Test.sol";
import "../src/Marketplace.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MockTicketNFT is IERC721 {
    mapping(uint256 => address) public owners;
    mapping(uint256 => address) public approvals;
    mapping(address => mapping(address => bool)) private operatorApprovals;
    uint256 public tokenIdCounter;

    function mint(address to) external returns (uint256) {
        tokenIdCounter++;
        owners[tokenIdCounter] = to;
        return tokenIdCounter;
    }

    function ownerOf(uint256 tokenId) external view override returns (address) {
        return owners[tokenId];
    }

    function approve(address to, uint256 tokenId) external override {
        approvals[tokenId] = to;
    }

    function getApproved(uint256 tokenId) external view override returns (address) {
        return approvals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) external view override returns (bool) {
        return operatorApprovals[owner][operator];
    }

    function setApprovalForAll(address operator, bool approved) external override {
        operatorApprovals[msg.sender][operator] = approved;
    }

    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(owners[tokenId] == from, "Not owner");
        require(
            msg.sender == from ||
            approvals[tokenId] == msg.sender ||
            operatorApprovals[from][msg.sender],
            "Not approved"
        );
        owners[tokenId] = to;
    }


    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address, address, uint256, bytes calldata) external pure override {}

    // Simula o método custom do ITicketNFT
    function getPassInfo(uint256) external pure returns (
        uint256 clubId,
        string memory setor,
        uint256 validFrom,
        uint256 validTo
    ) {
        return (1, "Setor A", 0, 9999999999);
    }

    // Extra: necessário para compatibilidade
    function balanceOf(address) external pure override returns (uint256) {
        return 1;
    }

    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return interfaceId == type(IERC721).interfaceId;
    }
}

contract MockERC20 is IERC20 {
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowance;

    string public name = "Fan Token";
    string public symbol = "FT";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    constructor() {
        totalSupply = 1_000_000 ether;
        balances[msg.sender] = totalSupply;
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        require(balances[msg.sender] >= amount, "Not enough balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(balances[from] >= amount, "Not enough balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        balances[from] -= amount;
        balances[to] += amount;
        allowance[from][msg.sender] -= amount;
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return balances[account];
    }

    // function allowance(address owner, address spender) external view override returns (uint256) {
    //     return allowance[owner][spender];
    // }
}


contract MarketplaceInitTest is Test {
    Marketplace public marketplace;
    MockTicketNFT public nft;
    MockERC20 public fanToken;

    address public owner = makeAddr("OWNER");
    address public user = makeAddr("USER");
    address public user2 = makeAddr("USER2");
    address public buyer = makeAddr("BUYER");
    address public platform = makeAddr("PLATFORM");
    address public clubReceiver = makeAddr("CLUB_RECEIVER");

    error OwnableUnauthorizedAccount(address caller);


    function setUp() public {
        vm.startPrank(owner);
        nft = new MockTicketNFT();
        fanToken = new MockERC20();
        marketplace = new Marketplace(address(nft), platform, owner);
        marketplace.setFanToken(1, address(fanToken));
        marketplace.setClubReceiver(1, clubReceiver);
        marketplace.setPlatformFee(900);        
        vm.stopPrank();

        // Mint NFT para user e aprovar
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        // Buyer recebe token ERC20 e aprova marketplace
        vm.prank(owner);
        fanToken.transfer(buyer, 100 ether);
        vm.prank(buyer);
        fanToken.approve(address(marketplace), 100 ether);
    }

    function testSetFanToken() public {
        vm.prank(owner);
        marketplace.setFanToken(1, address(fanToken));

        assertEq(marketplace.getFanToken(1), address(fanToken));
    }

    function testSetClubReceiver() public {
        vm.prank(owner);
        marketplace.setClubReceiver(1, clubReceiver);

        assertEq(marketplace.getClubReceiver(1), clubReceiver);
    }

    function testSetPlatformReceiver() public {
        vm.prank(owner);
        marketplace.setPlatformReceiver(platform);

        assertEq(marketplace.getPlatformReceiver(), platform);
    }

    function testSetPlatformFee() public {
        vm.prank(owner);
        marketplace.setPlatformFee(100);

        assertEq(marketplace.getPlatformFee(), 100);
    }

    function testSetOwner() public {
        vm.prank(owner);
        marketplace.setOwner(platform);

        assertEq(marketplace.getOwner(), platform);
    }

    function testSetPlatformFeeTooLow() public {
        vm.prank(owner);
        vm.expectRevert(Marketplace.InvalidFee.selector);
        marketplace.setPlatformFee(0);
    }

    function testSetPlatformFeeTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(Marketplace.InvalidFee.selector);
        marketplace.setPlatformFee(1001);
    }

    function testSetPlatformFeeInvalid() public {
        vm.prank(owner);
        vm.expectRevert(Marketplace.InvalidFee.selector);
        marketplace.setPlatformFee(1100);
    }

    function testListForSaleValid() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);
    }

    function testListForSaleAlreadyListed() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        vm.expectRevert(Marketplace.AlreadyListed.selector);
        vm.prank(user);
        marketplace.listForSale(tokenId, 2 ether);
    }

    function testBuyTicketValid() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        // Verifica que está listado corretamente ANTES da compra
        (Marketplace.SaleListing memory saleBefore, ) = marketplace.getActiveListings(tokenId);
        assertEq(saleBefore.seller, user);
        assertEq(saleBefore.price, 1 ether);
        assertTrue(saleBefore.active); // ✅ Corrigido

        vm.prank(buyer);
        marketplace.buy(tokenId);

        // Verifica que o NFT foi transferido para o comprador
        assertEq(nft.ownerOf(tokenId), buyer);

        // Verifica que o listing foi removido após a compra
        (Marketplace.SaleListing memory saleAfter, ) = marketplace.getActiveListings(tokenId);
        assertEq(saleAfter.seller, address(0));
        assertEq(saleAfter.price, 0);
        assertFalse(saleAfter.active);
    }


    function testBuyTicketNotListed() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotListed.selector);
        vm.prank(buyer);
        marketplace.buy(tokenId);
    }

    function testBuyTicketNotEnoughFunds() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 9999 ether);

        vm.expectRevert(Marketplace.InsufficientBalance.selector);
        vm.prank(buyer);
        marketplace.buy(tokenId);
    }

    function testBuyTicketAlreadySold() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        vm.prank(buyer);
        marketplace.buy(tokenId);

        vm.expectRevert(Marketplace.NotListed.selector);
        vm.prank(buyer);
        marketplace.buy(tokenId);
    }

    function testBuyTicketRented() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        // CORRETO: listar para aluguel
        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 5, 1); // preço, max e min dias

        // CORRETO: agora alguém aluga
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);

        // Agora o token está alugado. Vamos tentar comprar.
        vm.expectRevert(Marketplace.NotListed.selector); // erro real que ocorre no listForSale
        vm.prank(buyer);
        marketplace.buy(tokenId);
    }


    function testCancelSaleListingValid() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        (Marketplace.SaleListing memory sale, ) = marketplace.getActiveListings(tokenId);
        assertEq(sale.seller, user);
        assertEq(sale.price, 1 ether);

        vm.prank(user);
        marketplace.cancelSaleListing(tokenId);
    }

    function testCancelSaleListingNotListed() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotSeller.selector);
        vm.prank(user);
        marketplace.cancelSaleListing(tokenId);
    }

    function testCancelSaleListingNotOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotSeller.selector);
        vm.prank(buyer);
        marketplace.cancelSaleListing(tokenId);
    }

    function testCancelSaleListingAlreadySold() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        vm.prank(buyer);
        marketplace.buy(tokenId);

        vm.expectRevert(Marketplace.NotSeller.selector);
        vm.prank(user);
        marketplace.cancelSaleListing(tokenId);
    }

    function testCancelRentListingValid() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);

        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 5, 1); // max: 5 dias, min: 1 dia

        vm.prank(user);
        marketplace.cancelRentListing(tokenId);

        (, Marketplace.RentListing memory rent) = marketplace.getActiveListings(tokenId);
        assertEq(rent.owner, address(0));
        assertEq(rent.pricePerDay, 0);
        assertFalse(rent.active);
    }


    function testCancelRentListingNotListed() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotOwner.selector);
        vm.prank(user);
        marketplace.cancelRentListing(tokenId);
    }

    function testCancelRentListingNotOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotOwner.selector);
        vm.prank(buyer);
        marketplace.cancelRentListing(tokenId);
    }

    function testCancelRentListingAlreadyRented() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 10, 1);

        // Corrigir aqui: transferir tokens e aprovar
        vm.prank(owner);
        fanToken.transfer(buyer, 10 ether);

        vm.prank(buyer);
        fanToken.approve(address(marketplace), 10 ether);

        // Agora sim o buyer pode alugar
        vm.prank(buyer);
        marketplace.rent(tokenId, 1); // 1 dia

        // Agora a tentativa de cancelar a listing deve falhar, pois já foi alugada
        vm.expectRevert(Marketplace.NotOwner.selector);
        vm.prank(user);
        marketplace.cancelRentListing(tokenId);
    }

    function testRentValid() public {
        // 1. USER minta o token
        vm.prank(user);
        uint256 tokenId = nft.mint(user);

        // 2. USER aprova o marketplace
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        // 3. USER lista o token para aluguel
        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 10, 1); // preço/dia, max dias, min dias

        // 4. OWNER transfere tokens pro BUYER
        vm.prank(owner);
        fanToken.transfer(buyer, 10 ether);

        // 5. BUYER aprova o marketplace
        vm.prank(buyer);
        fanToken.approve(address(marketplace), 10 ether);

        // 6. BUYER aluga o token por 1 dia
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);

        // 7. Verifica que a info de aluguel está correta
        Marketplace.RentInfo memory rentInfo = marketplace.getActiveRentInfo(tokenId);
        assertEq(rentInfo.owner, user);
        assertEq(rentInfo.renter, buyer);
        assertTrue(rentInfo.active);
        assertGt(rentInfo.expiresAt, block.timestamp);

        // 8. Verifica que o NFT foi transferido para o marketplace
        assertEq(nft.ownerOf(tokenId), address(marketplace));

        // 9. Verifica que o listing de aluguel foi limpo (apenas checa se não está mais ativo)
        (, Marketplace.RentListing memory rentAfter) = marketplace.getActiveListings(tokenId);
        assertFalse(rentAfter.active);
    }




    function testRentNotListed() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotListed.selector);
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);
    }

    function testRentNotEnoughFunds() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 999 ether, 10, 1);

        vm.expectRevert(Marketplace.InsufficientBalance.selector);
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);
    }

    function testRentAlreadyRented() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 10, 1);

        vm.prank(buyer);
        marketplace.rent(tokenId, 1);

        vm.expectRevert(Marketplace.NotListed.selector);
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);
    }

    function testRentAlreadySold() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 10, 1);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        vm.prank(buyer);
        marketplace.buy(tokenId);

        vm.expectRevert(Marketplace.NotListed.selector);
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);
    }

    function testRentNotOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotListed.selector);
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);
    }

    function testEditSaleListingValid() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        vm.prank(user);
        marketplace.editSaleListing(tokenId, 2 ether);

        (Marketplace.SaleListing memory sale, ) = marketplace.getActiveListings(tokenId);
        assertEq(sale.seller, user);
        assertEq(sale.price, 2 ether);
    }

    function testEditSaleListingNotListed() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotSeller.selector);
        vm.prank(user);
        marketplace.editSaleListing(tokenId, 2 ether);
    }

    function testEditSaleListingNotOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotSeller.selector);
        vm.prank(buyer);
        marketplace.editSaleListing(tokenId, 2 ether);
    }

    function testEditSaleListingAlreadySold() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForSale(tokenId, 1 ether);

        vm.prank(buyer);
        marketplace.buy(tokenId);

        vm.expectRevert(Marketplace.NotSeller.selector);
        vm.prank(buyer);
        marketplace.editSaleListing(tokenId, 2 ether);
    }

    function testEditRentListingValid() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 8, 2);

        vm.prank(user);
        marketplace.editRentListing(tokenId, 2 ether, 10, 1);

        (, Marketplace.RentListing memory rent) = marketplace.getActiveListings(tokenId);
        assertEq(rent.owner, user);
        assertEq(rent.pricePerDay, 2 ether);
    }

    function testEditRentListingNotListed() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotOwner.selector);
        vm.prank(user);
        marketplace.editRentListing(tokenId, 2 ether, 10, 1);
    }

    function testEditRentListingNotOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.expectRevert(Marketplace.NotOwner.selector);
        vm.prank(buyer);
        marketplace.editRentListing(tokenId, 2 ether, 10, 1);
    }

    function testWithdrawRentedNFTValid() public {
        // 1. Mint e aprova
        vm.prank(user);
        uint256 tokenId = nft.mint(user);

        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        // 2. Listar para aluguel
        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 10, 1);

        // 3. Transferir tokens e aprovar
        vm.prank(owner);
        fanToken.transfer(buyer, 10 ether);

        vm.prank(buyer);
        fanToken.approve(address(marketplace), 10 ether);

        // 4. Alugar
        vm.prank(buyer);
        marketplace.rent(tokenId, 1);

        // 5. Avança o tempo para depois do aluguel (1 dia)
        vm.warp(block.timestamp + 2 days); // > 1 dia para satisfazer StillRented()

        // 6. Quem retira pode ser o renter (buyer), owner (user) ou executor
        vm.prank(buyer);
        marketplace.withdrawRentedNFT(tokenId);

        // 7. Verificar que foi removido
        Marketplace.RentInfo memory info = marketplace.getActiveRentInfo(tokenId);
        assertEq(info.active, false);

        // Verifica que o NFT voltou para o `owner`
        assertEq(nft.ownerOf(tokenId), user);
    }

    function testWithdrawRentedNFTStillRented() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 10, 1);

        vm.expectRevert(Marketplace.NotOwner.selector);
        vm.prank(user);
        marketplace.withdrawRentedNFT(tokenId);
    }

    function testWithdrawRentedNFTNotOwner() public {
        vm.prank(user);
        uint256 tokenId = nft.mint(user);
        vm.prank(user);
        nft.approve(address(marketplace), tokenId);

        vm.prank(user);
        marketplace.listForRent(tokenId, 1 ether, 10, 1);

        vm.prank(buyer);
        marketplace.rent(tokenId, 1);

        vm.expectRevert(Marketplace.NotOwner.selector);
        vm.prank(user2);
        marketplace.withdrawRentedNFT(tokenId);
    }


}
