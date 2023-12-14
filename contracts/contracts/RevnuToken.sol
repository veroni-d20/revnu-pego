// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract RevnuToken is ERC20, ERC20Burnable, Ownable {
    uint256 public s_maxSupply = 10000000000000000000000;

    constructor() ERC20("RevnuToken", "RVTK") {
        _mint(msg.sender, s_maxSupply);
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}