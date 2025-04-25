// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.23;

import "../lib/forge-std/src/Script.sol";
import "../src/TicketNFT.sol";

contract DeployTicketNFT is Script {
    function run() external {
        address clubReceiver = vm.envAddress("CLUB_ADDRESS"); // quem recebe os royalties
        uint96 royaltyFee = 500; // 5%

        vm.startBroadcast();
        new TicketNFT(clubReceiver, royaltyFee);
        vm.stopBroadcast();
    }
}
