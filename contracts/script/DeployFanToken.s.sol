// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Script.sol";
import "../src/FanToken.sol";

contract DeployFanToken is Script {
    function run() external {
        vm.startBroadcast();

        new FanToken();

        vm.stopBroadcast();
    }
}
