pragma solidity ^0.4.18;

import './BinkdToken.sol';

import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

/**
 * @title BinkdPresale - This is the presale contract for Binkd Project
 * @author Mandy Singh
 * @dev BinkdPresale is a Capped Crowdsale
 * The presale is also Pausable
 * There will be a max cap of 2000 ethers for the presale after which no investments would be accepted.
 * Tokens offered through presale and crowdsale would be 250mn (40%)
 * 40% would be at the end of crowdsale and transferred to the Binkd Token Reserve
 * Presale participants would be offered 33% extra tokens than crowdsale participants
 * Minimum investment amount during presale would be 1 ether and maximum 350 ether
 */
contract BinkdPresale is CappedCrowdsale, Pausable {

  uint256 public minimalInvestmentInWei = .5 ether;
  uint256 public maximumInvestmentInWei = 35 ether;
  address public tokenAddress;

  BinkdToken public binkdToken;

  event InitialDateReset(uint256 startTime, uint256 endTime);

  function BinkdPresale(uint256 _cap, uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address _tokenAddress) 
    CappedCrowdsale(_cap)
    Crowdsale(_startTime, _endTime, _rate, _wallet) public {
      tokenAddress = _tokenAddress;
      token = createTokenContract();
    }

  function createTokenContract() internal returns (MintableToken) {
    binkdToken = BinkdToken(tokenAddress);
    return BinkdToken(tokenAddress);
  }  

  // overriding Crowdsale#validPurchase to add extra cap logic
  // @return true if investors can buy at the moment
  function validPurchase() internal view returns (bool) {
    bool minimalInvested = msg.value >= minimalInvestmentInWei;
    bool maximumInvested = msg.value <= maximumInvestmentInWei;

    return super.validPurchase() && minimalInvested && maximumInvested && !paused;
  }

  /**
    * @dev Reset start and end date/time for this Presale.
    * @param _startTime change presale start time
    * @param _endTime change presale end period
    */
  function setPresaleDates(uint256 _startTime, uint256 _endTime) public onlyOwner returns (bool) { 
      require(startTime > block.timestamp);
      require(_startTime >= now);
      require(_endTime >= _startTime);

      startTime = _startTime;
      endTime = _endTime;

      InitialDateReset(startTime, endTime);
      return true;
  }

  // set the token owner to contract owner
  function reTransferTokenOwnership() onlyOwner public { 
      binkdToken.transferOwnership(owner);
  }
  
}