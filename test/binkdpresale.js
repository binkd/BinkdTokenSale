const assertRevert   = require('../helpers/assertRevert');
const BinkdToken   = artifacts.require('./BinkdToken.sol');
const BinkdPresale = artifacts.require('./BinkdPresale.sol');

contract('BinkdPresale', (accounts) => {
    
    /* account settings */
    const admin = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];

    /* presale settings */
    const startDate  = 1518282000;
    const endDate    = 1519491600;
    const rate       = new web3.BigNumber(13300);
    const presaleCap = 2000e18;
    const wallet     = accounts[0];

    /* token settings */
    const maxTokenSupply = 625000000e18;

    it ('should be possible to create a new Presale contract', async () => { 
        binkdToken = await BinkdToken.new(maxTokenSupply);
        assert.isNotNull(binkdToken);

        binkdPresale = await BinkdPresale.new(presaleCap, startDate, endDate, rate, wallet, binkdToken.address);
        assert.isNotNull(binkdPresale);
    });    

    it ('should start on Saturday February 10, 2018 12:00:00 (pm) EST', async () => { 
        let presaleStartTime = await binkdPresale.startTime();
        assert.equal(presaleStartTime.toNumber(), startDate);
    });

    it ('should end on Saturday February 24, 2018 12:00:00 (pm) EST', async () => { 
        var presaleEndTime = await binkdPresale.endTime();
        assert.strictEqual(presaleEndTime.toNumber(), endDate);
    });

    it ('should be possible to pause the presale', async () => { 
        var paused = await binkdPresale.paused();
        assert.equal(false, paused);

        var result = await binkdPresale.pause();
        assert.equal('Pause', result.logs[0].event);
        
        paused = await binkdPresale.paused();
        assert.equal(true, paused);
    });

    it ('should be possible to unpause the presale', async () => { 
        var paused = await binkdPresale.paused();
        assert.equal(true, paused);

        var result = await binkdPresale.unpause();
        assert.equal('Unpause', result.logs[0].event);
        
        paused = await binkdPresale.paused();
        assert.equal(false, paused);
    });

    it ('should be possible to transfer token ownership to this contract address', async () => { 
            
        var result = await binkdToken.transferOwnership(binkdPresale.address);
        var newOwner = await binkdToken.owner();
        assert.equal('OwnershipTransferred', result.logs[0].event);
        assert.equal(newOwner, binkdPresale.address);
    });

    it ('should be possible to reset token ownership to the contract creator', async () => { 
            
        var result = await binkdPresale.reTransferTokenOwnership();
        assert.equal('OwnershipTransferred', result.logs[0].event);
        var newOwner = await binkdToken.owner();
        assert.equal(newOwner, admin);
    });

    it('should be ended only after end', async function () {
        // let ended = await binkdPresale.hasEnded();
        // assert.equal(false, ended);
        // await increaseTimeTo(endDate);
        // ended = await binkdPresale.hasEnded();
        // assert.equal(true, ended);
    });

});