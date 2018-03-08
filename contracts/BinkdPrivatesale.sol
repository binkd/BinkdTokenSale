pragma solidity ^0.4.18;

import './BinkdToken.sol';
import './Whitelist.sol';

import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

/**
 * @title BinkdPrivatesale - This is the private sale contract for Binkd Project
 * @author Mandy Singh
 * @dev BinkdPrivatesale is a Capped Crowdsale
 * The presale is also Pausable
 * There will be a max cap of 4000 ethers for the presale after which no investments would be accepted.
 * Tokens offered through privatesale, presale and crowdsale would be 250mn (40%)
 * 40% would be at the end of crowdsale and transferred to the Binkd Token Reserve
 * Private sale participants would be offered 50% extra tokens
 * Minimum investment amount during presale would be 5 ether with no maximum limit
 */
contract BinkdPrivatesale is CappedCrowdsale, Pausable, Whitelist {

  uint256 public minimalInvestmentInWei = 5 ether;
  address public tokenAddress;

  BinkdToken public binkdToken;

  event InitialDateReset(uint256 startTime, uint256 endTime);
  event InitialRateChange(uint256 rate, uint256 cap, uint256 minimalInvestment);

  function BinkdPrivatesale(uint256 _cap, uint256 _startTime, uint256 _endTime, uint256 _rate, address _wallet, address _tokenAddress) 
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
    bool whitelisted = addressIsWhitelisted(msg.sender);

    return super.validPurchase() && minimalInvested && !paused && whitelisted;
  }

  /**
    * @dev Reset start and end date/time for this Presale.
    * @param _startTime change presale start time
    * @param _endTime change presale end period
    */
  function setPrivateSaleDates(uint256 _startTime, uint256 _endTime) public onlyOwner returns (bool) { 
      require(startTime > block.timestamp);
      require(_startTime >= now);
      require(_endTime >= _startTime);

      startTime = _startTime;
      endTime = _endTime;

      InitialDateReset(startTime, endTime);
      return true;
  }

  /**
    * @dev Sets the token conversion rate
    * @param _rateInWei - Price of 1 Binkd token in Wei. 
    * @param _capInWei - Cap of the Presale in Wei. 
    * @param _minimalInvestmentInWei - Minimal investment in Wei. 
    */
  function setRate(uint256 _rateInWei, uint256 _capInWei, uint256 _minimalInvestmentInWei) public onlyOwner returns (bool) { 
      require(startTime >= block.timestamp); // can't update anymore if sale already started
      require(_rateInWei > 0);
      require(_capInWei > 0);
      require(_minimalInvestmentInWei > 0);

      rate = _rateInWei;
      cap = _capInWei;
      minimalInvestmentInWei = _minimalInvestmentInWei;

      InitialRateChange(rate, cap, minimalInvestmentInWei);
      return true;
  }

  // set the token owner to contract owner
  function reTransferTokenOwnership() onlyOwner public { 
      binkdToken.transferOwnership(owner);
  }
  
}