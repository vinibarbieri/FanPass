// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract FanToken is ERC20, ERC20Permit {
    constructor()
        ERC20("FanToken", "FAN")
        ERC20Permit("FanToken")
    {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
