const assertRevert = require('../helpers/assertRevert');
const BinkdToken = artifacts.require('./BinkdToken.sol');

contract('BinkdToken', (accounts) => {
    
    let maxTokenSupply;
    
    /* token settings */
    const name = "Binkd Token";
    const symbol = "BINK";
    const decimals = 18;

        maxTokenSupply = 1000e18; //max supply of 1000 tokens in dev mode
        // maxTokenSupply = 625000000e18;
    
    /* account settings */
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    let token;
  
    beforeEach(async () => {
      token = await BinkdToken.new(maxTokenSupply);
    });
    
    describe('Token settings on creation', () => {
        
        it('should start with the correct maxSupply', async () => {
            let _cap = await token.cap();
            assert.strictEqual(_cap.toNumber(), maxTokenSupply);
        });

        it('should have the correct settings on creation', async () => {
            let tokenName = await token.name();
            assert.equal(tokenName, name);

            let tokenSymbol = await token.symbol();
            assert.equal(tokenSymbol, symbol);

            let tokenDecimals = await token.decimals();
            assert.equal(tokenDecimals, decimals);            
        });

        it('should be in paused and non-transferable state', async () => {
            let paused = await token.paused();
            assert.equal(paused, true);
        });

    });

    describe('Token minting behaviors', () => {
        
        it('should mint when amount is less than cap', async () => {
            const result = await token.mint(accounts[0], 100);
            assert.equal(result.logs[0].event, 'Mint');
        });

        it('should fail to mint after cap is reached', async () => {
            await token.mint(accounts[0], maxTokenSupply);
            await assertRevert(token.mint(accounts[0], 1));
        });        

    });

    describe('Token State Changes', () => {

        it('should be able to unpause when its paused', async () => {
            let result = await token.unpause();
            assert.equal(result.logs[0].event, "Unpause");
            
            let paused = await token.paused();
            assert.equal(paused, false);
        }); 

        it('should be able to pause again when its unpaused', async () => {
            let result = await token.unpause();
            assert.equal(result.logs[0].event, "Unpause");
            
            let result2 = await token.pause();
            assert.equal(result2.logs[0].event, "Pause");
        }); 

        it('should not be possible for anyone other than owner to unpause', async () => {
            await assertRevert(token.unpause({from: user1}));
        });

        it('should be able to transfer if transfers are unpaused', async () => {
            let result = await token.unpause();
            assert.equal(result.logs[0].event, "Unpause");
    
            const result2 = await token.mint(accounts[0], 100);
            assert.equal(result2.logs[0].event, 'Mint');
            
            let transferResult = await token.transfer(accounts[1], 50, {from: accounts[0]});
            let balance0 = await token.balanceOf(accounts[0]);
            assert.equal(balance0, 50);
        
            let balance1 = await token.balanceOf(accounts[1]);
            assert.equal(balance1, 50);
        }); 

    });

});