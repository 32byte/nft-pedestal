// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bidding {
  address private _owner;
  IERC20 private _token;

  uint256 private _tokenId;
  uint256 private _highestBid;

  constructor(address token) {
    _owner = payable(msg.sender);
    _token = IERC20(token);

    _tokenId = 0;
    _highestBid = 0;
  }

  function bid(uint256 amount, uint256 newTokenId) public {
    require(amount > _highestBid, "You need to overbid the last bid");

    uint256 allowance = _token.allowance(msg.sender, address(this));
    require(allowance >= amount, "Allowance not high enough");

    _token.transferFrom(msg.sender, address(this), amount);
    _tokenId = newTokenId;
    _highestBid = amount;
  }

  function tokenId() public view returns(uint256) {
    return _tokenId;
  }

  function highestBid() public view returns(uint256) {
    return _highestBid;
  }

  function withdraw() public {
    require(msg.sender == _owner, "Only the owner can withdraw!");

    uint256 balance = _token.balanceOf(address(this));
    require(balance > 0, "You can only withdraw when the contract has more than 0 tokens");

    _token.transfer(_owner, balance);
  }
}