// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Token Factory
*/

contract TokenFactory {
    struct TokenDetails {
        string name; // token name
        string symbol; // token symbol
        uint256 totalSupply; // initial supply
        string logoUrl; // url to token logo
    }

    mapping(address => TokenDetails) public tokens; // address token contract to its details

    event TokenCreated(address indexed creator, address tokenAddress);
    // indexed; parameter becmes part of event's topic; creator address becomes searchable
        /**
    * @dev Create token
    */
    function createToken(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        string memory _logoUrl
    ) public returns (address) {
        MyToken newToken = new MyToken(_name, _symbol, _initialSupply, msg.sender);
        tokens[address(newToken)] = TokenDetails({
            name: _name,
            symbol: _symbol,
            totalSupply: _initialSupply,
            logoUrl: _logoUrl
        });

        emit TokenCreated(msg.sender, address(newToken));
        return address(newToken);
    }
}

contract MyToken is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _creator
    ) ERC20(_name, _symbol) {
        _mint(_creator, _initialSupply * (10 ** uint256(decimals())));
    }
}