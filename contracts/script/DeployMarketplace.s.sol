// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Script.sol";
import "../src/Marketplace.sol";

contract DeployMarketplace is Script {
    function run() external {
        address ticketNFT = vm.envAddress("TICKET_NFT_ADDRESS");
        address platformReceiver = vm.envAddress("PLATFORM_RECEIVER");

        vm.startBroadcast();

        Marketplace marketplace = new Marketplace(ticketNFT, platformReceiver);

        vm.stopBroadcast();

        console.log("Marketplace deployed at:", address(marketplace));
    }
}
