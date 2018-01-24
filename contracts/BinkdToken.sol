pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';

/**
 * @title BinkdToken - This is the token contract for Binkd Project
 * @author Mandy Singh
 * @dev BinkdToken is a CappedToken so the total supply is always finite
 * The token is also PausableToken so we can disable token trading till end of crowdsale
 * There will be a max cap of 625mn tokens
 * Tokens offered through presale and crowdsale would be 250mn (40%)
 * 40% would be at the end of crowdsale and transferred to the Binkd Token Reserve
 * Presale participants would be offered 33% extra tokens than crowdsale participants
 * Unsold binkd tokens would be burnt as this is implemented as Mintable token
 * and tokens not sold would not be minted
 */
contract BinkdToken is CappedToken, PausableToken {

  string public constant name = "Binkd Token";
  string public constant symbol = "BINK";
  uint8 public constant decimals = 18;

  function BinkdToken(uint256 _cap) 
    CappedToken(_cap) public {
      paused = true;
  }
}
